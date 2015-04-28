<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Abstract class describing Inbound Message Handlers.
 *
 * @package    core_message
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace core\message\inbound;

/**
 * Abstract class describing Inbound Message Handlers.
 *
 * @copyright  2014 Andrew NIcols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 *
 * @property-read int $id The ID of the handler in the database
 * @property-read string $component The component of this handler
 * @property-read int $defaultexpiration Default expiration of new addresses for this handler
 * @property-read string $description The description of this handler
 * @property-read string $name The name of this handler
 * @property-read bool $validateaddress Whether the address validation is a requiredment
 * @property-read bool $enabled Whether this handler is currently enabled
 * @property-read string $classname The name of handler class
 */
abstract class handler {

    /**
     * @var int $id The id of the handler in the database.
     */
    private $id = null;

    /**
     * @var string $component The component to which this handler belongs.
     */
    private $component = '';

    /**
     * @var int $defaultexpiration The default expiration time to use when created a new key.
     */
    private $defaultexpiration = WEEKSECS;

    /**
     * @var bool $validateaddress Whether to validate the sender address when processing this handler.
     */
    private $validateaddress = true;

    /**
     * @var bool $enabled Whether this handler is currently enabled.
     */
    private $enabled = false;

    /**
     * @var $accessibleproperties A list of the properties which can be read.
     */
    private $accessibleproperties = array(
        'id' => true,
        'component' => true,
        'defaultexpiration' => true,
        'validateaddress' => true,
        'enabled' => true,
    );

    /**
     * Magic getter to fetch the specified key.
     *
     * @param string $key The name of the key to retrieve
     */
    public function __get($key) {
        // Some properties have logic behind them.
        $getter = 'get_' . $key;
        if (method_exists($this, $getter)) {
            return $this->$getter();
        }

        // Check for a commonly accessibly property.
        if (isset($this->accessibleproperties[$key])) {
            return $this->$key;
        }

        // Unknown property - bail.
        throw new \coding_exception('unknown_property ' . $key);
    }

    /**
     * Set the id name.
     *
     * @param int $id The id to set
     * @return int The newly set id
     */
    public function set_id($id) {
        return $this->id = $id;
    }

    /**
     * Set the component name.
     *
     * @param string $component The component to set
     * @return string The newly set component
     */
    public function set_component($component) {
        return $this->component = $component;
    }

    /**
     * Whether the current handler allows changes to the address validation
     * setting.
     *
     * By default this will return true, but for some handlers it may be
     * necessary to disallow such changes.
     *
     * @return boolean
     */
    public function can_change_validateaddress() {
        return true;
    }

    /**
     * Set whether validation of the address is required.
     *
     * @param bool $validateaddress The new state of validateaddress
     * @return bool
     */
    public function set_validateaddress($validateaddress) {
        return $this->validateaddress = $validateaddress;
    }

    /**
     * Whether the current handler allows changes to expiry of the generated email address.
     *
     * By default this will return true, but for some handlers it may be
     * necessary to disallow such changes.
     *
     * @return boolean
     */
    public function can_change_defaultexpiration() {
        return true;
    }

    /**
     * Whether this handler can be disabled (or enabled).
     *
     * By default this will return true, but for some handlers it may be
     * necessary to disallow such changes. For example, a core handler to
     * handle rejected mail validation should not be disabled.
     *
     * @return boolean
     */
    public function can_change_enabled() {
        return true;
    }

    /**
     * Set the enabled name.
     *
     * @param bool $enabled The new state of enabled
     * @return bool
     */
    public function set_enabled($enabled) {
        return $this->enabled = $enabled;
    }

    /**
     * Set the default validity for new keys.
     *
     * @param int $period The time in seconds before a key expires
     * @return int
     */
    public function set_defaultexpiration($period) {
        return $this->defaultexpiration = $period;
    }

    /**
     * Get the non-namespaced name of the current class.
     *
     * @return string The classname
     */
    private function get_classname() {
        $classname = get_class($this);
        if (strpos($classname, '\\') !== 0) {
            $classname = '\\' . $classname;
        }

        return $classname;
    }

    /**
     * Return a description for the current handler.
     *
     * @return string
     */
    protected abstract function get_description();

    /**
     * Return a name for the current handler.
     * This appears in the admin pages as a human-readable name.
     *
     * @return string
     */
    protected abstract function get_name();

    /**
     * Process the message against the current handler.
     *
     * @param \stdClass $record The Inbound Message Handler record
     * @param \stdClass $messagedata The message data
     */
    public abstract function process_message(\stdClass $record, \stdClass $messagedata);

    /**
     * Return the content of any success notification to be sent.
     * Both an HTML and Plain Text variant must be provided.
     *
     * If this handler does not need to send a success notification, then
     * it should return a falsey value.
     *
     * @param \stdClass $messagedata The message data.
     * @param \stdClass $handlerresult The record for the newly created post.
     * @return \stdClass with keys `html` and `plain`.
     */
    public function get_success_message(\stdClass $messagedata, $handlerresult) {
        return false;
    }

    /**
     * Remove quoted message string from the text (NOT HTML) message.
     *
     * @param string $text text message.
     * @param int    $linecount number of lines to remove before quoted text.
     * @return mixed|string
     */
    protected static function remove_quoted_text($messagedata) {
        // Grab the headers.
        $headers = \Horde_Mime_Headers::parseHeaders($messagedata->headers);

        // Totally ignore MSO for the moment.
        if ($headers->getValue('X-MS-Has-Attach') || $headers->getValue('X-MS-TNEF-Correlator')) {
            // Do *not* return the 'best' version, always return PLAIN. Outlook sucks.
            $messagedata->plain = html_to_text($messagedata->plain);
            return self::strip_original_fallback($messagedata);
        }

        // Google don't add any specific headers to their messages. We only
        // want to catch the messages sent using the GMail interface, not
        // those sent using Google SMTP.
        // TODO check App too.
        if (stripos($messagedata->messageid, '@mail.gmail.com>') !== false) {
            if (!empty($messagedata->html) && stripos($messagedata->html, 'gmail_quote') !== false) {
                // This is a gmail message.
                return self::strip_original_for_gmail($messagedata);
            }
        }

        if ($headers->getValue('X-Yahoo-Newman-Property')) {
            // This is a message sent from Yahoo.
            return self::strip_original_for_yahoo($messagedata);
        }

        if (stripos($headers->getValue('X-Mailer'), 'Evolution') !== false) {
            // Evolution.
            return self::strip_original_for_evolution($messagedata);
        }

        // TODO Hotmail
        // TODO Thunderbird
        // TODO Evolution

        // None of the other clients matched. Revert to the standard fallback.
        $content = self::strip_original_fallback($messagedata);
        return self::return_best_version($messagedata, $content);
    }

    /**
     * Try to guess how many lines to remove from the email to delete "xyz wrote on" text. Hard coded numbers for various email
     * clients.
     * Gmail uses two
     * Evolution uses one
     * Thunderbird uses one
     *
     * @param \stdClass $messagedata The Inbound Message record
     *
     * @return int number of lines to chop off before the start of quoted text.
     */
    protected static function get_linecount_to_remove($messagedata) {
        $linecount = 1;
        // Place exceptions which cannot be properly parsed here.
        return $linecount;
    }

    protected static function strip_original_for_gmail($messagedata) {
        // GMail generally creates a valid DOM structure.
        $dom = new \DOMDocument();
        $dom->loadHTML($messagedata->html);

        // Remove any gmail_extra sections. These contain the "On X, Y wrote" sections and original content.
        $dom = self::remove_class_children($dom, 'div', 'gmail_extra');

        return array(self::strip_html_wrapper($dom), FORMAT_HTML);
    }

    protected static function strip_original_for_yahoo($messagedata) {
        // Yahoo generally create a valid DOM structure.
        $dom = new \DOMDocument();
        $dom->loadHTML($messagedata->html);

        // Remove any yahoo_quoted, and separately quoted sections.
        $dom = self::remove_class_children($dom, 'div', 'yahoo_quoted');
        $dom = self::remove_class_children($dom, 'div', 'qtdSeparateBR');

        return array(self::strip_html_wrapper($dom), FORMAT_HTML);
    }

    protected static function strip_original_for_evolution($messagedata) {
        $dom = new \DOMDocument();
        $dom->loadHTML($messagedata->html);

        // Remove any cited blockquotes.
        $dom = self::remove_xpath_children($dom, '//blockquote[contains(@type, "CITE")]');

        if ($bodies = $dom->getElementsByTagName('body')) {
            // There should only ever be one body, but... you never know!
            foreach ($bodies as $body) {
                $body->removeChild($body->lastChild);
            }
        }

        // Convert to HTML and strip the HTML wrapper.
        $content = self::strip_html_wrapper($dom);

        // Now remove the last line.
        $content = substr($content, 0, strrpos($content, "\n"));

        return array($content, FORMAT_HTML);
    }

    protected static function strip_html_wrapper(\DOMDocument $dom) {
        // Strip the html > body sections.
        $innerhtml = '';

        if ($bodies = $dom->getElementsByTagName('body')) {
            // There should only ever be one body, but... you never know!
            foreach ($bodies as $body) {
                foreach ($body->childNodes as $child) {
                    $innerhtml .= $dom->saveHTML($child);
                }
            }
        } else {
            // No body found.
            $innerhtml = $dom->saveHTML();
        }

        $innerhtml = trim($innerhtml);

        return self::remove_html_ids($innerhtml);
    }

    protected static function remove_class_children(\DOMDocument $dom, $tag, $class) {
        return self::remove_xpath_children($dom, '//' . $tag . '[contains(@class, "' . $class . '")]');
    }

    protected static function remove_xpath_children(\DOMDocument $dom, $path) {
        $xpath = new \DOMXPath($dom);

        $found = $xpath->query($path);
        foreach ($found as $node) {
            $node->parentNode->removeChild($node);
        }

        return $dom;
    }

    protected static function remove_html_ids($innerhtml) {
        return preg_replace('/(<[^>]+) id=".*?"/i', '$1', $innerhtml);
    }

    protected static function strip_original_fallback($messagedata) {
        $text = $messagedata->plain;
        $linecount = 1;

        $splitted = preg_split("/\n|\r/", $text);
        if (empty($splitted)) {
            return $text;
        }

        // Remove extra line. "Xyz wrote on...".
        $count = 0;
        $i = 0;
        foreach ($splitted as $i => $element) {
            if (stripos($element, ">") === 0) {
                // Remove 2 non empty line before this.
                for ($j = $i - 1; ($j >= 0); $j--) {
                    $element = $splitted[$j];
                    if (!empty($element)) {
                        unset($splitted[$j]);
                        $count++;
                    }
                    if ($count == $linecount) {
                        break;
                    }
                }
                break;
            }
        }
        $k = $i - $linecount; // Where to start the chopping process.

        // Remove quoted text.
        $splitted = array_slice($splitted, 0, $k);

        // Strip out empty lines towards the end, since a lot of clients add a huge chunk of empty lines.
        $reverse = array_reverse($splitted);
        foreach ($reverse as $i => $line) {
            if (empty($line)) {
                unset($reverse[$i]);
            } else {
                // Non empty line found.
                break;
            }
        }

        $replaced = implode(PHP_EOL, array_reverse($reverse));
        return array(trim($replaced), FORMAT_PLAIN);
    }

    protected static function return_best_version($messagedata, $result) {
        list($content, $format) = $result;
        if ($format === FORMAT_PLAIN &&
                $content === $messagedata->plain &&
                isset($messagedata->html)) {

            // If the content is the same as the plaintext format, may as well return HTML content if we have it.
            $content = $messagedata->html;
            $format = FORMAT_HTML;
        }

        return array($content, $format);
    }
}

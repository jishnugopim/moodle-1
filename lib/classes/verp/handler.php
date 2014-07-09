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
 * Abstract class describing VERP Handlers.
 *
 * @package    core
 * @category   verp
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace core\verp;

/**
 * Abstract class describing VERP Handlers.
 *
 * @copyright  2014 Andrew NIcols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
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
     * @var bool $validate_address Whether to validate the sender address when processing this handler.
     */
    private $validate_address = true;

    /**
     * @var bool $enabled Whether this handler is currently enabled.
     */
    private $enabled = false;

    private $accessibleproperties = array(
        'id' => true,
        'component' => true,
        'validate_address' => true,
        'enabled' => true,
    );

    /**
     * Magic getter to fetch the specified key.
     */
    public function __get($key) {
        // Check for a commonly accessibly property.
        if (isset($this->accessibleproperties[$key])) {
            return $this->$key;
        }

        // Some properties have logic behind them.
        $getter = 'get_' . $key;
        if (method_exists($this, $getter)) {
            return $this->$getter();
        }

        // Unknown property - bail.
        throw new \coding_exception('unknown_property ' . $key);
    }

    /**
     * Set the id name.
     *
     * @return string
     */
    public function set_id($id) {
        return $this->id = $id;
    }

    /**
     * Set the component name.
     *
     * @return string
     */
    public function set_component($component) {
        return $this->component = $component;
    }

    /**
     * Set whether validation of the address is required.
     *
     * @return string
     */
    public function set_validate_address($validate_address) {
        return $this->validate_address = $validate_address;
    }

    /**
     * Set the enabled name.
     * @return string
     */
    public function set_enabled($enabled) {
        return $this->enabled = $enabled;
    }

    /**
     * Get the non-namespaced name of the current class.
     */
    public function get_classname() {
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
    public abstract function get_description();

    /**
     * Process the message against the current handler.
     *
     * @param \stdClass $data
     * @param $headers
     * @param $bodyplain
     * @param $bodyhtml
     * @param $attachments
     */
    public abstract function process_message(\stdClass $data, $headers, $bodyplain, $bodyhtml, $attachments);

}

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
 * This plugin is used to access user's dropbox files
 *
 * @since Moodle 2.0
 * @package    repository_dropbox
 * @copyright  2012 Marina Glancy
 * @copyright  2010 Dongsheng Cai {@link http://dongsheng.org}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once($CFG->dirroot . '/repository/lib.php');

/**
 * Repository to access Dropbox files.
 *
 * @package    repository_dropbox
 * @copyright  2016 Andrew Robert Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class repository_dropbox_base extends repository {

    /**
     * Determine whether the legacy API is available.
     *
     * The Legacy API will be turned off on June 28th 2017.
     * https://blogs.dropbox.com/developers/2016/06/api-v1-deprecated/
     *
     * @return  boolean
     */
    public static function legacy_api_available() {
        return time() < 1498608000;
    }

    /**
     * Determine whether the site meets the SSL requirements of the V2 API.
     *
     * @return  boolean
     */
    public static function meets_v2_requirements() {
        global $CFG;

        $supportsv2 = is_https();
        $supportsv2 = $supportsv2 || !empty($CFG->loginhttps);

        if (!$supportsv2) {
            // For development, they allow a hostname of 'localhost' too.
            $url = new moodle_url('/');
            $supportsv2 = $url->get_host() === 'localhost';
        }

        return $supportsv2;
    }

    /**
     * Return the OAuth 2 Redirect URI.
     *
     * @return  moodle_url
     */
    public static function get_oauth2callbackurl() {
        global $CFG;

        return new moodle_url($CFG->httpswwwroot . '/admin/oauth2callback.php');
    }

    /**
     * Returns the type name of the repository.
     *
     * @return  string
     */
    public function get_typename() {
        return 'dropbox';
    }

    /**
     * Set dropbox options.
     *
     * @param   array       $options    The options being set
     * @return  mixed
     */
    public function set_option($options = array()) {
        if (!empty($options['dropbox_key'])) {
            set_config('dropbox_key', trim($options['dropbox_key']), 'dropbox');
        }
        if (!empty($options['dropbox_secret'])) {
            set_config('dropbox_secret', trim($options['dropbox_secret']), 'dropbox');
        }
        if (!empty($options['dropbox_cachelimit'])) {
            $this->cachelimit = (int)trim($options['dropbox_cachelimit']);
            set_config('dropbox_cachelimit', $this->cachelimit, 'dropbox');
        }
        unset($options['dropbox_key']);
        unset($options['dropbox_secret']);
        unset($options['dropbox_cachelimit']);

        return parent::set_option($options);
    }

    /**
     * Get dropbox options.
     *
     * @param   string      $key        The option to fetch
     * @return  mixed
     */
    public function get_option($key = '') {
        switch ($key) {
            case 'dropbox_key':
            case 'dropbox_secret':
                return trim(get_config('dropbox', $key));
                break;
            case 'dropbox_cachelimit':
                return $this->max_cache_bytes();
                break;
            case '':
            default:
                $options = parent::get_option();
                $options['dropbox_key'] = trim(get_config('dropbox', 'dropbox_key'));
                $options['dropbox_secret'] = trim(get_config('dropbox', 'dropbox_secret'));
                $options['dropbox_cachelimit'] = $this->max_cache_bytes();
                return $options;
        }
    }

    /**
     * Add Plugin settings input to Moodle form
     *
     * @param moodleform $mform Moodle form (passed by reference)
     * @param string $classname repository class name
     */
    public static function type_config_form($mform, $classname = 'repository') {
        parent::type_config_form($mform);
        $key    = get_config('dropbox', 'dropbox_key');
        $secret = get_config('dropbox', 'dropbox_secret');

        if (empty($key)) {
            $key = '';
        }
        if (empty($secret)) {
            $secret = '';
        }

        $strrequired = get_string('required');

        $mform->addElement('text', 'dropbox_key', get_string('apikey', 'repository_dropbox'), array('value'=>$key,'size' => '40'));
        $mform->setType('dropbox_key', PARAM_RAW_TRIMMED);
        $mform->addElement('text', 'dropbox_secret', get_string('secret', 'repository_dropbox'), array('value'=>$secret,'size' => '40'));

        $mform->addRule('dropbox_key', $strrequired, 'required', null, 'client');
        $mform->addRule('dropbox_secret', $strrequired, 'required', null, 'client');
        $mform->setType('dropbox_secret', PARAM_RAW_TRIMMED);
        $str_getkey = get_string('instruction', 'repository_dropbox');
        $mform->addElement('static', null, '',  $str_getkey);

        $mform->addElement('text', 'dropbox_cachelimit', get_string('cachelimit', 'repository_dropbox'), array('size' => '40'));
        $mform->addRule('dropbox_cachelimit', null, 'numeric', null, 'client');
        $mform->setType('dropbox_cachelimit', PARAM_INT);
        $mform->addElement('static', 'dropbox_cachelimit_info', '',  get_string('cachelimit_info', 'repository_dropbox'));

        if (static::meets_v2_requirements()) {
            // This site will work with the V2 API.
            $mform->addElement('static', null,
                    get_string('oauth2title', 'repository_dropbox'),
                    get_string('legacyapihelpsupported', 'repository_dropbox'));
            $mform->addElement('static', null,
                    get_string('oauth2redirecturi', 'repository_dropbox'),
                    static::get_oauth2callbackurl()->out()
                );

            if (static::legacy_api_available()) {
                // The Legacy API is still available so give the user the option of which version to use.
                $mform->addElement('radio', 'legacyapi', get_string('usev2api', 'repository_dropbox'), null, false);
                $mform->addElement('radio', 'legacyapi', get_string('uselegacyapi', 'repository_dropbox'), null, true);
                $mform->setDefault('legacyapi', false);
            } else {
                // The legacy API has been removed. Just use the new version.
                $mform->addElement('hidden', 'legacyapi', false);
            }
        } else if (static::legacy_api_available()) {
            // The Legacy API is still available and the site does not meet the requirements for the OAuth 2 API.
            // Display a warning message.
            $mform->addElement('static', null,
                    get_string('oauth2title', 'repository_dropbox'),
                    get_string('legacyapihelpunsupported', 'repository_dropbox'));
            $mform->addElement('hidden', 'legacyapi', true);
            $mform->setType('legacyapi', PARAM_BOOL);
        } else {
            // No available API.
            $mform->addElement('static', null,
                    get_string('oauth2title', 'repository_dropbox'),
                    get_string('legacyapihelpremoved', 'repository_dropbox'));
            $mform->addElement('hidden', 'legacyapi', false);
            $mform->setType('legacyapi', PARAM_BOOL);
        }
    }

    /**
     * Option names of dropbox plugin
     *
     * @return array
     */
    public static function get_type_option_names() {
        return [
                'legacyapi',
                'dropbox_key',
                'dropbox_secret',
                'pluginname',
                'dropbox_cachelimit',
            ];
    }

    /**
     * Whether the instance is visible.
     *
     * @return bool
     */
    public function is_visible() {
        if (!static::meets_v2_requirements() && !static::legacy_api_available()) {
            // This site does not meet the technical requirements of the OAuth 2 API and the legacy API has been removed.
            // Don't show Dropbox.
            return false;
        }
        return parent::is_visible();
    }
}

if (!repository_dropbox_base::legacy_api_available()) {
    // This is after the cut-off date.
    // Force switch away from the legacy UI.
    $legacy = false;
} else {
    // We are before the cut-off.
    // Choose the API version to use based upon the configuration values but default to the new API.
    $legacy = !empty(get_config('dropbox', 'legacyapi'));
}

if ($legacy) {
    class_alias(\repository_dropbox\v1\repository::class, 'repository_dropbox');
} else {
    class_alias(\repository_dropbox\v2\repository::class, 'repository_dropbox');
}

/**
 * Dropbox plugin cron task
 */
function repository_dropbox_cron() {
    $instances = repository::get_instances(array('type'=>'dropbox'));
    foreach ($instances as $instance) {
        $instance->cron();
    }
}

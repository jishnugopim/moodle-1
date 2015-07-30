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
 * Disguise.
 *
 * @package    core
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\disguise;

defined('MOODLE_INTERNAL') || die();

/**
 * Disguise.
 *
 * @package    core
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
abstract class disguise {

    /**
     * const DISGUISE_DISABLED The disguise is currently disabled.
     */
    const DISGUISE_DISABLED = 0;

    /**
     * const DISGUISE_FORCED The disguise is currently forced.
     */
    const DISGUISE_FORCED = 1;

    /**
     * const DISGUISE_OPTIONAL The disguise is currently optional. It is up to the developer to determine how this flag is handled.
     */
    const DISGUISE_OPTIONAL = 2;

    /**
     * const IDENTITY_HIDDEN The disguise is not shown alongside the real identity.
     */
    const IDENTITY_HIDDEN = 0;

    /**
     * const IDENTITY_SHOWN The disguise is shown alongside the real identity.
     */
    const IDENTITY_SHOWN = 1;

    /**
     * const IDENTITY_RESTRICTED The disguise is shown alongside the real identity for users with the showidentity capability.
     */
    const IDENTITY_RESTRICTED = 2;

    /**
     * @var int $id
     */
    protected $id;

    /**
     * @var int $showrealidentity
     */
    protected $showrealidentity;

    /**
     * @var int $disabledisguisefrom
     */
    protected $disabledisguisefrom;

    /**
     * @var bool $loganonymously
     */
    protected $loganonymously;

    /**
     * @var bool $usegradebook
     */
    protected $usegradebook;

    /**
     * @var bool $mode
     */
    protected $mode;

    /**
     * @var bool $lockdisguise
     */
    protected $lockdisguise;

    /**
     * @var \context $context
     */
    protected $context;

    /**
     * @var string $pluginpath
     */
    protected $pluginpath;

    public function __construct($record, \context $context) {
        $this->id = $record->id;
        $this->showrealidentity     = (int)  $record->showrealidentity;
        $this->disabledisguisefrom  = (int)  $record->disabledisguisefrom;
        $this->loganonymously       = (bool) $record->loganonymously;
        $this->usegradebook         = (bool) $record->usegradebook;
        $this->mode                 = (int)  $record->mode;
        $this->lockdisguise         = (bool) $record->lockdisguise;

        // We need the context that this disguise is active in for capability checking.
        $this->context = $context;

        // Determine the path to this plugin instance. We use this for URLs generated for management URLs, etc.
        $reflect = new \ReflectionClass($this);
        $this->pluginpath = '/user/disguise/' . $reflect->getShortName();
    }

    /**
     * Is this disguise enabled?
     *
     * @return bool
     */
    public function is_enabled() {
        return $this->mode !== self::DISGUISE_DISABLED;
    }

    /**
     * Is this disguise forced?
     * Disguises may be optional within a context.
     *
     * @return bool
     */
    public function is_forced() {
        return $this->mode === self::DISGUISE_FORCED;
    }

    /**
     * Is the disguise configured for the specified user?
     *
     * @param \stdClass $user The user to check.
     * @return bool
     */
    public function is_configured_for_user(\stdClass $user = null) {
        global $USER;

        if (!$this->requires_user_configuration()) {
            // This plugin does not require per-user configuration.
            return true;
        }

        if (null === $user) {
            $user = $USER;
        }

        // TODO
        // Check if the user has configured this plugin instance.
        return false;
    }

    /**
     * Ensure that the the user has configured their disguise.
     *
     * @param \stdClass $user The user to check.
     */
    public function ensure_configured_for_user(\stdClass $user) {
        if (!$this->is_configured_for_user($user)) {
            return redirect($this->user_configuration_path());
        }
    }

    /**
     * Should the user's real identity be shown alongside their disguise?
     *
     * @return bool
     */
    public function should_show_real_identity() {
        global $SESSION;

        if ($this->showrealidentity === self::IDENTITY_SHOWN) {
            // This plugin has been configured to always display the users real identity.
            return true;
        }

        if ($this->disabledisguisefrom && $this->disabledisguisefrom < time()) {
            // This plugin is configured to display the users real identity after a datetime, and that datetime has now passed.
            return true;
        }

        if ($this->can_toggle_real_identity()) {
            // The user can toggle display of real identity. Check whether they have done so.
            // Note, we use the session here rather than a user preference because this should not be persisted between sessions.
            if (isset($SESSION->disguiserevealed) && $SESSION->disguiserevealed) {
                return true;
            }
        }

        return false;
    }

    /**
     * Whether the current user can toggle display of the real user identity.
     * 
     * This takes into account the revealidentity capability; and the showidentity capability in combination with the
     * restricted showrealidentity setting.
     *
     * @return bool
     */
    public function can_toggle_real_identity() {
        if (has_capability('moodle/disguise:revealidentity', $this->context)) {
            // This user holds the revealidentity capability, therefore they are able to toggle identity display.
            return true;
        }

        if ($this->showrealidentity === self::IDENTITY_RESTRICTED && has_capability('moodle/disguise:showidentity', $this->context)) {
            // This user holds the showidentity capability, therefore they are able to toggle identity display.
            return true;
        }
        
        // Fallback to false.
        return false;
    }

    /**
     * Taking into account the is_forced disguise setting, and the forcedisguise option, should the user be disguised.
     *
     * @param array $options The list of options provided to fullname, profileurl, and other functions.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return bool
     */
    protected function should_use_disguise($options) {
        if ($this->is_enabled()) {
            $usedisguise = $this->is_forced();
            $usedisguise = $usedisguise || isset($options['forcedisguise']) && $options['forcedisguise'];

            return $usedisguise;
        }
        return false;
    }

    /**
     * Whether this disguise has requested anonymous logging.
     *
     * @return bool
     */
    public function should_log_anonymously() {
        return $this->loganonymously;
    }

    /**
     * The displayed fullname for the user, taking into account the disguise configuration, and whether the real identity
     * should also be displayed.
     *
     * Generally, this function should not be overridden. @see disguise_fullname instead.
     *
     * @param \stdClass $user The user being displayed.
     * @param array $options The list of options for the fullname.
     * @param bool $options.firstthenlast Whether to override the display of the fullname when shown to show the first,
     *                                    then the last name instead of adherring to the fullnamedisplay setting.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return string The disguise user fullname
     * @see disguise_fullname
     */
    public function fullname(\stdClass $user, $options) {
        // The 'override' setting for when we need to call fullname() too.
        $override = isset($options['firstthenlast']) && $options['firstthenlast'];

        if ($this->should_use_disguise($options)) {
            if ($this->should_show_real_identity()) {
                $a = new \stdClass();
                $a->disguise = $this->disguise_fullname($user, $options);
                $a->fullname = fullname($user, $override);
                return get_string('disguisewithreal', 'moodle', $a);
            }

            return $this->disguise_fullname($user, $options);
        }

        return fullname($user, $override);
    }

    /**
     * The displayed fullname for the user, taking into account the disguise configuration, and whether the real identity
     * should also be displayed.
     *
     * @param \stdClass $user The user being displayed.
     * @param array $options The list of options for the fullname.
     * @param bool $options.firstthenlast Whether to override the display of the fullname when shown to show the first,
     *                                    then the last name instead of adherring to the fullnamedisplay setting.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return string The disguise user fullname
     */
    protected abstract function disguise_fullname(\stdClass $user, $options);

    /**
     * The URL for the profile of the user, taking into account the disguise configuration, and whether the real identity
     * should also be displayed. If no URL should be displayed, a null value will be returned.
     *
     * Generally, this function should not be overridden. @see disguise_profile_url instead.
     *
     * @param \stdClass $user The user being displayed.
     * @param array $options The list of options for the profile_url.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return \moodle_url|null The link to the profile field.
     * @see disguise_profile_url
     */
    public function profile_url(\stdClass $user, $options, $courseid = null) {
        if ($this->should_use_disguise($options) && !$this->should_show_real_identity()) {
            // The disguise should be active, and the real identity is not being displayed.
            return $this->disguise_profile_url($user, $options);
        }

        $profileurl = new \moodle_url('/user/view.php', array('id' => $user->id));
        if ($courseid) {
            $profileurl->param('course', $courseid);
        }
        return $profileurl;
    }

    /**
     * The URL for the profile of the user, taking into account the disguise configuration, and whether the real identity
     * should also be displayed. If no URL should be displayed, a null value will be returned.
     *
     * @param \stdClass $user The user being displayed.
     * @param array $options The list of options for the profile_url.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return \moodle_url|null The link to the profile field.
     * @see disguise_profile_url
     */
    protected function disguise_profile_url(\stdClass $user, $options) {
        return null;
    }

    /**
     * The user picture for the user, taking into account the disguise configuration, and whether the real identity
     * should also be displayed. If no picture should be displayed, an empty string value will be returned.
     *
     * Generally, this function should not be overridden. @see disguise_profile_url instead.
     *
     * @param \stdClass $user The user being displayed.
     * @param array $options The list of options for the user picture.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return string The HTML fragment to use
     * @see disguise_profile_url
     */
    public function user_picture(\stdClass $user, $options = array(), $userpictureoptions = array()) {
        if ($this->should_use_disguise($options) && !$this->should_show_real_identity()) {
            // The disguise should be active, and the real identity is not being displayed.
            return $this->disguise_user_picture($user, $options, $userpictureoptions);
        }

        return $OUTPUT->user_picture($user, $userpictureoptions);
    }

    /**
     * The user picture for the user, taking into account the disguise configuration, and whether the real identity
     * should also be displayed. If no picture should be displayed, an empty string value will be returned.
     *
     * @param \stdClass $user The user being displayed.
     * @param array $options The list of options for the user picture.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return string The HTML fragment to use
     * @see disguise_profile_url
     */
    protected function disguise_user_picture(\stdClass $user, $options, $userpictureoptions) {
        global $OUTPUT;

        // TODO: Replace with a placeholder.
        return '';
    }

    /**
     * Does this plugin require interaction from a user for initial configuration.
     *
     * @return bool
     */
    protected function requires_user_configuration() {
        return false;
    }

    /**
     * The user-configuration URL.
     *
     * @return \moodle_url
     * @throws \coding_exception
     */
    protected function user_configuration_path() {
        // This function is only called if requires_user_configuration is true.
        return new \moodle_url($this->pluginpath . '/configure.php');
    }

    /**
     * Whether the current user can make changes to the disguise.
     *
     * @return bool
     */
    public function can_make_changes() {
        return !$this->lockdisguise;
    }

    /**
     * Whether the current user can enable the disguise lock.
     * Once the disguise lock has been enabled, that user may not be able to disable it again. This can be verified with
     * the sister function can_disable_disguiselock().
     *
     * Once the disguise lock has been enabled, changes to the disguise cannot be made.
     *
     * @return bool
     */
    public function can_enable_disguiselock() {
        // Users can toggle the lock on if they are able to make changes. 
        // This does not mean that they can disable it again!
        return ($this->can_make_changes());
    }

    /**
     * Whether the current user can disable the disguise lock, allowing them to make changes.
     *
     * @return bool
     */
    public function can_disable_disguiselock() {
        if (has_capability('moodle/disguise:disablelock', $this->context)) {
            // The user is able to disable the lock based on their capabilities.
            return true;
        }

        // Do not allow this user to disable the lock.
        return false;
    }
}
// TODO usegradebook
// TODO mod_form hook to add items.
// TODO lockdisguise in entirety!!

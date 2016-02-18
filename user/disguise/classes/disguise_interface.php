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
 * Disguise plugin interface.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core_disguise;

defined('MOODLE_INTERNAL') || die();

/**
 * Disguise plugin interface.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
interface disguise_interface {

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
     * Get the ID for the disguise instance.
     *
     * @return int
     */
    public function get_id();

    /**
     * Instantiate an instance of the disguise.
     *
     * @param \context $context
     * @return An instance of the core_disguise
     * @throws \coding_exception
     */
    public static function instance(\context $context);

    /**
     * Create a new instance of this disguise.
     */
    public static function create(\context $context, $disguisetype);

    /**
     * Is this disguise enabled?
     *
     * @return bool
     */
    public function is_enabled();

    /**
     * Is this disguise forced?
     * Disguises may be optional within a context.
     *
     * @return bool
     */
    public function is_forced();

    /**
     * Is the disguise configured for the specified user?
     *
     * @param \stdClass $user The user to check.
     * @return bool
     */
    public function is_configured_for_user(\stdClass $user = null);

    /**
     * Whether the disguise configured for the specified user in the the specified context.
     *
     * @param \context $context The context to check.
     * @param \stdClass $user The user to check.
     * @return bool
     */
    public static function is_configured_for_user_in_context(\context $context, \stdClass $user);

    /**
     * Ensure that the the user has configured their disguise.
     *
     * @param \stdClass $user The user to check.
     */
    public function ensure_configured_for_user(\stdClass $user);

    /**
     * Ensure that the the user has configured their disguise within the specified context.
     *
     * @param \context $context The context to check.
     * @param \stdClass $user The user to check.
     * @return bool
     */
    public static function ensure_configured_for_user_in_context(\context $context, \stdClass $user = null);

    /**
     * Ensure that the the user has configured their disguise.
     *
     * @param \stdClass $user The user to check.
     */
    public function handle_unconfigured_for_user(\stdClass $user);

    /**
     * Redirect back to the original location if possible once
     * configuration is complete.
     */
    public function handle_user_now_configured();

    /**
     * Should the user's real identity be shown alongside their disguise?
     *
     * @return bool
     */
    public function should_show_real_identity();

    /**
     * Whether the current user can toggle display of the real user identity.
     *
     * This takes into account the revealidentity capability; and the showidentity capability in combination with the
     * restricted showrealidentity setting.
     *
     * @return bool
     */
    public function can_toggle_real_identity();

    /**
     * Taking into account the is_forced disguise setting, and the forcedisguise option, should the user be disguised.
     *
     * @param array $options The list of options provided to displayname, profileurl, and other functions.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return bool
     */
    protected function should_use_disguise($options);

    /**
     * Whether this disguise has requested anonymous logging.
     *
     * @return bool
     */
    public function should_log_anonymously();

    /**
     * The displayed displayname for the user, taking into account the disguise configuration, and whether the real identity
     * should also be displayed.
     *
     * Generally, this function should not be overridden. @see disguise_displayname instead.
     *
     * @param \stdClass $user The user being displayed.
     * @param array $options The list of options for the displayname.
     * @param bool $options.firstthenlast Whether to override the display of the displayname when shown to show the first,
     *                                    then the last name instead of adherring to the displaynamedisplay setting.
     * @param bool $options.forcedisguise Force use of the disguise when it is optional.
     * @return string The disguise user displayname
     * @see disguise_displayname
     */
    public function displayname(\stdClass $user, $options);

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
    protected abstract function disguise_displayname(\stdClass $user, $options);

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
    public function profile_url(\stdClass $user, $options, $courseid = null);

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
    protected function disguise_profile_url(\stdClass $user, $options);

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
    public function user_picture(\stdClass $user, $options = array(), $userpictureoptions = array());

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
    protected function disguise_user_picture(\stdClass $user, $options, $userpictureoptions);

    /**
     * Does this plugin require interaction from a user for initial configuration.
     *
     * @return bool
     */
    protected function requires_user_configuration();

    /**
     * The user-configuration URL.
     *
     * @param \stdClass $user The user to handle configuration for
     * @return \moodle_url
     * @throws \coding_exception
     */
    protected function user_configuration_path(\stdClass $user);

    /**
     * Whether the current user can make changes to the disguise.
     *
     * @return bool
     */
    public function can_make_changes();

    /**
     * Whether the current user can enable the disguise lock.
     * Once the disguise lock has been enabled, that user may not be able to disable it again. This can be verified with
     * the sister function can_disable_disguiselock().
     *
     * Once the disguise lock has been enabled, changes to the disguise cannot be made.
     *
     * @return bool
     */
    public function can_enable_disguiselock();

    /**
     * Whether the current user can disable the disguise lock, allowing them to make changes.
     *
     * @return bool
     */
    public function can_disable_disguiselock();

    /**
     * Get the type of disguise.
     *
     * @return string
     */
    public function get_type();

    /**
     * Get the disguise data to add to a form.
     *
     * @param stdClass $formdata
     * @return bool Whether changes were made
     */
    public function get_disguise_form_data($data);

    /**
     * Update the disguise with the data from the submitted form.
     *
     * @param stdClass $formdata
     * @return bool Whether changes were made
     */
    public function update_from_form_data(\stdClass $form);
}
// TODO usegradebook

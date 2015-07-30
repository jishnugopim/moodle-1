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
 * User class
 *
 * @package    core
 * @copyright  2013 Rajesh Taneja <rajesh@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * User class to access user details.
 *
 * @todo       move api's from user/lib.php and depreciate old ones.
 * @package    core
 * @copyright  2013 Rajesh Taneja <rajesh@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class core_user {
    /**
     * No reply user id.
     */
    const NOREPLY_USER = -10;

    /**
     * Support user id.
     */
    const SUPPORT_USER = -20;

    /**
     * Disguised user id.
     */
    const DISGUISED_USER = -30;

    /** @var stdClass keep record of noreply user */
    public static $noreplyuser = false;

    /** @var stdClass keep record of support user */
    public static $supportuser = false;

    /** @var array store user fields properties cache. */
    protected static $propertiescache = null;

    /** @var stdClass keep record of disguised user */
    public static $disguiseduser = false;

    /**
     * Return user object from db or create noreply or support user,
     * if userid matches corse_user::NOREPLY_USER or corse_user::SUPPORT_USER
     * respectively. If userid is not found, then return false.
     *
     * @param int $userid user id
     * @param string $fields A comma separated list of user fields to be returned, support and noreply user
     *                       will not be filtered by this.
     * @param int $strictness IGNORE_MISSING means compatible mode, false returned if user not found, debug message if more found;
     *                        IGNORE_MULTIPLE means return first user, ignore multiple user records found(not recommended);
     *                        MUST_EXIST means throw an exception if no user record or multiple records found.
     * @return stdClass|bool user record if found, else false.
     * @throws dml_exception if user record not found and respective $strictness is set.
     */
    public static function get_user($userid, $fields = '*', $strictness = IGNORE_MISSING) {
        global $DB;

        // If noreply user then create fake record and return.
        switch ($userid) {
            case self::NOREPLY_USER:
                return self::get_noreply_user();
                break;
            case self::SUPPORT_USER:
                return self::get_support_user();
                break;
            default:
                return $DB->get_record('user', array('id' => $userid), $fields, $strictness);
        }
    }


    /**
     * Return user object from db based on their username.
     *
     * @param string $username The username of the user searched.
     * @param string $fields A comma separated list of user fields to be returned, support and noreply user.
     * @param int $mnethostid The id of the remote host.
     * @param int $strictness IGNORE_MISSING means compatible mode, false returned if user not found, debug message if more found;
     *                        IGNORE_MULTIPLE means return first user, ignore multiple user records found(not recommended);
     *                        MUST_EXIST means throw an exception if no user record or multiple records found.
     * @return stdClass|bool user record if found, else false.
     * @throws dml_exception if user record not found and respective $strictness is set.
     */
    public static function get_user_by_username($username, $fields = '*', $mnethostid = null, $strictness = IGNORE_MISSING) {
        global $DB, $CFG;

        // Because we use the username as the search criteria, we must also restrict our search based on mnet host.
        if (empty($mnethostid)) {
            // If empty, we restrict to local users.
            $mnethostid = $CFG->mnet_localhost_id;
        }

        return $DB->get_record('user', array('username' => $username, 'mnethostid' => $mnethostid), $fields, $strictness);
    }

    /**
     * Helper function to return dummy noreply user record.
     *
     * @return stdClass
     */
    protected static function get_dummy_user_record() {
        global $CFG;

        $dummyuser = new stdClass();
        $dummyuser->id = self::NOREPLY_USER;
        $dummyuser->email = $CFG->noreplyaddress;
        $dummyuser->firstname = get_string('noreplyname');
        $dummyuser->username = 'noreply';
        $dummyuser->lastname = '';
        $dummyuser->confirmed = 1;
        $dummyuser->suspended = 0;
        $dummyuser->deleted = 0;
        $dummyuser->picture = 0;
        $dummyuser->auth = 'manual';
        $dummyuser->firstnamephonetic = '';
        $dummyuser->lastnamephonetic = '';
        $dummyuser->middlename = '';
        $dummyuser->alternatename = '';
        $dummyuser->imagealt = '';
        return $dummyuser;
    }

    /**
     * Return noreply user record, this is currently used in messaging
     * system only for sending messages from noreply email.
     * It will return record of $CFG->noreplyuserid if set else return dummy
     * user object with hard-coded $user->emailstop = 1 so noreply can be sent to user.
     *
     * @return stdClass user record.
     */
    public static function get_noreply_user() {
        global $CFG;

        if (!empty(self::$noreplyuser)) {
            return self::$noreplyuser;
        }

        // If noreply user is set then use it, else create one.
        if (!empty($CFG->noreplyuserid)) {
            self::$noreplyuser = self::get_user($CFG->noreplyuserid);
        }

        if (empty(self::$noreplyuser)) {
            self::$noreplyuser = self::get_dummy_user_record();
            self::$noreplyuser->maildisplay = '1'; // Show to all.
        }
        self::$noreplyuser->emailstop = 1; // Force msg stop for this user.
        return self::$noreplyuser;
    }

    /**
     * Return support user record, this is currently used in messaging
     * system only for sending messages to support email.
     * $CFG->supportuserid is set then returns user record
     * $CFG->supportemail is set then return dummy record with $CFG->supportemail
     * else return admin user record with hard-coded $user->emailstop = 0, so user
     * gets support message.
     *
     * @return stdClass user record.
     */
    public static function get_support_user() {
        global $CFG;

        if (!empty(self::$supportuser)) {
            return self::$supportuser;
        }

        // If custom support user is set then use it, else if supportemail is set then use it, else use noreply.
        if (!empty($CFG->supportuserid)) {
            self::$supportuser = self::get_user($CFG->supportuserid, '*', MUST_EXIST);
        }

        // Try sending it to support email if support user is not set.
        if (empty(self::$supportuser) && !empty($CFG->supportemail)) {
            self::$supportuser = self::get_dummy_user_record();
            self::$supportuser->id = self::SUPPORT_USER;
            self::$supportuser->email = $CFG->supportemail;
            if ($CFG->supportname) {
                self::$supportuser->firstname = $CFG->supportname;
            }
            self::$supportuser->username = 'support';
            self::$supportuser->maildisplay = '1'; // Show to all.
        }

        // Send support msg to admin user if nothing is set above.
        if (empty(self::$supportuser)) {
            self::$supportuser = get_admin();
        }

        // Unset emailstop to make sure support message is sent.
        self::$supportuser->emailstop = 0;
        return self::$supportuser;
    }

    /**
     * Return disguised user record.
     *
     * $CFG->disguiseduserid is set then returns user record
     * $CFG->disguisedemail is set then return dummy record with $CFG->disguisedemail
     *
     * @param stdClass $user                         A {@link $USER} object to get full name of.
     * @param context  $context                      The context at which the user is being displayed
     *
     * @return stdClass user record.
     */
    public static function get_disguised_user(\stdClass $user, \context $context) {
        global $CFG;

        if ($context === null) {
            // No context specified - use page context instead.
            $context = $PAGE->context;
        }

        if ($context && !$context->disguise) {
            return $user;
        }

        if (!empty(self::$disguiseduser)) {
            return self::$disguiseduser;
        }

        // If custom disguised user is set then use it, else if disguisedemail is set then use it, else use noreply.
        if (!empty($CFG->disguiseduserid)) {
            self::$disguiseduser = self::get_user($CFG->disguiseduserid, '*', MUST_EXIST);
        }

        // Try sending it to disguised email if disguised user is not set.
        if (empty(self::$disguiseduser)) {
            self::$disguiseduser = self::get_dummy_user_record();
            self::$disguiseduser->id = self::DISGUISED_USER;
            if (!empty($CFG->disguisedemail)) {
                self::$disguiseduser->email = $CFG->disguisedemail;
            }
            if (!empty($CFG->disguisedname)) {
                self::$disguiseduser->firstname = $CFG->disguisedname;
            }
            self::$disguiseduser->username = '';
            self::$disguiseduser->maildisplay = '0';
            self::$disguiseduser->emailstop = 0;
        }

        // Unset emailstop to make sure disguised message is sent.
        return self::$disguiseduser;
    }

    /**
     * Reset self::$noreplyuser and self::$supportuser.
     * This is only used by phpunit, and there is no other use case for this function.
     * Please don't use it outside phpunit.
     */
    public static function reset_internal_users() {
        if (PHPUNIT_TEST) {
            self::$noreplyuser = false;
            self::$supportuser = false;
        } else {
            debugging('reset_internal_users() should not be used outside phpunit.', DEBUG_DEVELOPER);
        }
    }

    /**
     * Return true is user id is greater than self::NOREPLY_USER and
     * alternatively check db.
     *
     * @param int $userid user id.
     * @param bool $checkdb if true userid will be checked in db. By default it's false, and
     *                      userid is compared with NOREPLY_USER for performance.
     * @return bool true is real user else false.
     */
    public static function is_real_user($userid, $checkdb = false) {
        global $DB;

        if ($userid < 0) {
            return false;
        }
        if ($checkdb) {
            return $DB->record_exists('user', array('id' => $userid));
        } else {
            return true;
        }
    }

    /**
     * Check if the given user is an active user in the site.
     *
     * @param  stdClass  $user         user object
     * @param  boolean $checksuspended whether to check if the user has the account suspended
     * @param  boolean $checknologin   whether to check if the user uses the nologin auth method
     * @throws moodle_exception
     * @since  Moodle 3.0
     */
    public static function require_active_user($user, $checksuspended = false, $checknologin = false) {

        if (!self::is_real_user($user->id)) {
            throw new moodle_exception('invaliduser', 'error');
        }

        if ($user->deleted) {
            throw new moodle_exception('userdeleted');
        }

        if (empty($user->confirmed)) {
            throw new moodle_exception('usernotconfirmed', 'moodle', '', $user->username);
        }

        if (isguestuser($user)) {
            throw new moodle_exception('guestsarenotallowed', 'error');
        }

        if ($checksuspended and $user->suspended) {
            throw new moodle_exception('suspended', 'auth');
        }

        if ($checknologin and $user->auth == 'nologin') {
            throw new moodle_exception('suspended', 'auth');
        }
    }

    /**
     * Definition of user profile fields and the expected parameter type for data validation.
     *
     * @return void
     */
    protected static function fill_properties_cache() {

        if (self::$propertiescache !== null) {
            return;
        }

        // Array of user fields properties and expected parameters.
        // Every new field on the user table should be added here otherwise it won't be validated.
        $fields = array();
        $fields['id'] = array('type' => PARAM_INT);
        $fields['auth'] = array('type' => PARAM_NOTAGS);
        $fields['confirmed'] = array('type' => PARAM_BOOL);
        $fields['policyagreed'] = array('type' => PARAM_BOOL);
        $fields['deleted'] = array('type' => PARAM_BOOL);
        $fields['suspended'] = array('type' => PARAM_BOOL);
        $fields['mnethostid'] = array('type' => PARAM_BOOL);
        $fields['username'] = array('type' => PARAM_USERNAME);
        $fields['password'] = array('type' => PARAM_NOTAGS);
        $fields['idnumber'] = array('type' => PARAM_NOTAGS);
        $fields['firstname'] = array('type' => PARAM_NOTAGS);
        $fields['lastname'] = array('type' => PARAM_NOTAGS);
        $fields['surname'] = array('type' => PARAM_NOTAGS);
        $fields['email'] = array('type' => PARAM_RAW_TRIMMED);
        $fields['emailstop'] = array('type' => PARAM_INT);
        $fields['icq'] = array('type' => PARAM_NOTAGS);
        $fields['skype'] = array('type' => PARAM_NOTAGS);
        $fields['aim'] = array('type' => PARAM_NOTAGS);
        $fields['yahoo'] = array('type' => PARAM_NOTAGS);
        $fields['msn'] = array('type' => PARAM_NOTAGS);
        $fields['phone1'] = array('type' => PARAM_NOTAGS);
        $fields['phone2'] = array('type' => PARAM_NOTAGS);
        $fields['institution'] = array('type' => PARAM_TEXT);
        $fields['department'] = array('type' => PARAM_TEXT);
        $fields['address'] = array('type' => PARAM_TEXT);
        $fields['city'] = array('type' => PARAM_TEXT);
        $fields['country'] = array('type' => PARAM_TEXT);
        $fields['lang'] = array('type' => PARAM_TEXT);
        $fields['calendartype'] = array('type' => PARAM_NOTAGS);
        $fields['theme'] = array('type' => PARAM_NOTAGS);
        $fields['timezones'] = array('type' => PARAM_TEXT);
        $fields['firstaccess'] = array('type' => PARAM_INT);
        $fields['lastaccess'] = array('type' => PARAM_INT);
        $fields['lastlogin'] = array('type' => PARAM_INT);
        $fields['currentlogin'] = array('type' => PARAM_INT);
        $fields['lastip'] = array('type' => PARAM_NOTAGS);
        $fields['secret'] = array('type' => PARAM_TEXT);
        $fields['picture'] = array('type' => PARAM_INT);
        $fields['url'] = array('type' => PARAM_URL);
        $fields['description'] = array('type' => PARAM_CLEANHTML);
        $fields['descriptionformat'] = array('type' => PARAM_INT);
        $fields['mailformat'] = array('type' => PARAM_INT);
        $fields['maildigest'] = array('type' => PARAM_INT);
        $fields['maildisplay'] = array('type' => PARAM_INT);
        $fields['autosubscribe'] = array('type' => PARAM_INT);
        $fields['trackforums'] = array('type' => PARAM_INT);
        $fields['timecreated'] = array('type' => PARAM_INT);
        $fields['timemodified'] = array('type' => PARAM_INT);
        $fields['trustbitmask'] = array('type' => PARAM_INT);
        $fields['imagealt'] = array('type' => PARAM_TEXT);
        $fields['lastnamephonetic'] = array('type' => PARAM_NOTAGS);
        $fields['firstnamephonetic'] = array('type' => PARAM_NOTAGS);
        $fields['middlename'] = array('type' => PARAM_NOTAGS);
        $fields['alternatename'] = array('type' => PARAM_NOTAGS);

        self::$propertiescache = $fields;
    }

    /**
     * Get properties of a user field.
     *
     * @param string $property property name to be retrieved.
     * @throws coding_exception if the requested property name is invalid.
     * @return array the property definition.
     */
    public static function get_property_definition($property) {

        self::fill_properties_cache();

        if (!array_key_exists($property, self::$propertiescache)) {
            throw new coding_exception('Invalid property requested.');
        }

        return self::$propertiescache[$property];
    }

    /**
     * Clean the properties cache.
     *
     * During unit tests we need to be able to reset all caches so that each new test starts in a known state.
     * Intended for use only for testing, phpunit calls this before every test.
     */
    public static function reset_caches() {
        self::$propertiescache = null;
    }

    /**
     * Returns a persons full name taking into account any disguise applied at the supplied context.
     *
     * Given an object containing all of the users name values, this function returns a string with the full name of the person.
     * The result may depend on system settings, language, and disguise configuration.
     *
     * @param stdClass $user                         A {@link $USER} object to get full name of.
     * @param context  $context                      The context at which the user is being displayed
     * @param array    $displayoptions               The options to configure how the name is displayed
     * @param bool     $displayoptions.usefullnamedisplay Whether to force display to be first name then last name, rather
     *                                               than adhering to the fullnamedisplay.
     * @return string
     */
    public static function displayname(\stdClass $user, \context $context = null, array $displayoptions = array()) {
        global $PAGE;

        if ($context === null) {
            // No context specified - use page context instead.
            $context = $PAGE->context;
        }

        if ($context->disguise && !$PAGE->is_disguise_configuration_page()) {
            return $context->disguise->displayname($user, $displayoptions);
        }

        return self::real_displayname($user, $context, $displayoptions);
    }

    /**
     * Returns a persons full name.
     *
     * Given an object containing all of the users name values, this function returns a string with the full name of the person.
     * The result may depend on system settings, and language.
     *
     * @param stdClass $user                         A {@link $USER} object to get full name of.
     * @param context  $context                      The context at which the user is being displayed
     * @param array    $displayoptions               The options to configure how the name is displayed
     * @param bool     $displayoptions.usefullnamedisplay Whether to force display to be first name then last name, rather
     *                                               than adhering to the fullnamedisplay.
     * @return string
     */
    public static function real_displayname(\stdClass $user, \context $context = null, array $options = array()) {
        global $CFG, $SESSION;

        $override = isset($options['usefullnamedisplay']) && $options['usefullnamedisplay'];

        if (!isset($user->firstname) and !isset($user->lastname)) {
            return '';
        }

        // Get all of the name fields.
        $allnames = get_all_user_name_fields();
        if ($CFG->debugdeveloper) {
            foreach ($allnames as $allname) {
                if (!property_exists($user, $allname)) {
                    // If all the user name fields are not set in the user object, then notify the programmer that it
                    // needs to be fixed.
                    debugging('You need to update your sql to include additional name fields in the user object.',
                            DEBUG_DEVELOPER);
                    // Message has been sent, no point in sending the message multiple times.
                    break;
                }
            }
        }

        if (!$override) {
            if (!empty($CFG->forcefirstname)) {
                $user->firstname = $CFG->forcefirstname;
            }
            if (!empty($CFG->forcelastname)) {
                $user->lastname = $CFG->forcelastname;
            }
        }

        if (!empty($SESSION->fullnamedisplay)) {
            $CFG->fullnamedisplay = $SESSION->fullnamedisplay;
        }

        $template = null;
        // If the fullnamedisplay setting is available, set the template to that.
        if (isset($CFG->fullnamedisplay)) {
            $template = $CFG->fullnamedisplay;
        }
        // If the template is empty, or set to language, return the language string.
        if ((empty($template) || $template == 'language') && !$override) {
            return get_string('fullnamedisplay', null, $user);
        }

        // Check to see if we are displaying according to the alternative full name format.
        if ($override) {
            if (empty($CFG->alternativefullnameformat) || $CFG->alternativefullnameformat == 'language') {
                // Default to show just the user names according to the fullnamedisplay string.
                return get_string('fullnamedisplay', null, $user);
            } else {
                // If the override is true, then change the template to use the complete name.
                $template = $CFG->alternativefullnameformat;
            }
        }

        $requirednames = array();
        // With each name, see if it is in the display name template, and add it to the required names array if it is.
        foreach ($allnames as $allname) {
            if (strpos($template, $allname) !== false) {
                $requirednames[] = $allname;
            }
        }

        $displayname = $template;
        // Switch in the actual data into the template.
        foreach ($requirednames as $altname) {
            if (isset($user->$altname)) {
                // Using empty() on the below if statement causes breakages.
                if ((string)$user->$altname == '') {
                    $displayname = str_replace($altname, 'EMPTY', $displayname);
                } else {
                    $displayname = str_replace($altname, $user->$altname, $displayname);
                }
            } else {
                $displayname = str_replace($altname, 'EMPTY', $displayname);
            }
        }
        // Tidy up any misc. characters (Not perfect, but gets most characters).
        // Don't remove the "u" at the end of the first expression unless you want garbled characters when combining hiragana or
        // katakana and parenthesis.
        $patterns = array();
        // This regular expression replacement is to fix problems such as 'James () Kirk' Where 'Tiberius' (middlename) has not been
        // filled in by a user.
        // The special characters are Japanese brackets that are common enough to make allowances for them (not covered by :punct:).
        $patterns[] = '/[[:punct:]「」]*EMPTY[[:punct:]「」]*/u';
        // This regular expression is to remove any double spaces in the display name.
        $patterns[] = '/\s{2,}/u';
        foreach ($patterns as $pattern) {
            $displayname = preg_replace($pattern, ' ', $displayname);
        }

        // Trimming $displayname will help the next check to ensure that we don't have a display name with spaces.
        $displayname = trim($displayname);
        if (empty($displayname)) {
            // Going with just the first name if no alternate fields are filled out. May be changed later depending on what
            // people in general feel is a good setting to fall back on.
            $displayname = $user->firstname;
        }
        return $displayname;
    }

    /**
     * Returns a link to the user's profile URL.
     *
     * @param stdClass $user                         A {@link $USER} object to get full name of.
     * @param context  $context                      The context at which the user is being displayed
     * @param array    $options                      The options to configure how the name is displayed
     * @param int      $courseid                     The ID of the course if a course profile is desired
     * @return string
     */
    public static function profile_url(\stdClass $user, \context $context = null, array $options = [], $courseid = null) {
        global $PAGE;

        if ($context === null) {
            // No context specified - use page context instead.
            $context = $PAGE->context;
        }

        $shouldshow = true;
        if ($context->disguise) {
            $shouldshow = $context->disguise->allow_profile_links($user, $options, $courseid);
        }

        if ($shouldshow) {
            $profileurl = new moodle_url('/user/view.php', array('id' => $user->id));
            if ($courseid) {
                $profileurl->param('course', $courseid);
            }
            return $profileurl;
        } else {
            return '';
        }
    }

    /**
     * Return the user displayname plus a link to their profile if appropriate.
     *
     * See {@link profile_url} and {@link displayname}.
     *
     * @param stdClass $user                         A {@link $USER} object to get full name of.
     * @param context  $context                      The context at which the user is being displayed
     * @param array    $options                      The options to configure how the name is displayed
     * @param bool     $options.usefullnamedisplay   Whether to force display to be first name then last name, rather
     *                                               than adhering to the fullnamedisplay.
     * @param int      $courseid                     The ID of the course if a course profile is desired
     * @return string
     */
    public static function profile_displayname(\stdClass $user, \context $context = null, array $options = [], $courseid = null) {
        $displayname = self::displayname($user, $context, $options);
        if ($url = self::profile_url($user, $context, $options, $courseid)) {
            return html_writer::link($url, $displayname);
        } else {
            return $displayname;
        }
    }

    /**
     * Return the URL used to message the user.
     *
     * @param stdClass $user                A {@link $USER} object to get message_url for.
     * @param context  $context                      The context at which the user is being displayed
     * @param array    $options             The options to configure how the name is displayed.
     * @return string
     */
    public static function message_url(\stdClass $user, \context $context = null, array $options = []) {
        global $PAGE;

        if ($context === null) {
            // No context specified - use page context instead.
            $context = $PAGE->context;
        }

        $shouldshow = true;
        if ($context->disguise) {
            $shouldshow = $context->disguise->allow_messaging($user, $options);
        }

        if ($shouldshow) {
            return new moodle_url('/message/index.php', array('id' => $user->id));
        } else {
            return '';
        }
    }

    /**
     * Return a formatted link to message the user.
     *
     * See {@link message_url}.
     *
     * @param stdClass $user                         A {@link $USER} object to get full name of.
     * @param context  $context                      The context at which the user is being displayed
     * @param array    $options                      The options to configure how the name is displayed.
     * @param array    $linkattributes               Any attributes to add to the link itself.
     * @param string   $content                      The content of the link (e.g. message icon).
     *                                               If null is specified, then the message icon is used.
     * @return string
     */
    public static function message_link(\stdClass $user, \context $context = null, array $options = [], $linkattributes = [], $content = null) {
        global $OUTPUT;
        $url = self::message_url($user, $context, $options);

        if (empty($url)) {
            return $url;
        }

        if ($content === null) {
            $content = html_writer::img(
                    $OUTPUT->pix_url('t/message'),
                    get_string('messageselectadd'),
                    array(
                            'class' => 'iconsmall',
                        )
                );
        }

        $linkattributes = array_merge($linkattributes, message_messenger_sendmessage_link_params($user));

        return html_writer::link($url, $content, $linkattributes);
    }

    /**
     * Returns an HTML fragment containing the user's profile picture.
     *
     * @param stdClass $user                         A {@link $USER} object to get full name of.
     * @param context  $context                      The context at which the user is being displayed
     * @param array    $options                      The options to configure how the name is displayed
     * @param array    $userpictureoptions           Any additional options to pass to the user_picture renderer.
     * @return string
     */
    public static function user_picture(\stdClass $user, \context $context = null, array $options = [], $userpictureoptions = []) {
        global $PAGE, $OUTPUT;

        if ($context === null) {
            // No context specified - use page context instead.
            $context = $PAGE->context;
        }

        if ($context->disguise) {
            return $context->disguise->user_picture($user, $options, $userpictureoptions);
        }

        return $OUTPUT->user_picture($user, $userpictureoptions);
    }

    /**
     * Prepare a user record for use in web services.
     *
     * @param stdClass $user                         A {@link $USER} object to prepare.
     * @param context  $context                      The context at which the user is being displayed
     * @param array    $options                      The options to configure how the name is displayed
     * @return stdClass
     */
    public static function prepare_external_user(\stdClass $user, \context $context = null, array $options = []) {
        if ($context === null) {
            // No context specified - use page context instead.
            $context = $PAGE->context;
        }

        if ($context->disguise) {
            return $context->disguise->prepare_external_user($user, $options);
        }

        return $user;
    }
}

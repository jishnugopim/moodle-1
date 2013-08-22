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
 * Authentication Plugin: LDAP Authentication
 * Authentication using LDAP (Lightweight Directory Access Protocol).
 *
 * @package auth_ldap
 * @author Andrew Nicols
 * @license http://www.gnu.org/copyleft/gpl.html GNU Public License
 */

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir . '/authlib.php');
require_once($CFG->libdir . '/ldaplib.php');

/**
 * Cosign authentication plugin.
 */
class auth_plugin_cosign extends auth_plugin_base {

    protected $fakepassword = '';

    /**
     * Set up the plugin.
     */
    function __construct() {
        $this->authtype = $this->get_name();
        $this->config = get_config('auth_' . $this->authtype);
        $this->fakepassword = md5('**Cosign account - Password not used**');
    }

    /**
     * Helper function get the name of the plugin - used in various places.
     * This is based on the class of the plugin with the namespace removed.
     *
     * @return String The name of the plugin.
     */
    public function get_name() {
        // Plugins should fit the apttern
        $classname = get_class($this);
        return str_replace('auth_plugin_', '', $classname);
    }

    /**
     * Determine the username provided by the Cosign plugin.
     *
     * @return false|String The lower-cased username.
     */
    public function get_cosign_username() {
        // Check that we were provided with a valid authtype by the Cosign plugin.
        if (!isset($_SERVER['AUTH_TYPE'])) {
            return false;
        }

        if ($_SERVER['AUTH_TYPE'] != 'Cosign') {
            return false;
        }

        if (!isset($_SERVER['REMOTE_USER'])) {
            return false;
        }
        return moodle_strtolower($_SERVER['REMOTE_USER']);
    }

    /**
     * Override the loginpage form submission with the Cosign username and
     * password.
     *
     * NOTE: You could override this function to determine the canonical username for a
     * user.
     *
     * @return void
     */
    public function loginpage_hook() {
        global $frm;
        if ($username = self::get_cosign_username()) {
            // NOTE: If you want to get the canonical username for a user, this is the
            // place to do it.
            $frm->username = $username;
            $frm->password = $this->fakepassword;
        }
    }

    /**
     * Returns true if the username and password work and false if they are wrong or don't
     * exist.
     *
     * NOTE: You could override this function to determine the canonical username for a
     * user.
     *
     * @param string $username The username (without system magic quotes)
     * @param string $password The password (without system magic quotes)
     *
     * @return bool Authentication success or failure.
     */
    public function user_login($username, $password) {
        // Retrieve the cosign username again.
        if (!$cosignusername = self::get_cosign_username()) {
            return false;
        }

        // Check that the username provided matches the one provided by Cosign.
        if ($cosignusername !== $username) {
            return false;
        }

        // Retrieve the user details from LDAP now.
        if (!$userinfo = $this->get_userinfo($username)) {
            return false;
        }

        // All other tests have passed - allow the user in.
        return true;
    }

    /**
     * Override the default logout behaviour.
     *
     * When logging out, clear the COSIGN_SERVICE cookie, andredirect the user to the
     * cosign logout URL if it's set.
     */
    function logoutpage_hook() {
        global $USER, $redirect;

        // Only perform this way for cosign logins.
        if ($USER->auth === $this->authtype){
            // Clear the cookie - set it's content to null, and expire it.
            @setcookie($_SERVER['COSIGN_SERVICE'], null, time() - 1, '/', '', 1);

            // If we've been configured with the logouturl, then redirect to it.
            if (isset($this->config->logouturl)){
                $redirect = $this->config->logouturl;
            }
        }
    }

    /**
     * Reads user information from ldap and returns it in array()
     *
     * Function should return all information available. If you are saving
     * this information to moodle user-table you should honor syncronization flags
     *
     * @param string $username username
     *
     * @return mixed array with no magic quotes or false on error
     */
    function get_userinfo($username) {
        $extusername = core_text::convert($username, 'utf-8', $this->config->ldapencoding);

        $ldapconnection = $this->ldap_connect();
        if(!($user_dn = $this->ldap_find_userdn($ldapconnection, $extusername))) {
            $this->ldap_close();
            return false;
        }

        $search_attribs = array();
        $attrmap = $this->ldap_attributes();
        foreach ($attrmap as $key => $values) {
            if (!is_array($values)) {
                $values = array($values);
            }
            foreach ($values as $value) {
                if (!in_array($value, $search_attribs)) {
                    array_push($search_attribs, $value);
                }
            }
        }

        if (!$user_info_result = ldap_read($ldapconnection, $user_dn, '(objectClass=*)', $search_attribs)) {
            $this->ldap_close();
            return false; // error!
        }

        $user_entry = ldap_get_entries_moodle($ldapconnection, $user_info_result);
        if (empty($user_entry)) {
            $this->ldap_close();
            return false; // entry not found
        }

        $result = array();
        foreach ($attrmap as $key => $values) {
            if (!is_array($values)) {
                $values = array($values);
            }
            $ldapval = NULL;
            foreach ($values as $value) {
                $entry = array_change_key_case($user_entry[0], CASE_LOWER);
                if (($value == 'dn') || ($value == 'distinguishedname')) {
                    $result[$key] = $user_dn;
                    continue;
                }
                if (!array_key_exists($value, $entry)) {
                    continue; // wrong data mapping!
                }
                if (is_array($entry[$value])) {
                    $newval = core_text::convert($entry[$value][0], $this->config->ldapencoding, 'utf-8');
                } else {
                    $newval = core_text::convert($entry[$value], $this->config->ldapencoding, 'utf-8');
                }
                if (!empty($newval)) { // favour ldap entries that are set
                    $ldapval = $newval;
                }
            }
            if (!is_null($ldapval)) {
                $result[$key] = $ldapval;
            }
        }

        $this->ldap_close();
        return $result;
    }

    /**
     * Returns true if this authentication plugin is 'internal'.
     *
     * @return bool
     */
    function is_internal() {
        return false;
    }

} // End of the class

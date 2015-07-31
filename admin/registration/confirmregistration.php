<?php

///////////////////////////////////////////////////////////////////////////
//                                                                       //
// This file is part of Moodle - http://moodle.org/                      //
// Moodle - Modular Object-Oriented Dynamic Learning Environment         //
//                                                                       //
// Moodle is free software: you can redistribute it and/or modify        //
// it under the terms of the GNU General Public License as published by  //
// the Free Software Foundation, either version 3 of the License, or     //
// (at your option) any later version.                                   //
//                                                                       //
// Moodle is distributed in the hope that it will be useful,             //
// but WITHOUT ANY WARRANTY; without even the implied warranty of        //
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         //
// GNU General Public License for more details.                          //
//                                                                       //
// You should have received a copy of the GNU General Public License     //
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.       //
//                                                                       //
///////////////////////////////////////////////////////////////////////////

/**
 * @package    moodle
 * @subpackage registration
 * @author     Jerome Mouneyrac <jerome@mouneyrac.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL
 * @copyright  (C) 1999 onwards Martin Dougiamas  http://dougiamas.com
 *
 * The administrator is redirect to this page from the hub to confirm that the site has been registered.
 * This page save the token that the hub gave us, in order to call the hub directory later by web service.
 *
 * Note: This page does not require login, so care should be taken to ensure that it does not display any information,
 * nor make any changes beyond the intended scope.
 */

require('../../config.php');
require_once($CFG->dirroot . '/' . $CFG->admin . '/registration/lib.php');

$newtoken = optional_param('newtoken', '', PARAM_ALPHANUM);
$url = optional_param('url', '', PARAM_URL);
$hubname = optional_param('hubname', '', PARAM_TEXT);
$token = optional_param('token', '', PARAM_TEXT);
$error = optional_param('error', '', PARAM_ALPHANUM);

if (!empty($error) and $error == 'urlalreadyexist') {
    throw new moodle_exception('urlalreadyregistered', 'hub', $CFG->wwwroot . '/' . $CFG->admin . '/registration/index.php');
}

// Check that we are waiting a confirmation from this hub, and check that the token is correct.
$registrationmanager = new registration_manager();
$registeredhub = $registrationmanager->get_unconfirmedhub($url);

if (!empty($registeredhub) and $registeredhub->token == $token) {
    // The URL provided matches that of an unconfirmed hub, and the token provided by the hub matches the value we store.
    // Confirm the hub in the database.

    // Setup the page before we output the heading.
    $PAGE->set_url(new moodle_url('/admin/registration/confirmregistration.php'));
    $PAGE->set_context(context_system::instance());

    echo $OUTPUT->header();
    echo $OUTPUT->heading(get_string('registrationconfirmed', 'hub'), 3, 'main');

    $registeredhub->token = $newtoken;
    $registeredhub->confirmed = 1;
    $registeredhub->hubname = $hubname;
    $registrationmanager->update_registeredhub($registeredhub);

    // Display the confirmation message.
    echo $OUTPUT->notification(get_string('registrationconfirmedon', 'hub'), 'notifysuccess');

    // Display continue button.
    $registrationpage = new moodle_url('/admin/registration/index.php');
    $continuebutton = $OUTPUT->render(new single_button($registrationpage, get_string('continue', 'hub')));
    $continuebutton = html_writer::tag('div', $continuebutton, array('class' => 'mdl-align'));
    echo $continuebutton;

    if (!extension_loaded('xmlrpc')) {
        // The XMLRPC extension is not available. Warn the administrator as some parts of the registration will not work.
        $xmlrpcnotification = $OUTPUT->doc_link('admin/environment/php_extension/xmlrpc', '');
        $xmlrpcnotification .= get_string('xmlrpcdisabledregistration', 'hub');
        echo $OUTPUT->notification($xmlrpcnotification);
    }

    echo $OUTPUT->footer();
} else {
    // Either the hub was not found, the hub was no longer unconfirmed, or the token was incorrect.
    throw new moodle_exception('wrongtoken', 'hub', $CFG->wwwroot . '/' . $CFG->admin . '/registration/index.php');
}

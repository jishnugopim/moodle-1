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
 * VERP Settings.
 *
 * @package    tool_verp
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

if ($hassiteconfig) {
    $category = new admin_category('verp', new lang_string('incomingmailconfiguration', 'tool_verp'));

    // Create a settings page for all of the mail server settings.
    $settings = new admin_settingpage('verp_mailsettings', new lang_string('mailsettings', 'tool_verp'));

    // These settings are used when generating a VERP address.
    $settings->add(new admin_setting_heading('verp_mailboxconfiguration',
            new lang_string('mailboxconfiguration', 'tool_verp'), ''));
    $settings->add(new admin_setting_configtext('verp_mailbox',
            new lang_string('mailbox', 'tool_verp'),
            new lang_string('mailbox', 'tool_verp'), '', PARAM_RAW));
    $settings->add(new admin_setting_configtext('verp_domain',
            new lang_string('domain', 'tool_verp'),
            new lang_string('domain', 'tool_verp'), '', PARAM_RAW));

    // These settings are used when checking the incoming mailbox for mail.
    $settings->add(new admin_setting_heading('verp_serversettings',
            new lang_string('incomingmailserversettings', 'tool_verp'), ''));
    $settings->add(new admin_setting_configtext('verp_host',
            new lang_string('verphost', 'tool_verp'),
            new lang_string('configverphost', 'tool_verp'), '', PARAM_RAW));
    $settings->add(new admin_setting_configcheckbox('verp_hostssl',
            new lang_string('verphostssl', 'tool_verp'),
            new lang_string('configverphost', 'tool_verp'), 1));
    $options = array(
        'imap' => get_string('imap', 'tool_verp'),
        'pop3' => get_string('pop3', 'tool_verp'),
    );
    $settings->add(new admin_setting_configselect('verp_hosttype',
            new lang_string('verphosttype', 'tool_verp'),
            new lang_string('configverphost', 'tool_verp'), 'imap', $options));
    $settings->add(new admin_setting_configtext('verp_hostuser',
            new lang_string('verphostuser', 'tool_verp'),
            new lang_string('configsmtpuser', 'message_email'), '', PARAM_NOTAGS));
    $settings->add(new admin_setting_configpasswordunmask('verp_hostpass',
            new lang_string('verphostpass', 'tool_verp'),
            new lang_string('configsmtpuser', 'message_email'), ''));

    $category->add('verp', $settings);

    // Link to the external page for VERP handler configuration.
    $category->add('verp', new admin_externalpage('verp_handlers', new lang_string('message_handlers','tool_verp'),
            "$CFG->wwwroot/$CFG->admin/tool/verp/verp.php"));

    // Add the category to the admin tree.
    $ADMIN->add('server', $category);
}

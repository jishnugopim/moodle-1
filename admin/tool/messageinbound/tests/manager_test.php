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
 * Unit tests for the tool_messageinbound task.
 *
 * @package    tool_messageinbound
 * @category   test
 * @copyright  2014 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;

/**
 * Class used to test the tool_messageinbound task.
 */
class tool_messageinbound_testcase extends advanced_testcase {

    private $client;

    private $settings = array(
            'messageinbound_enabled',
            'messageinbound_mailbox',
            'messageinbound_domain',
            'messageinbound_ssl',
            'messageinbound_host',
            'messageinbound_hostuser',
            'messageinbound_hostpass',
        );

    private $requiredsettings = array(
            'messageinbound_enabled',
            'messageinbound_mailbox',
            'messageinbound_domain',
        );

    /**
     * Test set up.
     */
    public function setUp() {
        global $CFG;

        if (!PHPUNIT_LONGTEST) {
            $this->markTestSkipped("Not running phpunit with longtest enabled.");
        }

        foreach ($this->settings as $setting) {
            if (!isset($CFG->$setting)) {
                $this->markTestSkipped("IMAP server test not enabled. Field {$setting} not specified.");
            }
        }

        // There is a good IMAP configuration. Connect.
        $this->helper_connect_imap();
    }

    public function tearDown() {
        // Close the IMAP connection.
        if ($this->client) {
            $this->client->close();
        }
        $this->client = null;
    }

    private function helper_connect_imap() {
        global $CFG;

        $configuration = array(
            'username' => $CFG->messageinbound_hostuser,
            'password' => $CFG->messageinbound_hostpass,
            'hostspec' => $CFG->messageinbound_host,
            'secure'   => $CFG->messageinbound_hostssl,
        );

        $this->client = new Horde_Imap_Client_Socket($configuration);
        $this->client->login();

        // Delete the mailboxes.
        try {
            $this->client->expunge(\tool_messageinbound\manager::MAILBOX, array('delete' => true));
            $this->client->deleteMailbox(\tool_messageinbound\manager::MAILBOX);
            $this->client->expunge(\tool_messageinbound\manager::CONFIRMATIONFOLDER, array('delete' => true));
            $this->client->deleteMailbox(\tool_messageinbound\manager::CONFIRMATIONFOLDER);
        } catch (Horde_Imap_Client_Exception $e) {
            // Silently ignore the Horde_Imap_Client_Exception exception.
            // The mailbox may not exist.
        }

        // Create the inbox.
        try {
            $this->client->createMailbox(\tool_messageinbound\manager::MAILBOX);
        } catch (Horde_Imap_Client_Exception_ServerResponse $e) {
            // Silently ignore the Horde_Imap_Client_Exception_ServerResponse exception.
            // Some mailboxes are automatically re-created and must exist.
        }
    }

    private function helper_add_message_to_server($fixturename,
                                                  $from, $to,
                                                  $subject = null,
                                                  $read = false, $flagged = false,
                                                  $date = null,
                                                  $mailbox = null) {

        if ($mailbox === null) {
            $mailbox = \tool_messageinbound\manager::MAILBOX;
        }

        $fixturefile = __DIR__ . '/fixtures/' . $fixturename;
        if (!file_exists($fixturefile)) {
            $this->fail('Fixture not found ' . $fixturefile);
        }

        $flags = array();
        if ($read) {
            $flags[] = Horde_Imap_Client::FLAG_SEEN;
        }
        if ($flagged) {
            $flags[] = Horde_Imap_Client::FLAG_FLAGGED;
        }

        // Grab the fixture.
        $data = file_get_contents($fixturefile);

        $find = array();
        $replace = array();

        // Replace the date.
        $find[] = '__DATE__';
        $replace[] = new Horde_Imap_Client_Data_Format_DateTime(new DateTime($date));

        // Replace the Sender.
        $find[] = '__FROM__';
        $replace[] = $from;

        // Replace the Recipient.
        $find[] = '__TO__';
        $replace[] = $to;

        // Replace the subject.
        if ($subject === null) {
            $subject = 'Example subject';
        }
        $find[] = '__SUBJECT__';
        $replace[] = $subject;

        // Perform all of the replacements.
        $data = str_replace($find, $replace, $data);

        $uid = $this->client->append($mailbox, array(
            array(
                'data' => $data,
                'flags' => $flags,
                'internaldate' => new DateTime(),
            ),
        ));

        if (!($uid instanceof Horde_Imap_Client_Ids)) {
            $this->fail('IMAP server did not return client IDs for appended fixture');
        }

        return $uid;
    }

    private function helper_find_matches($matches) {
        $this->expectOutputRegex('/' . implode('.*', $matches) . '/sm');
    }

    public function test_no_imap_settings() {
        global $CFG;

        foreach ($this->requiredsettings as $settingtotest) {
            $tempsetting = $CFG->$settingtotest;
            unset($CFG->$settingtotest);

            $manager = new \tool_messageinbound\manager();

            $this->expectOutputRegex("/Inbound Message not fully configured - exiting early\./");
            $result = $manager->pickup_messages();
            $this->assertFalse($result);

            $CFG->$settingtotest = $tempsetting;
        }

    }

    public function test_invalid_imap_settings() {
        global $CFG;

        $backup = new stdClass();

        // Backup and change the mail settings.
        foreach ($this->settings as $setting) {
            $backup->$setting = $CFG->$setting;

            // Insert rubbish for all of the settings.
            $CFG->$setting = 'example';
        }

        $CFG->messageinbound_host = 'imap.example.com';
        $CFG->messageinbound_ssl = 'off';

        $manager = new \tool_messageinbound\manager();

        $this->expectOutputRegex("/Unable to connect to IMAP server. Failed with '.*'/");
        $result = $manager->pickup_messages();
        $this->assertFalse($result);

        // Restore the original settings.
        foreach ($this->settings as $setting) {
            if (isset($backup->$setting)) {
                $CFG->$setting = $backup->$setting;
            } else {
                unset($CFG->$setting);
            }
        }
    }

    public function test_empty_pickup() {
        $manager = new \tool_messageinbound\manager();

        $this->expectOutputRegex('/Found 0 messages to parse. Parsing\.\.\./');
        $result = $manager->pickup_messages();
        $this->assertTrue($result);
    }

    public function test_read_message_nonpickup() {
        // This test requires a single message for testing.
        $this->helper_add_message_to_server('basic.txt', 'foo@example.com', 'bar@example.com', null, true);

        $manager = new \tool_messageinbound\manager();

        // This regular expression should match:
        // Found 1 messages to parse.
        $this->expectOutputRegex('/Found 0 messages to parse. Parsing\.\.\./');
        $result = $manager->pickup_messages();
        $this->assertTrue($result);
    }

    public function test_flagged_message_nonpickup() {
        // This test requires a single message for testing.
        $this->helper_add_message_to_server('basic.txt', 'foo@example.com', 'bar@example.com', null, false, true);

        $manager = new \tool_messageinbound\manager();

        // This regular expression should match:
        // Found 1 messages to parse.
        $this->expectOutputRegex('/Found 0 messages to parse. Parsing\.\.\./');
        $result = $manager->pickup_messages();
        $this->assertTrue($result);
    }

    public function test_single_message_pickup() {
        // This test requires a single message for testing.
        $this->helper_add_message_to_server('basic.txt', 'foo@example.com', 'bar@example.com');

        $manager = new \tool_messageinbound\manager();

        // One message should be found, but the recipient does not have a valid handler address.
        $matches = array(
            "^Found 1 messages to parse. Parsing\.\.\.$",
            "^- Recipient '.*' did not match Inbound Message headers\.$",
        );
        $this->helper_find_matches($matches);
        $result = $manager->pickup_messages();
        $this->assertTrue($result);
    }

    public function test_valid_format_invalid_key() {
        global $CFG;

        $sender = 'sender@example.com';
        $recipient = $CFG->messageinbound_mailbox . '+key@' . $CFG->messageinbound_domain;
        $subject = 'Example message';
        $actualmessages = $this->helper_add_message_to_server('basic.txt', $sender, $recipient, $subject);

        $manager = new test_manager();

        // Connect the IMAP Client.
        $manager->connect_client();

        $query = new \Horde_Imap_Client_Fetch_Query();
        $query->envelope();
        $query->structure();
        $messages = $this->client->fetch(test_manager::MAILBOX, $query, array('ids' => $actualmessages));
        $message = $messages->first();

        // Because the search was performed manually, the current mailbox must be opened.
        $manager->open_mailbox();

        // One message should be found, but the recipient does not have a valid handler address.
        $matches = array(
            "^-- Subject:\t" . preg_quote($subject) . "$",
            "^-- From:\t" . preg_quote($sender) . "$",
            "^-- Recipient:\t" . preg_quote($recipient) . "$",
            "^-- Skipped message - it does not appear to relate to a Inbound Message pickup. Fail code .*$",
        );
        $this->helper_find_matches($matches);
        $result = $manager->process_message($message);
    }

}

class test_manager extends \tool_messageinbound\manager {
    public function connect_client() {
        $this->addressmanager = new \core\message\inbound\address_manager();
        return $this->get_imap_client();
    }
    public function test_mailbox() {
        return $this->client->currentMailbox();
    }
    public function open_mailbox($mailbox = null) {
        if ($mailbox === null) {
            $mailbox = self::MAILBOX;
        }
        return $this->client->openMailbox($mailbox);
    }
}

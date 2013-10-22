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
 * Mod chat step definitions
 *
 * @package    core
 * @category   test
 * @copyright  2013 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

// NOTE: no MOODLE_INTERNAL test here, this file may be required by behat before including /config.php.

require_once(__DIR__ . '/../../../../lib/behat/behat_base.php');

use Behat\Behat\Context\Step\Then as Then,
    Behat\Behat\Context\Step\When as When,
    Behat\Behat\Context\Step\Given as Given,
    Behat\Gherkin\Node\TableNode as TableNode;

/**
 * Chat-related step definitions.
 *
 * @package    core
 * @category   test
 * @copyright  2013 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class behat_mod_chat extends behat_base {

    /**
     * When on the chat view page, and after opening a new chat window, switch to that newly opened chat window.
     *
     * @When /^I switch to the chat window$/
     */
    public function i_switch_to_the_chat_window() {
        // Chat window names are currently in the format:
        //   "chat<courseid><chatid>[<group>]

        // Get the course ID from the breadcrumb:
        $coursenode = $this->find('xpath', '//div[@class="breadcrumb"]//a[contains(@href, "/course/view.php?id=")]');
        preg_match('/^.*\.php\?id=(?P<courseid>\d+).*$/', $coursenode->getAttribute('href'), $matches);
        $courseid = $matches['courseid'];

        // Get the instance ID and group ID from the clickable link:
        $enterlink = $this->find('xpath', '//div[@id="enterlink"]//a["' . get_string('enterchat', 'mod_chat') . '"]');

        preg_match('/^.*\.php\?id=(?P<instanceid>\d+)(&amp;group=(?P<groupid>\d+))?.*$/', $enterlink->getAttribute('href'), $matches);

        if (!isset($matches['groupid'])) {
            $matches['groupid'] = '';
        }

        $windowname = 'chat' . $courseid . '_' . $matches['instanceid'] . $matches['groupid'];
        return array(new Then('I switch to "' . $windowname . '" window'));
    }

    /**
     * When on the chat view page, open the chat window.
     *
     * @When /^I open the chat window$/
     */
    public function i_open_the_chat_window() {
        return array(
            new Given('I follow "' . get_string('enterchat', 'mod_chat') . '"'),
            new Given('I switch to the chat window'),
        );
    }

    /**
     * Given I have an open chat popup window, write some messages into the chat.
     *
     * @When /^I write in the chat session:$/
     * @param TableNode $table The chat messages
     * @return Given[]
     */
    public function i_write_in_the_chat_session(TableNode $table) {

        $listofactions = array(
            new Given('I open the chat window'),
        );

        // The action depends on the field type.
        $rows = $table->getRows();
        foreach ($rows as $rowno => $data) {
            $value = $this->escape($data[0]);
            $listofactions[] = new Given('I fill in "input-message" with "' . $value . '"');
            $listofactions[] = new Given('I click on "' . get_string('send', 'mod_chat') . '" "button"');
            $listofactions[] = new Given('I should see "' . $value . '"');
        }

        $listofactions[] = new Given('I close the current window');
        $listofactions[] = new Given('I switch to the main window');

        return $listofactions;

    }

    /**
     * Log in as the specified user, open the named course and chat, open the chat, and then enter some messages as that user.
     *
     * @When /^I write in chat "(?P<chatname_string>(?:[^"]|\\")*)" of "(?P<course_string>(?:[^"]|\\")*)" as "(?P<username_string>(?:[^"]|\\")*)":$/
     * @param String $chatname The name of the chat
     * @param String $course The name of the course
     * @param String $username The username to write as
     * @param TableNode $table The chat messages
     * @return Given[]
     */
    public function i_write_in_a_chat_session_as_user($chatname, $course, $username, TableNode $table) {

        $listofactions = array(
            new Given('I log in as "' . $this->escape($username) . '"'),
            new Given('I follow "' . $this->escape($course) . '"'),
            new Given('I follow "' . $this->escape($chatname) . '"'),
            new Given('I open the chat window'),
        );

        // The action depends on the field type.
        $rows = $table->getRows();
        foreach ($rows as $rowno => $data) {
            $value = $data[0];

            $listofactions[] = new Given('I fill in "input-message" with "' . $this->escape($value) . '"');
            $listofactions[] = new Given('I click on "' . get_string('send') . '" "button"');
            $listofactions[] = new Given('I should see "' . $this->escape($value) . '"');
        }

        $listofactions[] = new Given('I close the current window');
        $listofactions[] = new Given('I switch to the main window');

        return $listofactions;
    }

    /**
     * Given I'm logged in as a user, Then I can navigate to a chat and view the past sessions, and the past session includes the specified messages
     *
     * @Then /^I should see past chat sessions with messages:$/
     * @param TableNode $table The chat messages
     */
    public function user_can_see_past_chats_with_content(TableNode $table) {
        $listofactions = array(
            new Given('I follow "' . get_string('viewreport', 'mod_chat') . '"'),
            new Given('I should see "' . get_string('no_complete_sessions_found', 'mod_chat') . '"'),
            new Given('I follow "' . get_string('list_all_sessions', 'mod_chat') . '"'),
            new Given('I should see "' . get_string('listing_all_sessions', 'mod_chat') . '"'),
            new Given('I should see "' . get_string('seesession', 'mod_chat') . '"'),
            new Given('I follow "' . get_string('seesession', 'mod_chat') . '"'),
        );

        // The action depends on the field type.
        $rows = $table->getRows();
        foreach ($rows as $rowno => $data) {
            $value = $data[0];

            $listofactions[] = new Given('I should see "' . $this->escape($value) . '"');
        }

        return $listofactions;
    }

}

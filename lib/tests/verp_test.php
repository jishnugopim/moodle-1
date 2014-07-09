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
 * Tests for core_verp to test Variable Envelope Return Path functionality.
 *
 * @package    core
 * @category   phpunit
 * @copyright  2014 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();
require_once(__DIR__ . '/fixtures/verp_fixtures.php');

/**
 * Tests for core_verp to test Variable Envelope Return Path functionality.
 */
class core_verp_testcase extends advanced_testcase {

    /**
     * Perform setup tasks generic to each test.
     * This includes:
     * * configuring the verp_mailbox.
     */
    public function setUp() {
        global $CFG;

        $this->resetAfterTest(true);

        // Setup the default VERP mailbox settings.
        $CFG->verp_mailbox = 'moodlemoodlemoodle_';
        $CFG->verp_domain = 'example.com';
        $CFG->verp_enabled = true;
    }

    /**
     * Helper to create a new VERP handler.
     */
    public function helper_create_handler($handlerclass, $enabled = true, $component = 'core_test', $namespace = '\\core\\test\\') {
        global $DB;

        $classname = $namespace . $handlerclass;
        $record = \core\verp\manager::record_from_handler(new $classname());
        $record->component = $component;
        $record->enabled = $enabled;
        $record->id = $DB->insert_record('verp_handlers', $record);
        $handler = \core\verp\manager::handler_from_record($record);

        return $handler;
    }

    /**
     * Test that data items conform to RFCs 5231, and 5322 standards for
     * addressing, and to RFC 5233 for sub-addressing.
     */
    public function test_address_constraints() {
        $handler = $this->helper_create_handler('handler_one');

        // Using the handler created, generate an address for our data entry.
        $processor = new core_verp_test_helper();
        $processor->set_handler($handler->classname);

        // Generate some IDs for the data and generate addresses for them.
        $dataids = array(
            0,
            42,
            1073741823,
            2147483647,
        );

        $user = $this->getDataGenerator()->create_user();
        foreach($dataids as $dataid) {
            $processor->set_data($dataid);
            $address = $processor->generate($user->id);
            $this->assertNotNull($address);
            $this->assertTrue(strlen($address) > 0, 'No address generated.');
            $this->assertTrue(strpos($address, '@') !== false, 'No domain found.');
            $this->assertTrue(strpos($address, '+') !== false, 'No subaddress found.');

            // The localpart must be less than 64 characters.
            list($localpart) = explode('@', $address);
            $this->assertTrue(strlen($localpart) <= 64, 'Localpart section of address too long.');

            // And the data section should be no more than 55 characters.
            list(, $datasection) = explode('+', $localpart);
            $this->assertTrue(strlen($datasection) <= 55, 'Data section of address too long');
        }
    }

    /**
     * Test that the generated e-mail addresses are sufficiently random by
     * testing the multiple handlers, multiple users, and multiple data
     * items.
     */
    public function test_address_uniqueness() {
        // Generate a set of handlers. These are in two components, and each
        // component has two different generators.
        $handlers = array();
        $handlers[] = $this->helper_create_handler('handler_one', true, 'core_test');
        $handlers[] = $this->helper_create_handler('handler_two', true, 'core_test');
        $handlers[] = $this->helper_create_handler('handler_three', true, 'core_test_example');
        $handlers[] = $this->helper_create_handler('handler_four', true, 'core_test_example');

        // Generate some IDs for the data and generate addresses for them.
        $dataids = array(
            0,
            42,
            1073741823,
            2147483647,
        );

        $users = array();
        for ($i = 0; $i < 5; $i++) {
            $users[] = $this->getDataGenerator()->create_user();
        }

        // Store the addresses for later comparison.
        $addresses = array();

        foreach ($handlers as $handler) {
            $processor = new core_verp_test_helper();
            $processor->set_handler($handler->classname);

            // Check each dataid.
            foreach($dataids as $dataid) {
                $processor->set_data($dataid);

                // Check each user.
                foreach ($users as $user) {
                    $address = $processor->generate($user->id);
                    $this->assertFalse(isset($addresses[$address]));
                    $addresses[$address] = true;
                }
            }
        }
    }

    /**
     * Test address parsing of a generated address.
     */
    public function test_address_parsing() {
        $dataid = 42;

        // Generate a handler to use for this set of tests.
        $handler = $this->helper_create_handler('handler_one');

        // And a user.
        $user = $this->getDataGenerator()->create_user();

        // Using the handler created, generate an address for our data entry.
        $processor = new core_verp_test_helper();
        $processor->set_handler($handler->classname);
        $processor->set_data($dataid);
        $address = $processor->generate($user->id);

        // We should be able to parse the address.
        $parser = new core_verp_test_helper();
        $parser->process($address);
        $parsedresult = $parser->get_data();
        $this->assertEquals($user->id, $parsedresult->userid);
        $this->assertEquals($dataid, $parsedresult->datavalue);
        $this->assertEquals($dataid, $parsedresult->data->datavalue);
        $this->assertEquals($handler->id, $parsedresult->handlerid);
        $this->assertEquals($handler->id, $parsedresult->data->handler);
    }

    public function test_address_validation_invalid_format_failure() {
        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);

        // Check that validation fails when no address has been processed.
        $result = $parser->validate($user->email);
        $this->assertEquals(\core\verp\address::VALIDATION_INVALID_ADDRESS_FORMAT, $result);

        // Test that an address without data fails validation.
        $parser->process('bob@example.com');
        $result = $parser->validate($user->email);
        $this->assertEquals(\core\verp\address::VALIDATION_INVALID_ADDRESS_FORMAT, $result);

        // Test than address with a subaddress but invalid data fails with VALIDATION_UNKNOWN_DATAKEY.
        $parser->process('bob+nodata@example.com');
        $result = $parser->validate($user->email);
        $this->assertEquals(\core\verp\address::VALIDATION_INVALID_ADDRESS_FORMAT, $result);
    }

    public function test_address_validation_unknown_handler() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate($user->id);

        // Remove the handler record to invalidate it.
        $DB->delete_records('verp_handlers', array(
            'id' => $handler->id,
        ));

        $parser->process($address);
        $result = $parser->validate($user->email);
        $expectedfail = \core\verp\address::VALIDATION_UNKNOWN_HANDLER;
        $this->assertEquals($expectedfail, $result & $expectedfail);
    }

    public function test_address_validation_disabled_handler() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate($user->id);

        // Disable the handler.
        $record = \core\verp\manager::record_from_handler($handler);
        $record->enabled = false;
        $DB->update_record('verp_handlers', $record);

        $parser->process($address);
        $result = $parser->validate($user->email);
        $expectedfail = \core\verp\address::VALIDATION_DISABLED_HANDLER;
        $this->assertEquals($expectedfail, $result & $expectedfail);
    }

    public function test_address_validation_invalid_user() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate(-1);

        $parser->process($address);
        $result = $parser->validate($user->email);
        $expectedfail = \core\verp\address::VALIDATION_UNKNOWN_USER;
        $this->assertEquals($expectedfail, $result & $expectedfail);
    }

    public function test_address_validation_disabled_user() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate($user->id);

        // Unconfirm the user.
        $user->confirmed = 0;
        $DB->update_record('user', $user);

        $parser->process($address);
        $result = $parser->validate($user->email);
        $expectedfail = \core\verp\address::VALIDATION_DISABLED_USER;
        $this->assertEquals($expectedfail, $result & $expectedfail);
    }

    public function test_address_validation_invalid_key() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate($user->id);

        // Remove the data record to invalidate it.
        $DB->delete_records('verp_datakeys', array(
            'handler' => $handler->id,
            'datavalue' => $dataid,
        ));

        $parser->process($address);
        $result = $parser->validate($user->email);
        $expectedfail = \core\verp\address::VALIDATION_UNKNOWN_DATAKEY;
        $this->assertEquals($expectedfail, $result & $expectedfail);
    }

    public function test_address_validation_expired_key() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate($user->id);

        // Expire the key by setting it's expiry time in the past.
        $key = $DB->get_record('verp_datakeys', array(
            'handler' => $handler->id,
            'datavalue' => $dataid,
        ));

        $key->expires = time() - 3600;
        $DB->update_record('verp_datakeys', $key);

        $parser->process($address);
        $result = $parser->validate($user->email);
        $expectedfail = \core\verp\address::VALIDATION_EXPIRED_DATAKEY;
        $this->assertEquals($expectedfail, $result & $expectedfail);
    }

    public function test_address_validation_invalid_hash() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate($user->id);

        // Expire the key by setting it's expiry time in the past.
        $key = $DB->get_record('verp_datakeys', array(
            'handler' => $handler->id,
            'datavalue' => $dataid,
        ));

        $key->datakey = 'invalid value';
        $DB->update_record('verp_datakeys', $key);

        $parser->process($address);
        $result = $parser->validate($user->email);
        $expectedfail = \core\verp\address::VALIDATION_INVALID_HASH;
        $this->assertEquals($expectedfail, $result & $expectedfail);
    }

    public function test_address_validation_invalid_sender() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate($user->id);

        $parser->process($address);
        $result = $parser->validate('incorrectuser@example.com');
        $expectedfail = \core\verp\address::VALIDATION_ADDRESS_MISMATCH;
        $this->assertEquals($expectedfail, $result & $expectedfail);
    }

    public function test_address_validation_success() {
        global $DB;

        // Create test data.
        $user = $this->getDataGenerator()->create_user();
        $handler = $this->helper_create_handler('handler_one');
        $dataid = 42;

        $parser = new core_verp_test_helper();

        $generator = new core_verp_test_helper();
        $generator->set_handler($handler->classname);
        $generator->set_data($dataid);
        $address = $generator->generate($user->id);

        $parser->process($address);
        $result = $parser->validate($user->email);
        $this->assertEquals(\core\verp\address::VALIDATION_SUCCESS, $result);

    }

}

/**
 * A helper function for unit testing to expose protected functions in the core_verp API for testing.
 */
class core_verp_test_helper extends \core\verp\address {
    /**
     * The validate function.
     *
     * @param string $address
     * @return int
     */
    public function validate($address) {
        return parent::validate($address);
    }

    /**
     * The get_data function.
     *
     * @return stdClass
     */
    public function get_data() {
        return parent::get_data();
    }

    /**
     * The address processor function.
     *
     * @param string $address
     * @return void
     */
    public function process($address) {
        return parent::process($address);
    }
}

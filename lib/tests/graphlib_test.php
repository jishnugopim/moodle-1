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
 * Tests for graphlib.
 *
 * @package    core
 * @category   phpunit
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @author     Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();
global $CFG;
require_once($CFG->libdir . '/graphlib.php');

/**
 * Unit tests for lib/graphlib.php
 */
class core_graphlib_testcase extends advanced_testcase {

    private static $startdirection = null;
    private static $initialstringmanager = null;
    private static $stringmanager = null;

    public function setUp() {
        global $CFG;

        // We are changing $CFG. Ensure that we reset it after each test.
        $this->resetAfterTest(true);

        // In order to allow override of the RTL setting, we must use a custom string manager.
        $CFG->config_php_settings['customstringmanager'] = 'test_string_manager';

        // Force a generation of the string manager.
        self::$stringmanager = get_string_manager(true);
    }

    public function tearDown() {
        global $CFG;

        // To be on the safe side, force a reset the string manager after
        // resetting it to its original value.
        $CFG->config_php_settings['customstringmanager'] = self::$initialstringmanager;
        get_string_manager(true);
    }

    /**
     * @dataProvider prepare_label_text_provider
     */
    public function test_prepare_label_text_ltr($test, $ltrexpected, $rtlexpected) {
        global $CFG;

        // The prepare_label_text function is a private. Use Reflection to make it accessible for testing.
        $reflector = new ReflectionClass('graph');
        $graph = new graph();
        $method = $reflector->getMethod('prepare_label_text');
        $method->setAccessible(true);

        // Test using LTR direction.
        self::$stringmanager->ltr = 'ltr';
        $ltractual = $method->invoke($graph, $test);
        $this->assertEquals($ltrexpected, $ltractual);
    }

    /**
     * @dataProvider prepare_label_text_provider
     */
    public function test_prepare_label_text_rtl($test, $ltrexpected, $rtlexpected) {
        global $CFG;

        // The prepare_label_text function is a private. Use Reflection to make it accessible for testing.
        $reflector = new ReflectionClass('graph');
        $graph = new graph();
        $method = $reflector->getMethod('prepare_label_text');
        $method->setAccessible(true);

        // Test using RTL direction.
        self::$stringmanager->ltr = 'rtl';
        $rtlactual = $method->invoke($graph, $test);
        $this->assertEquals($rtlexpected, $rtlactual);
    }

    public function prepare_label_text_provider() {
        return array(
            array(
                'test'      => 'Monday 1st June',
                'ltr'       => 'Monday 1st June',
                'rtl'       => 'enuJ ts1 yadnoM',
            ),
            array(
                'test'      => 'Monday',
                'ltr'       => 'Monday',
                'rtl'       => 'yadnoM',
            ),
        );
    }
}

class test_string_manager extends core_string_manager_standard {
    public $ltr;

    public function get_string($identifier, $component = '', $a = null, $lang = null) {
        if ($identifier == 'thisdirection' && $component == 'langconfig') {
            return $this->ltr;
        }

        return parent::get_string($identifier, $component, $a, $lang);
    }
}

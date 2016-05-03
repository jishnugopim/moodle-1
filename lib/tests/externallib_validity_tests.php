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
 * Unit tests for /lib/filelib.php.
 *
 * @package   core_files
 * @category  phpunit
 * @copyright 2009 Jerome Mouneyrac
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;

class core_externallib_validity_testcase extends advanced_testcase {
    /**
     * A provider to get the list of service files.
     *
     * @return array
     */
    public function service_provider() {
        global $CFG;

        $files = [
            'core' => [$CFG->libdir . '/db/services.php'],
        ];

        $plugintypes = \core_component::get_plugin_types();
        foreach (array_keys($plugintypes) as $plugintype) {
            $plugintypelist = \core_component::get_plugin_list_with_file($plugintype, 'db/services.php');
            foreach ($plugintypelist as $plugintype => $file) {
                $files[$plugintype] = [$file];
            }
        }

        sort($files);
        return $files;
    }

    /**
     * A provider to return a list of the functions, and their definitions.
     *
     * @return array
     */
    public function function_provider() {
        $testcases = self::service_provider();
        $functions = null;
        $allfunctions = [];
        foreach ($testcases as $files) {
            foreach ($files as $file) {
                include($file);
                foreach ($functions as $function => $params) {
                    $allfunctions[$file . '::' . $function] = [
                        'function'  => $function,
                        'params'    => $params,
                    ];
                }
            }
        }

        return $allfunctions;
    }

    /**
     * Test that each of the specified service files exist.
     *
     * @dataProvider service_provider
     */
    public function test_file_exists($file) {
        $this->assertFileExists($file);
    }

    /**
     * Test that the functions array exists for each of the service files.
     *
     * @dataProvider service_provider
     */
    public function test_functions_exist($file) {
        $functions = null;
        include($file);
        $this->assertNotEmpty($functions);
    }

    /**
     * Ensure that when a classpath has been specified and is non-empty,
     * the path exists and is a file within the dirroot.
     *
     * @dataProvider function_provider
     */
    public function test_classpath_valid($function, $params) {
        global $CFG;
        if (!empty($params['classpath'])) {
            $fullpath = $CFG->dirroot . '/' . $params['classpath'];
            $this->assertFileExists($fullpath);
            $this->assertTrue(is_file($fullpath));
        }
    }

    /**
     * Ensure that the class and function defined exist, and where a
     * classpath exists, that the class is defined within that file.
     *
     * @dataProvider function_provider
     */
    public function test_class_and_function_exist($function, $params) {
        global $CFG;

        $this->assertNotNull($params['classname']);

        if (!empty($params['classpath'])) {
            $fullpath = $CFG->dirroot . '/' . $params['classpath'];
            require_once($fullpath);

            $rc = new \ReflectionClass($params['classname']);
            $this->assertEquals($fullpath, $rc->getFileName());
        }

        $this->assertTrue(class_exists($params['classname']));
        $this->assertNotNull($params['methodname']);

        $this->assertTrue(method_exists($params['classname'], $params['methodname']));
    }

    /**
     * Ensure that a description has been set.
     *
     * @dataProvider function_provider
     */
    public function test_description_set($function, $params) {
        $this->assertNotEmpty($params['description']);
    }

    /**
     * Ensure that the type is of the correct type.
     *
     * @dataProvider function_provider
     */
    public function test_type_set($function, $params) {
        $this->assertRegexp('/^(read|write|delete)$/', $params['type']);
        $this->assertRegexp('/^(read|write)$/', $params['type']);
    }

    /**
     * Ensure that where capabilites have been set, they exist within Moodle.
     *
     * @dataProvider function_provider
     */
    public function test_capabilities_set($function, $params) {
        if (!empty($params['capabilities'])) {
            $this->assertNotEmpty($params['capabilities']);

            $capabilities = explode(', ', $params['capabilities']);
            foreach ($capabilities as $capability) {
                $capability = trim($capability);
                $capinfo = get_capability_info($capability);
                $this->assertNotNull($capinfo);
            }
        } else {
            $this->assertArrayNotHasKey('capabilites', $params);
        }
    }

    /**
     * Ensure that a valid value has been set for AJAX.
     * @dataProvider function_provider
     */
    public function test_ajax_value($function, $params) {
        if (isset($params['ajax'])) {
            $this->assertInternalType('boolean', $params['ajax']);
        } else {
            $this->assertArrayNotHasKey('ajax', $params);
        }
    }
}

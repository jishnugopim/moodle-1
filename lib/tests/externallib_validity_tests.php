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
    public function service_file_provider() {
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
        $testcases = self::service_file_provider();
        $functions = null;
        $allfunctions = [];
        foreach ($testcases as $files) {
            foreach ($files as $file) {
                include($file);
                foreach ($functions as $function => $definition) {
                    $allfunctions[$file . '::' . $function] = [
                        'function'  => $function,
                        'params'    => $definition,
                    ];
                }
            }
        }

        return $allfunctions;
    }

    /**
     * A provider to return a list of the services definitions.
     *
     * @return array
     */
    public function services_provider() {
        $testcases = self::service_file_provider();
        $allfunctions = [];
        $allservices = [];
        foreach ($testcases as $files) {
            foreach ($files as $file) {
                $functions = null;
                $services = null;
                include($file);

                foreach (array_keys($functions) as $function) {
                    $allfunctions[$function] = true;
                }

                if (empty($services)) {
                    continue;
                }

                foreach ($services as $service => $definition) {
                    $allservices[$file . '::' . $service] = [
                        'service'       => $service,
                        'definition'    => $definition,
                        'allfunctions'     => [],
                    ];
                }

            }
        }

        // All services need to know about all functions.
        foreach (array_keys($allservices) as $service) {
            $allservices[$service]['allfunctions'] = $allfunctions;
        }

        return $allservices;
    }
    /**
     * Test that each of the specified service files exist.
     *
     * @dataProvider service_file_provider
     * @param   string  $file           The service file
     */
    public function test_file_exists($file) {
        $this->assertFileExists($file);
    }

    /**
     * Test that the functions array exists for each of the service files.
     *
     * @dataProvider service_file_provider
     * @param   string  $file           The service file
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
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_classpath_valid($function, $definition) {
        global $CFG;
        if (!empty($definition['classpath'])) {
            $fullpath = $CFG->dirroot . '/' . $definition['classpath'];
            $this->assertFileExists($fullpath);
            $this->assertTrue(is_file($fullpath));
        }
    }

    /**
     * Ensure that the class and function defined exist, and where a
     * classpath exists, that the class is defined within that file.
     *
     * @dataProvider function_provider
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_class_and_function_exist($function, $definition) {
        global $CFG;

        $this->assertNotNull($definition['classname']);

        if (!empty($definition['classpath'])) {
            $fullpath = $CFG->dirroot . '/' . $definition['classpath'];
            require_once($fullpath);

            $rc = new \ReflectionClass($definition['classname']);
            $this->assertEquals($fullpath, $rc->getFileName());
        }

        $this->assertTrue(class_exists($definition['classname']));
        $this->assertNotNull($definition['methodname']);

        $this->assertTrue(method_exists($definition['classname'], $definition['methodname']));
    }

    /**
     * Ensure that a description has been set.
     *
     * @dataProvider function_provider
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_description_set($function, $definition) {
        $this->assertNotEmpty($definition['description']);
    }

    /**
     * Ensure that the type is of the correct type.
     *
     * @dataProvider function_provider
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_type_set($function, $definition) {
        $this->assertRegexp('/^(read|write)$/', $definition['type']);
    }

    /**
     * Ensure that where capabilites have been set, they exist within Moodle.
     *
     * @dataProvider function_provider
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_capabilities_set($function, $definition) {
        if (!empty($definition['capabilities'])) {
            $this->assertNotEmpty($definition['capabilities']);

            $capabilities = explode(', ', $definition['capabilities']);
            foreach ($capabilities as $capability) {
                $capability = trim($capability);
                $capinfo = get_capability_info($capability);
                $this->assertNotNull($capinfo);
            }
        } else {
            $this->assertArrayNotHasKey('capabilites', $definition);
        }
    }

    /**
     * Ensure that the value for services is valid.
     *
     * @dataProvider function_provider
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_services_value($function, $definition) {
        if (isset($definition['services'])) {
            // There is only one valid service at this time.
            $this->assertEquals([MOODLE_OFFICIAL_MOBILE_SERVICE], $definition['services']);
        } else {
            $this->assertArrayNotHasKey('services', $definition);
        }
    }

    /**
     * Ensure that a valid value has been set for AJAX.
     *
     * @dataProvider function_provider
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_ajax_value($function, $definition) {
        if (isset($definition['ajax'])) {
            $this->assertInternalType('boolean', $definition['ajax']);
        } else {
            $this->assertArrayNotHasKey('ajax', $definition);
        }
    }

    /**
     * Ensure that a valid value has been set for loginrequired.
     *
     * @dataProvider function_provider
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_loginrequired($function, $definition) {
        if (isset($definition['loginrequired'])) {
            $this->assertInternalType('boolean', $definition['loginrequired']);
        } else {
            $this->assertArrayNotHasKey('loginrequired', $definition);
        }
    }

    /**
     * Ensure that only valid keys are specified in the function definition.
     *
     * @dataProvider function_provider
     * @param   string  $function       The external function name
     * @param   array   $definition     The function definition
     */
    public function test_function_has_valid_keys($function, $definition) {
        $validkeys = [
            'classpath',
            'classname',
            'methodname',
            'description',
            'type',
            'capabilities',
            'services',
            'ajax',
            'loginrequired',
        ];

        foreach ($validkeys as $key) {
            unset($definition[$key]);
        }

        $this->assertEmpty($definition);
    }

    /**
     * Ensure that all defined service functions exist.
     *
     * @dataProvider services_provider
     * @param   string  $service        The service name
     * @param   array   $definition     The service definition
     * @param   array   $allfunctions   The list of all external functions
     */
    public function test_service_functions_exist($service, $definition, $allfunctions) {
        foreach ($definition['functions'] as $function) {
            $this->assertArrayHasKey($function, $allfunctions);
        }
    }

    /**
     * Ensure that the 'enabled' value is of the correct type.
     *
     * @dataProvider services_provider
     * @param   string  $service        The service name
     * @param   array   $definition     The service definition
     * @param   array   $allfunctions   The list of all external functions
     */
    public function test_service_enabled_value($service, $definition, $allfunctions) {
        $this->assertInternalType('integer', $definition['enabled']);
    }

    /**
     * Ensure that the 'restrictedusers' value is of the correct type.
     *
     * @dataProvider services_provider
     * @param   string  $service        The service name
     * @param   array   $definition     The service definition
     * @param   array   $allfunctions   The list of all external functions
     */
    public function test_service_restrictedusers_value($service, $definition, $allfunctions) {
        $this->assertInternalType('integer', $definition['restrictedusers']);
    }

    /**
     * Ensure that the 'shortname' value is of the correct type.
     *
     * @dataProvider services_provider
     * @param   string  $service        The service name
     * @param   array   $definition     The service definition
     * @param   array   $allfunctions   The list of all external functions
     */
    public function test_service_shortname_value($service, $definition, $allfunctions) {
        $this->assertInternalType('string', $definition['shortname']);
    }

    /**
     * Ensure that the 'downloadfiles' value is of the correct type.
     *
     * @dataProvider services_provider
     * @param   string  $service        The service name
     * @param   array   $definition     The service definition
     * @param   array   $allfunctions   The list of all external functions
     */
    public function test_service_downloadfiles_value($service, $definition, $allfunctions) {
        $this->assertInternalType('integer', $definition['downloadfiles']);
    }

    /**
     * Ensure that the 'uploadfiles' value is of the correct type.
     *
     * @dataProvider services_provider
     * @param   string  $service        The service name
     * @param   array   $definition     The service definition
     * @param   array   $allfunctions   The list of all external functions
     */
    public function test_service_uploadfiles_value($service, $definition, $allfunctions) {
        $this->assertInternalType('integer', $definition['uploadfiles']);
    }

    /**
     * Ensure that only valid keys are specified in the service definition.
     *
     * @dataProvider services_provider
     * @param   string  $service        The service name
     * @param   array   $definition     The service definition
     * @param   array   $allfunctions   The list of all external functions
     */
    public function test_service_has_valid_keys($service, $definition, $allfunctions) {
        $validkeys = [
            'functions',
            'enabled',
            'restrictedusers',
            'shortname',
            'downloadfiles',
            'uploadfiles',
        ];

        foreach ($validkeys as $key) {
            unset($definition[$key]);
        }

        $this->assertEmpty($definition);
    }

}

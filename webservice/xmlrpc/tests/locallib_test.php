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
 * Unit tests for the XML-RPC web service.
 *
 * @package    webservice_xmlrpc
 * @category   test
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/webservice/xmlrpc/locallib.php');

/**
 * Unit tests for the XML-RPC web service.
 *
 * @package    webservice_xmlrpc
 * @category   test
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class webservice_xmlrpc_locallib_test extends advanced_testcase {

    public function setUp() {
        // All tests require xmlrpc. Skip tests, if xmlrpc is not installed.
        if (!function_exists('xmlrpc_decode')) {
            $this->markTestSkipped('XMLRPC is not installed.');
        }
    }

    public function generate_error_provider() {
        return [
            'Standard exception with default faultcode' => [
                new \Exception(),
                null,
                '<?xml version="1.0" encoding="UTF-8"?><methodResponse><fault><value><struct><member><name>faultCode</name><value><int>404</int></value></member><member><name>faultString</name><value><string/></value></member></struct></value></fault></methodResponse>'
            ],
            'Standard exception with default faultcode and exception content' => [
                new \Exception('Invalid blueberry detected'),
                null,
                '<?xml version="1.0" encoding="UTF-8"?><methodResponse><fault><value><struct><member><name>faultCode</name><value><int>404</int></value></member><member><name>faultString</name><value><string>Invalid blueberry detected</string></value></member></struct></value></fault></methodResponse>'
            ],
            'Standard exception with default faultcode and non-UTF8 content' => [
                new \Exception('გთხოვთ ახლავე გაიაროთ რეგისტრაცია'),
                null,
                '<?xml version="1.0" encoding="UTF-8"?><methodResponse><fault><value><struct><member><name>faultCode</name><value><int>404</int></value></member><member><name>faultString</name><value><string>გთხოვთ ახლავე გაიაროთ რეგისტრაცია</string></value></member></struct></value></fault></methodResponse>'
            ],
        ];
    }

    /**
     * @dataProvider generate_error_provider
     */
    public function test_generate_error($exception, $code, $expected) {
        $server = $this->getMockBuilder('webservice_xmlrpc_server')
            ->disableOriginalConstructor()
            ->setMethods(null)
            ->getMock();

        $rc = new \ReflectionClass('webservice_xmlrpc_server');
        $rcm = $rc->getMethod('generate_error');
        $rcm->setAccessible(true);

        if ($code === null) {
            $result = $rcm->invokeArgs($server, [$exception]);
        } else {
            $result = $rcm->invokeArgs($server, [$exception, $code]);
        }
        $this->assertEquals($expected, $result);
    }

}

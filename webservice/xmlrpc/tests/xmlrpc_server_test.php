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
 * Unit tests for the XML-RPC web service server.
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
 * Unit tests for the XML-RPC web service server.
 *
 * @package    webservice_xmlrpc
 * @category   test
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class xmlrpc_server_test extends advanced_testcase {

    /**
     * Data provider for testing parse_request.
     *
     * @return array
     */
    public function parse_request_provider() {
        $xml = '<?xml version="1.0"?>';
        $emptymethod = '<methodName></methodName>';
        $invalidmethod = '<methodName>invalid_service_name</methodName>';

        // This valid webservice call has one required param ('component'), and one optional param ('lang').
        $validmethod = '<methodName>core_get_component_strings</methodName>';
        $emptyparams = '<params></params>';
        $requiredparams = '<params><param><value><string>moodle</string></value></param></params>';
        $allparams = '<params><param><value><string>moodle</string></value></param><param><value><string>en</string></value></param></params>';

        return [
                'Invalid XML call' => [
                        'Lorem ipsum',
                        ['invalid_parameter_exception', 'Malformed request'],
                        null,
                        null
                    ],
                'No method, no params' => [
                        "{$xml}<methodCall>{$emptymethod}</methodCall>",
                        ['invalid_parameter_exception', 'Malformed request'],
                        null,
                        null
                    ],
                'Valid method, no params' => [
                        "{$xml}<methodCall>{$validmethod}</methodCall>",
                        ['invalid_parameter_exception', 'Malformed request'],
                        null,
                        null
                    ],
                'Valid method, empty params' => [
                        "{$xml}<methodCall>{$validmethod}{$emptyparams}</methodCall>",
                        ['invalid_parameter_exception', 'Malformed request'],
                        null,
                        null
                    ],
                'Valid method, required params only' => [
                        "{$xml}<methodCall>{$validmethod}{$requiredparams}</methodCall>",
                        null,
                        'core_get_component_strings',
                        ['component' => 'moodle'],
                    ],
                'Valid method, all params' => [
                        "{$xml}<methodCall>{$validmethod}{$allparams}</methodCall>",
                        null,
                        'core_get_component_strings',
                        ['component' => 'moodle', 'lang' => 'en'],
                    ],
                'Invalid method, no params' => [
                        "{$xml}<methodCall>{$invalidmethod}</methodCall>",
                        ['invalid_parameter_exception', 'Malformed request'],
                        null,
                        null
                    ],
                'Invalid method, empty params' => [
                        "{$xml}<methodCall>{$invalidmethod}{$emptyparams}</methodCall>",
                        ['invalid_parameter_exception', 'Malformed request'],
                        null,
                        null
                    ],
                'Invalid method, valid params' => [
                        "{$xml}<methodCall>{$invalidmethod}{$requiredparams}</methodCall>",
                        ['dml_missing_record_exception'],
                        null,
                        null
                    ],
            ];
    }

    /**
     * Test parameter parsing.
     *
     * @dataProvider parse_request_provider
     */
    public function test_parse_request($input, $expectedexception, $expectfunction, $expectparams) {
        $server = $this->getMockBuilder('\webservice_xmlrpc_server')
            ->setMethods([
                    'fetch_input_content',
                ])
            ->disableOriginalConstructor()
            ->getMock()
            ;

        $server->method('fetch_input_content')
            ->willReturn($input)
            ;

        if ($expectedexception) {
            call_user_func_array([$this, 'setExpectedException'], $expectedexception);
        }

        $rc = new \ReflectionClass('\webservice_xmlrpc_server');
        $rcm = $rc->getMethod('parse_request');
        $rcm->setAccessible(true);
        $rcm->invoke($server);

        $rcp = $rc->getProperty('functionname');
        $rcp->setAccessible(true);
        $this->assertEquals($expectfunction, $rcp->getValue($server));

        $rcp = $rc->getProperty('parameters');
        $rcp->setAccessible(true);
        $this->assertEquals($expectparams, $rcp->getValue($server));
    }
}

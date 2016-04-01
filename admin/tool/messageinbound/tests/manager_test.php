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
 * admintool_messageinbound Tests.
 *
 * @package    core
 * @category   phpunit
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();


/**
 * admintool_messageinbound Tests.
 *
 * @category   phpunit
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class admintool_messageinbound_testcase extends advanced_testcase {

    public function is_bulk_message_provider() {
        return [
            'Precedence: bulk, no return-path' => [
                'headers'       => [
                    ['Precedence',      \Horde_Mime_Headers::VALUE_STRING, 'bulk'],
                ],
                'contenttype'   => [],
                'expectation'   => true,
            ],
            'X-Autoreply: set, no return-path' => [
                'headers'       => [
                    ['X-Autoreply',     \Horde_Mime_Headers::VALUE_STRING, 'yes'],
                ],
                'contenttype'   => [],
                'expectation'   => true,
            ],
            'Bulk header with return path and content type of delivery-status' => [
                'headers'       => [
                    ['Precedence',      \Horde_Mime_Headers::VALUE_STRING, 'bulk'],
                    ['Return-Path',     \Horde_Mime_Headers::VALUE_STRING, '<>'],
                ],
                'contenttype'   => ['message/delivery-status'],
                'expectation'   => true,
            ],
        ];
    }

    /**
     * @dataProvider is_bulk_message_provider
     */
    public function test_is_bulk_message($headers, $contenttype, $expectation) {
        $manager = new \tool_messageinbound\manager();

        // Parts of the manager are protected or private. We need to use reflection to access them.
        $rc = new \ReflectionClass('\\tool_messageinbound\\manager');

        $mockclient = $this->getMockBuilder('\Horde_Imap_Client_Socket')
            ->disableOriginalConstructor()
            ->setMethods(['fetch', 'currentMailbox'])
            ->getMock();

        $messagedata = $this->getMockBuilder('\Horde_Imap_Client_Fetch_Results')
            ->disableOriginalConstructor()
            ->setMethods(['first', 'getStructure'])
            ->getMock();

        $datamock = $this->getMockBuilder('\Horde_Imap_Client_Data_Fetch')
            ->disableOriginalConstructor()
            ->setMethods(['getHeaderText'])
            ->getMock();

        $mimeheadermock = $this->getMockBuilder('\Horde_Mime_Headers')
            ->disableOriginalConstructor()
            ->setMethods(['getValue'])
            ->getMock();

        $mockclient
            ->method('fetch')
            ->willReturn($messagedata);

        $mockclient
            ->method('currentMailbox')
            ->willReturn(['mailbox' => 'example']);

        $messagedata
            ->method('first')
            ->willReturn($datamock);

        $structuremock = $this->getMockBuilder('\Horde_Mime_Part')
            ->setMethods(['contentTypeMap'])
            ->getMock();

        $structuremock
            ->method('contentTypeMap')
            ->willReturn($contenttype);

        $messagedata
            ->method('getStructure')
            ->willReturn($structuremock);

        $datamock
            ->method('getHeaderText')
            ->willReturn($mimeheadermock);

        $mimeheadermock
            ->method('getValue')
            ->will($this->returnValueMap($headers));

        // Set the mocked client.
        $rcp = $rc->getProperty('client');
        $rcp->setAccessible(true);
        $rcp->setValue($manager, $mockclient);

        // Mock the message - this isn't actually used.
        $message = $this->getMockBuilder('\Horde_Imap_Client_Data_Fetch')
            ->disableOriginalConstructor()
            ->getMock();
        $rcm = $rc->getMethod('is_bulk_message');
        $rcm->setAccessible(true);

        // Callt he is_bulk_message function against the mock.
        $result = $rcm->invoke($manager, $message, 1);
        $this->assertEquals($expectation, $result);
    }
}

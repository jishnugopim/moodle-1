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
 * Test classes for \core\message\inbound.
 *
 * @package core_message
 * @category test
 * @copyright 2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;

/**
 * Test script for message class.
 *
 * @package core_message
 * @category test
 * @copyright 2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class core_messageinbound_testcase extends advanced_testcase {

    /**
     * @dataProvider message_inbound_handler_trim_testprovider
     */
    public function test_messageinbound_handler_trim($file, $source, $expectedcontent) {
        $this->resetAfterTest();

        $messagedata = $this->create_messagedata($source);
        list($actual, $format) = test_handler::remove_quoted_text($messagedata);
        $this->assertEquals($expectedcontent, $actual);
        //$this->assertEquals($expectedformat, $format);
    }

    public function message_inbound_handler_trim_testprovider() {
        $fixturesdir = realpath(__DIR__ . '/fixtures/messageinbound/');
        $tests = array();
        $iterator = new \RecursiveIteratorIterator(
                new \RecursiveDirectoryIterator($fixturesdir),
                \RecursiveIteratorIterator::LEAVES_ONLY);

        foreach ($iterator as $file) {
            if (!preg_match('/\.test$/', $file)) {
                continue;
            }

            try {
                $testdata = $this->read_test_file($file, $fixturesdir);
            } catch (\Exception $e) {
                die($e->getMessage());
            }

            $test = array(
                    // The filename.
                    basename($file),

                    $testdata['FULLSOURCE'],

                    // The expected trimming of this message.
                    $testdata['EXPECTED'],
                );

            $tests[basename($file)] = $test;
        }
        return $tests;
    }

    protected function read_test_file(\SplFileInfo $file, $fixturesdir) {
        // Break on the --[TOKEN]-- tags in the file.
        $tokens = preg_split('#(?:^|\n*)----([A-Z-]+)----\n#', file_get_contents($file->getRealPath()),
                null, PREG_SPLIT_DELIM_CAPTURE);
        $sections = array(
            // Key              => Required.
            'FULLSOURCE'        => true,
            'EXPECTED'          => false,
        );
        $section = null;
        foreach ($tokens as $i => $token) {
            if (null === $section && empty($token)) {
                continue; // skip leading blank
            }
            if (null === $section) {
                if (!isset($sections[$token])) {
                    continue;
                }
                $section = $token;
                continue;
            }
            $sectiondata = $token;
            $data[$section] = $sectiondata;
            $section = $sectiondata = null;
        }
        foreach ($sections as $section => $required) {
            if ($required && !isset($data[$section])) {
                throw new coding_exception(sprintf(
                    'The test file "%s" must have a section named "%s".',
                    str_replace($fixturesdir.'/', '', $file),
                    $section
                ));
            } else if (!isset($data[$section])) {
                $data[$section] = null;
            }
        }
        return $data;
    }

    protected function create_messagedata($source) {
        $mime = Horde_Mime_Part::parseMessage($source);
        $headers = Horde_Mime_Headers::parseHeaders($source);

        $messagedata = new \stdClass();
        $messagedata->subject = $headers->getValue('Subject');
        $messagedata->messageid = $headers->getValue('Message-Id');
        $messagedata->date = $headers->getValue('Date');
        $messagedata->headers = $headers->toString();

        if ($plainpartid = $mime->findBody('html')) {
            $messagedata->plain = $mime->getPart($plainpartid)->getContents();
        } else {
            $messagedata->plain = null;
        }

        if ($htmlpartid = $mime->findBody('html')) {
            $messagedata->html = $mime->getPart($htmlpartid)->getContents();
        } else {
            $messagedata->html = null;
        }
        return $messagedata;
    }
}

class test_handler extends \core\message\inbound\handler {

    protected function get_description() {}

    /**
     * Return a name for the current handler.
     * This appears in the admin pages as a human-readable name.
     *
     * @return string
     */
    protected function get_name() {}

    /**
     * Process the message against the current handler.
     *
     * @param \stdClass $record The Inbound Message Handler record
     * @param \stdClass $messagedata The message data
     */
    public function process_message(\stdClass $record, \stdClass $messagedata) {}

    public static function remove_quoted_text($messagedata) {
        return parent::remove_quoted_text($messagedata);
    }

    public static function get_linecount_to_remove($messagedata) {
        return parent::get_linecount_to_remove($messagedata);
    }
}

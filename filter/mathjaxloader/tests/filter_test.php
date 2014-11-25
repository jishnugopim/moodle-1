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
 * Unit test for the filter_mathjaxloader
 *
 * @package    filter_mathjaxloader
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/filter/mathjaxloader/filter.php');


/**
 * Unit tests for filter_mathjaxloader.
 *
 * Test the delimiter parsing used by the mathjaxloader filter.
 *
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class filter_mathjaxloader_testcase extends advanced_testcase {

    protected $filter;

    protected function setUp() {
        parent::setUp();
        $this->resetAfterTest(true);
        $this->filter = new filter_mathjaxloader(context_system::instance(), array());
    }

    /**
     * Test cases for the test_delimiters test.
     */
    public function delimeter_provider() {
        return array(
            // First test the list of supported delimiters.
            array('\\(', '\\)'),
            array('\\[', '\\]'),

            // Test the legacy delimeters without texfiltercompatibility enabled.
            array('[tex]', '[/tex]', false, false),
            array('<tex>', '</tex>', false, false),
            array('<tex alt="nonsense">', '</tex>', false, false),

            // This is a legacy delimeter which has mistakenly not been made legacy only.
            array('$$', '$$'),

            // Test the legacy delimeters with texfiltercompatibility enabled.
            array('[tex]', '[/tex]', true, true),
            array('<tex>', '</tex>', true, true),
            array('<tex alt="nonsense">', '</tex>', true, true),
            array('$$', '$$', true, true),

            // Now test some cases that shouldn't be executed.
            array('<textarea>', '</textarea>', false, false),
            array('$', '$', false, false),
            array('(', ')', false, false),
            array('[', ']', false, false),
            array('$$', '\\]', false, false),
        );
    }

    /**
     * Test with various delimeters
     *
     * @dataProvider  delimeter_provider
     */
    public function test_delimiters($start, $end, $enablelegacy = false, $filtershouldrun = true) {
        $pre = 'Some pre text';
        $post = 'Some post text';
        $equation = ' \sum{a^b} ';

        set_config('texfiltercompatibility', $enablelegacy, 'filter_mathjaxloader');

        $before = $pre . $start . $equation . $end . $post;

        $after = trim($this->filter->filter($before));

        if ($filtershouldrun) {
            $this->assertNotEquals($before, $after);
        } else {
            $this->assertEquals($before, $after);
        }
    }

    /**
     * Test cases for the strings test.
     */
    public function strings_provider() {
        $pre = 'Some pre text';
        $post = 'Some post text';
        $equation = ' \sum{a^b} ';

        $startbrace = '\\(';
        $endbrace = '\\)';
        $startsquare = '\\[';
        $endsquare = '\\]';
        $startwrapper = filter_mathjaxloader::START_WRAPPER;
        $endwrapper = filter_mathjaxloader::END_WRAPPER;

        return array(
            // Test nested pairs with braces.
            // These are not wholly supported and YMMV, but we work backwards and only wrap a whole matching pair.
            array(
                $pre . $startbrace                 . $startbrace . $equation . $endbrace . $endbrace               . $post,
                $pre . $startbrace . $startwrapper . $startbrace . $equation . $endbrace . $endbrace . $endwrapper . $post,
            ),

            // Test nested pairs with squares.
            array(
                $pre . $startsquare                 . $startsquare . $equation . $endsquare . $endsquare               . $post,
                $pre . $startsquare . $startwrapper . $startsquare . $equation . $endsquare . $endsquare . $endwrapper . $post,
            ),

            // Test nested pairs with a mixture.
            array(
                $pre                 . $startbrace . $startsquare . $equation . $endsquare . $endbrace               . $post,
                $pre . $startwrapper . $startbrace . $startsquare . $equation . $endsquare . $endbrace . $endwrapper . $post,
            ),

            array(
                $pre . $startsquare                 . $startbrace . $equation . $endbrace               . $endsquare . $post,
                $pre . $startsquare . $startwrapper . $startbrace . $equation . $endbrace . $endwrapper . $endsquare . $post,
            ),

            // Test nested pairs with a mismatched open/close.
            array(
                $pre                 . $startbrace . $startsquare . $equation . $endbrace               . $endsquare . $post,
                $pre . $startwrapper . $startbrace . $startsquare . $equation . $endbrace . $endwrapper . $endsquare . $post,
            ),

            array(
                $pre . $startsquare                 . $startbrace . $equation . $endsquare . $endbrace               . $post,
                $pre . $startsquare . $startwrapper . $startbrace . $equation . $endsquare . $endbrace . $endwrapper . $post,
            ),

            // Test subsequent equations.
            array(
                $pre                 . $startbrace . $equation . $endbrace
                                                     . $startbrace . $equation . $endbrace               . $post,
                $pre . $startwrapper . $startbrace . $equation . $endbrace . $endwrapper
                                     . $startwrapper . $startbrace . $equation . $endbrace . $endwrapper . $post,
            ),
        );
    }

    /**
     * Test filter when equations are in the middle of strings and using various delimeters.
     *
     * @dataProvider  strings_provider
     */
    public function test_in_strings($input, $expected) {
        $after = trim($this->filter->filter($input));
        $this->assertEquals($expected, $after);
    }

}

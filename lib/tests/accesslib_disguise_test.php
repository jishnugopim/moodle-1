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
 * Functional testing of the disguise components for accesslib.
 *
 * @package    core
 * @category   phpunit
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();


class core_accesslib_disguise_testcase extends advanced_testcase {
    public function test_disguiseid() {
        $context = $this->getMockForAbstractClass('context_system', array(), '', false, true, true, array('__get'));

        $context->expects($this->once())
            ->method('__get')
            ->with($this->equalTo('disguise'))
            ->will($this->returnValue(null))
            ;

        $this->assertNull($context->disguise);
    }

    public function test_disguise2() {
        $context = $this->getMockForAbstractClass(
            'context_system',
            array(),
            '',
            false,
            true,
            true,
            array('__get')
        );

        $getter_map = array(
            array('id', '300'),
            array('path', '/1/20/300'),
            array('disguise', null),
        );

        $context->expects($this->once())
            ->method('__get')
            ->will($this->returnValueMap($getter_map))
            ;

        $this->assertNull($context->disguise);
    }

    /**
     * @dataProvider disguiseProvider
     */
    public function test_disguise_prov($map__get, $expect) {
        $context = $this->getMockForAbstractClass(
            'context_system',
            array(),
            '',
            false,
            true,
            true,
            array('__get')
        );

        $context->expects($this->once())
            ->method('__get')
            ->will($this->returnValueMap($map__get))
            ;

        $this->assertEquals($expect, $context->disguise);
    }

    public function disguiseProvider() {
        return array(
            'None' => array(
                'map__get' => array(
                    array('disguise', null),
                ),
                'disguises' => array(
                ),
                'expect' => null,
            ),
            'Inheritted' => array(
                'map__get' => array(
                    array('disguise', null),
                ),
                'expect' => null,
            ),
        );
    }

    public function test_inheritted_disguise() {
        global $DB;
        $this->resetAfterTest();

        // Create a disguise.
        $disguise = (object) array(
            'type'  => 'basic',
        );

        $disguise->id = $DB->insert_record('disguises', $disguise);
        $disguise = $DB->get_record('disguises', array('id' => $disguise->id));

        // Create a module context.
        $course = $this->getDataGenerator()->create_course();
        $page = $this->getDataGenerator()->create_module('page', array('course' => $course->id));
        $modcontext = context_module::instance($page->cmid);

        // Test all contexts from system to module.
        $contexts = array(
            context_system::instance(),
            context_coursecat::instance($course->category),
            context_course::instance($course->id),
            context_module::instance($page->cmid),
        );
        foreach ($contexts as $context) {
            $this->assertEquals(0, $context->disguiseid);
            $this->assertEquals(0, $context->inheritteddisguiseid);
            $this->assertNull($context->disguise);
        }

        // Set the coursecontext disguise.
        $coursecontext = context_course::instance($course->id);
        $DB->set_field('context', 'disguiseid', $disguise->id, array('id' => $coursecontext->id));

        // Reset the caches.
        context_helper::reset_caches();

        // Test all parent contexts.
        $contexts = array(
            context_system::instance(),
            context_coursecat::instance($course->category),
        );
        foreach ($contexts as $context) {
            $this->assertEquals(0, $context->disguiseid);
            $this->assertEquals(0, $context->inheritteddisguiseid);
            $this->assertNull($context->disguise);
        }

        // Test the modified context.
        $context = context_course::instance($course->id);
        $this->assertEquals($disguise->id, $context->disguiseid);
        $this->assertEquals($disguise->id, $context->inheritteddisguiseid);

        // Test all child contexts.
        $contexts = array(
            context_module::instance($page->cmid),
        );
        foreach ($contexts as $context) {
            $this->assertEquals(0, $context->disguiseid);
            $this->assertEquals($disguise->id, $context->inheritteddisguiseid);
        }
    }
}

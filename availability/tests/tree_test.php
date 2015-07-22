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
 * Unit tests for the condition tree class and related logic.
 *
 * @package core_availability
 * @copyright 2014 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

use core_availability\capability_checker;
use \core_availability\tree;

defined('MOODLE_INTERNAL') || die();

/**
 * Unit tests for the condition tree class and related logic.
 *
 * @package core_availability
 * @copyright 2014 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tree_testcase extends \advanced_testcase {
    public function setUp() {
        // Load the mock classes so they can be used.
        require_once(__DIR__ . '/fixtures/mock_condition.php');
        require_once(__DIR__ . '/fixtures/mock_info.php');
    }

    /**
     * The dataProvider for test_construct_errors.
     */
    public function construct_errors_provider() {
        return array(
            array(
                'name' => 'String instead of object',
                'test' => array(
                    'tree' => 'frog',
                ),
                'assertions' => array(
                    'contains' => 'not object',
                ),
            ),
            array(
                'name' => 'Missing ->op',
                'test' => array(
                    'tree' => (object) array(),
                ),
                'assertions' => array(
                    'contains' => 'missing ->op',
                ),
            ),
            array(
                'name' => 'Unknown ->op',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '*'
                    ),
                ),
                'assertions' => array(
                    'contains' => 'unknown ->op',
                ),
            ),
            array(
                'name' => 'missing ->show',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '|'
                    ),
                ),
                'assertions' => array(
                    'contains' => 'missing ->show',
                ),
            ),
            array(
                'name' => 'show not bool',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '|',
                        'show' => 0,
                    ),
                ),
                'assertions' => array(
                    'contains' => '->show not bool',
                ),
            ),
            array(
                'name' => 'missing ->showc',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '&'
                    ),
                ),
                'assertions' => array(
                    'contains' => 'missing ->showc',
                ),
            ),
            array(
                'name' => '->showc not array',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '&',
                        'showc' => 0,
                    ),
                ),
                'assertions' => array(
                    'contains' => '->showc not array',
                ),
            ),
            array(
                'name' => '->showc value not bool',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '&',
                        'showc' => array(0),
                    ),
                ),
                'assertions' => array(
                    'contains' => '->showc value not bool',
                ),
            ),
            array(
                'name' => 'missing ->c',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '|',
                        'show' => true,
                    ),
                ),
                'assertions' => array(
                    'contains' => 'missing ->c',
                ),
            ),
            array(
                'name' => '->c not array',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '|',
                        'show' => true,
                        'c' => 'side',
                    ),
                ),
                'assertions' => array(
                    'contains' => '->c not array',
                ),
            ),
            array(
                'name' => 'child not object',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '|',
                        'show' => true,
                        'c' => array(3),
                    ),
                ),
                'assertions' => array(
                    'contains' => 'child not object',
                ),
            ),
            array(
                'name' => 'Unknown condition type: doesnotexist',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '|',
                        'show' => true,
                        'c' => array(
                            (object) array(
                                'type' => 'doesnotexist',
                            ),
                        ),
                    ),
                ),
                'assertions' => array(
                    'contains' => 'Unknown condition type: doesnotexist',
                ),
            ),
            array(
                'name' => 'missing ->op',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '|',
                        'show' => true,
                        'c' => array(
                            (object) array(
                            ),
                        ),
                    ),
                ),
                'assertions' => array(
                    'contains' => 'missing ->op',
                ),
            ),
            array(
                'name' => '->c, ->showc mismatch',
                'test' => array(
                    'tree' => (object) array(
                        'op' => '&',
                        'c' => array(
                            (object) array(
                                'op' => '&',
                                'c' => array(),
                            ),
                        ),
                        'showc' => array(true, true),
                    ),
                ),
                'assertions' => array(
                    'contains' => '->c, ->showc mismatch',
                ),
            ),
        );
    }

    /**
     * Tests constructing a tree with errors.
     * @dataProvider construct_errors_provider
     */
    public function test_construct_errors($name, $test, $expects) {
        $this->setExpectedException('coding_exception', $expects['contains']);
        if (isset($test['tree'])) {
            new tree($test['tree']);
        }
    }

    /**
     * Tests constructing a tree with plugin that does not exist (ignored).
     */
    public function test_construct_ignore_missing_plugin() {
        // Construct a tree with & combination of one condition that doesn't exist.
        $tree = new tree(tree::get_root_json(array(
                (object)array('type' => 'doesnotexist')), tree::OP_OR), true);
        // Expected result is an empty tree with | condition, shown.
        $this->assertEquals('+|()', (string)$tree);
    }

    /**
     * Tests constructing a tree with subtrees using all available operators.
     */
    public function test_construct_just_trees() {
        $structure = tree::get_root_json(array(
                tree::get_nested_json(array(), tree::OP_OR),
                tree::get_nested_json(array(
                    tree::get_nested_json(array(), tree::OP_NOT_OR)), tree::OP_NOT_AND)),
                tree::OP_AND, array(true, true));
        $tree = new tree($structure);
        $this->assertEquals('&(+|(),+!&(!|()))', (string)$tree);
    }

    /**
     * Tests constructing tree using the mock plugin.
     */
    public function test_construct_with_mock_plugin() {
        $structure = tree::get_root_json(array(
                self::mock(array('a' => true, 'm' => ''))), tree::OP_OR);
        $tree = new tree($structure);
        $this->assertEquals('+|({mock:y,})', (string)$tree);
    }

    /**
     * The dataProvider for test_check_available.
     */
    public function check_available_provider() {
        return array(
            array(
                'name' => 'No conditions',
                'structure' => array(),
                'assertions' => array(
                    'available' => true,
                )
            ),

            array(
                'name' => 'One condition set to yes',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => true)),
                    ),
                ),
                'assertions' => array(
                    'available' => true,
                )
            ),
            array(
                'name' => 'One condition set to no',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => false, 'm' => 'no')),
                    ),
                ),
                'assertions' => array(
                    'equals'    => 'SA: no',
                )
            ),
            array(
                'name' => 'Two conditions, OR, resolving as true',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => false, 'm' => 'no')),
                        self::mock(array('a' => true)),
                    ),
                ),
                'assertions' => array(
                    'available' => true,
                    'equals'    => '',
                )
            ),
            array(
                'name' => 'Two conditions, OR, resolving as false',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => false, 'm' => 'no')),
                        self::mock(array('a' => false, 'm' => 'way')),
                    ),
                ),
                'assertions' => array(
                    'regexp'    => '~any of.*no.*way~',
                )
            ),
            array(
                'name' => 'Two conditions, OR, resolving as false, no display',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => false, 'm' => 'no')),
                        self::mock(array('a' => false, 'm' => 'way')),
                    ),
                    'show'  => false,
                ),
                'assertions' => array(
                    'equals'    => '',
                )
            ),
            array(
                'name' => 'Two conditions, AND, resolving as true',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => true)),
                        self::mock(array('a' => true)),
                    ),
                    'op'    => '&',
                    'showc' => array(
                        true,
                        true,
                    ),
                ),
                'assertions' => array(
                    'available' => true,
                )
            ),
            array(
                'name' => 'Two conditions, AND, one false',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => false, 'm' => 'wom')),
                        self::mock(array('a' => true, 'm' => '')),
                    ),
                    'op'    => '&',
                    'showc' => array(
                        true,
                        true,
                    ),
                ),
                'assertions' => array(
                    'equals'    => 'SA: wom',
                )
            ),
            array(
                'name' => 'Two conditions, AND, both false',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => false, 'm' => 'wom')),
                        self::mock(array('a' => false, 'm' => 'bat')),
                    ),
                    'op'    => '&',
                    'showc' => array(
                        true,
                        true,
                    ),
                ),
                'assertions' => array(
                    'regexp'    => '~wom.*bat~',
                )
            ),

            array(
                'name' => 'Two conditions, AND, both false, show turned off for one. When ' .
                          'show is turned off, that means if you don\'t have that condition ' .
                          'you don\'t get to see anything at all',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => false, 'm' => 'wom')),
                        self::mock(array('a' => false, 'm' => 'bat')),
                    ),
                    'op'    => '&',
                    'showc' => array(
                        false,
                        true,
                    ),
                ),
                'assertions' => array(
                    'equals'    => '',
                )
            ),
            array(
                'name' => 'Two conditions, NOT OR, both false',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => false, 'm' => 'wom')),
                        self::mock(array('a' => false, 'm' => 'bat')),
                    ),
                    'op'    => '!|',
                    'showc' => array(
                        true,
                        true,
                    ),
                ),
                'assertions' => array(
                    'available' => true,
                )
            ),
            array(
                'name' => 'Two conditions, NOT OR, one true',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => true, 'm' => 'wom')),
                        self::mock(array('a' => false, 'm' => 'bat')),
                    ),
                    'op'    => '!|',
                    'showc' => array(
                        true,
                        true,
                    ),
                ),
                'assertions' => array(
                    'equals'    => 'SA: !wom',
                )
            ),

            array(
                'name' => 'Two conditions, NOT OR, both true',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => true, 'm' => 'wom')),
                        self::mock(array('a' => true, 'm' => 'bat')),
                    ),
                    'op'    => '!|',
                    'showc' => array(
                        true,
                        true,
                    ),
                ),
                'assertions' => array(
                    'regexp'    => '~!wom.*!bat~',
                )
            ),
            array(
                'name' => 'Two conditions, NOT AND, both true',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => true, 'm' => 'wom')),
                        self::mock(array('a' => true, 'm' => 'bat')),
                    ),
                    'op'    => '!&',
                    'show'  => true,
                ),
                'assertions' => array(
                    'regexp' => '~any of.*!wom.*!bat~',
                )
            ),
            array(
                'name' => 'Two conditions, NOT AND, one true.',
                'structure' => array(
                    'c' => array(
                        self::mock(array('a' => true, 'm' => 'wom')),
                        self::mock(array('a' => false, 'm' => 'bat')),
                    ),
                    'op'    => '!&',
                    'show'  => true,
                ),
                'assertions' => array(
                    'available' => true,
                )
            ),
            array(
                'name' => 'Nested NOT conditions; true',
                'structure' => array(
                    'c' => array(
                        tree::get_nested_json(
                            array(
                                self::mock(array('a' => true, 'm' => 'no')),
                            ),
                            tree::OP_NOT_AND
                        ),
                    ),
                    'op'    => '!&',
                    'show'  => true,
                ),
                'assertions' => array(
                    'available' => true,
                )
            ),
            array(
                'name' => 'Nested NOT conditions; false (note no ! in message)',
                'structure' => array(
                    'c' => array(
                        tree::get_nested_json(
                            array(
                                self::mock(array('a' => false, 'm' => 'no')),
                            ),
                            tree::OP_NOT_AND
                        ),
                    ),
                    'op'    => '!&',
                    'show'  => true,
                ),
                'assertions' => array(
                    'equals' => 'SA: no',
                )
            ),
            array(
                'name' => 'Nested condition groups, message test',
                'structure' => array(
                    'c' => array(
                        tree::get_nested_json(
                            array(
                                self::mock(array('a' => false, 'm' => '1')),
                                self::mock(array('a' => false, 'm' => '2')),
                            ), tree::OP_AND
                        ),
                        self::mock(array('a' => false, 'm' => 3))
                    ),
                    'op'    => '|',
                    'show'  => true,
                ),
                'assertions' => array(
                    'regexp' => '~<ul.*<ul.*<li.*1.*<li.*2.*</ul>.*<li.*3~',
                )
            ),
        );
    }

    /**
     * Tests the check_available and get_result_information functions.
     * @dataProvider check_available_provider
     */
    public function test_check_available($name, $test, $expected) {
        global $USER;

        // Setup.
        $this->resetAfterTest();
        $info = new \core_availability\mock_info();
        $this->setAdminUser();
        $information = '';

        // The base test structure.
        $structure = tree::get_root_json(array(), tree::OP_OR);

        // Override the test structure details.
        if (isset($test['c'])) {
            $structure->c = $test['c'];
        }

        if (isset($test['show'])) {
            $structure->show = $test['show'];
        }

        if (isset($test['showc'])) {
            $structure->showc = $test['showc'];
        }

        if (isset($test['op'])) {
            $structure->op = $test['op'];
        }

        // Get the results for this test structure.
        list($available, $information) = $this->get_available_results($structure, $info, $USER->id);

        // Test the output.

        // All tests are either available or unavailable.
        if (!isset($expected['available'])) {
            // Default available to false.
            $expected['available'] = false;
        }
        $this->assertEquals($expected['available'], $available);

        if (isset($expected['equals'])) {
            $this->assertEquals($expected['equals'], $information);
        }

        if (isset($expected['regexp'])) {
            $this->assertRegExp($expected['regexp'], $information);
        }
    }

    /**
     * Shortcut function to check availability and also get information.
     *
     * @param stdClass $structure Tree structure
     * @param \core_availability\info $info Location info
     * @param int $userid User id
     */
    protected function get_available_results($structure, \core_availability\info $info, $userid) {
        $tree = new tree($structure);
        $result = $tree->check_available(false, $info, true, $userid);
        return array($result->is_available(), $tree->get_result_information($info, $result));
    }

    /**
     * Tests the is_available_for_all() function.
     */
    public function test_is_available_for_all() {
        // Empty tree is always available.
        $structure = tree::get_root_json(array(), tree::OP_OR);
        $tree = new tree($structure);
        $this->assertTrue($tree->is_available_for_all());

        // Tree with normal item in it, not always available.
        $structure->c[0] = (object)array('type' => 'mock');
        $tree = new tree($structure);
        $this->assertFalse($tree->is_available_for_all());

        // OR tree with one always-available item.
        $structure->c[1] = self::mock(array('all' => true));
        $tree = new tree($structure);
        $this->assertTrue($tree->is_available_for_all());

        // AND tree with one always-available and one not.
        $structure->op = '&';
        $structure->showc = array(true, true);
        unset($structure->show);
        $tree = new tree($structure);
        $this->assertFalse($tree->is_available_for_all());

        // Test NOT conditions (items not always-available).
        $structure->op = '!&';
        $structure->show = true;
        unset($structure->showc);
        $tree = new tree($structure);
        $this->assertFalse($tree->is_available_for_all());

        // Test again with one item always-available for NOT mode.
        $structure->c[1]->allnot = true;
        $tree = new tree($structure);
        $this->assertTrue($tree->is_available_for_all());
    }

    /**
     * Tests the get_full_information() function.
     */
    public function test_get_full_information() {
        // Setup.
        $info = new \core_availability\mock_info();

        // No conditions.
        $structure = tree::get_root_json(array(), tree::OP_OR);
        $tree = new tree($structure);
        $this->assertEquals('', $tree->get_full_information($info));

        // Condition (normal and NOT).
        $structure->c = array(
                self::mock(array('m' => 'thing')));
        $tree = new tree($structure);
        $this->assertEquals('SA: [FULL]thing',
                $tree->get_full_information($info));
        $structure->op = '!&';
        $tree = new tree($structure);
        $this->assertEquals('SA: ![FULL]thing',
                $tree->get_full_information($info));

        // Complex structure.
        $structure->op = '|';
        $structure->c = array(
                tree::get_nested_json(array(
                    self::mock(array('m' => '1')),
                    self::mock(array('m' => '2'))), tree::OP_AND),
                self::mock(array('m' => 3)));
        $tree = new tree($structure);
        $this->assertRegExp('~<ul.*<ul.*<li.*1.*<li.*2.*</ul>.*<li.*3~',
                $tree->get_full_information($info));

        // Test intro messages before list. First, OR message.
        $structure->c = array(
                self::mock(array('m' => '1')),
                self::mock(array('m' => '2'))
        );
        $tree = new tree($structure);
        $this->assertRegExp('~Not available unless any of:.*<ul>~',
                $tree->get_full_information($info));

        // Now, OR message when not shown.
        $structure->show = false;
        $tree = new tree($structure);
        $this->assertRegExp('~hidden.*<ul>~',
                $tree->get_full_information($info));

        // AND message.
        $structure->op = '&';
        unset($structure->show);
        $structure->showc = array(false, false);
        $tree = new tree($structure);
        $this->assertRegExp('~Not available unless:.*<ul>~',
                $tree->get_full_information($info));

        // Hidden markers on items.
        $this->assertRegExp('~1.*hidden.*2.*hidden~',
                $tree->get_full_information($info));

        // Hidden markers on child tree and items.
        $structure->c[1] = tree::get_nested_json(array(
                self::mock(array('m' => '2')),
                self::mock(array('m' => '3'))), tree::OP_AND);
        $tree = new tree($structure);
        $this->assertRegExp('~1.*hidden.*All of \(hidden.*2.*3~',
                $tree->get_full_information($info));
        $structure->c[1]->op = '|';
        $tree = new tree($structure);
        $this->assertRegExp('~1.*hidden.*Any of \(hidden.*2.*3~',
                $tree->get_full_information($info));

        // Hidden markers on single-item display, AND and OR.
        $structure->showc = array(false);
        $structure->c = array(
                self::mock(array('m' => '1'))
        );
        $tree = new tree($structure);
        $this->assertRegExp('~1.*hidden~',
                $tree->get_full_information($info));

        unset($structure->showc);
        $structure->show = false;
        $structure->op = '|';
        $tree = new tree($structure);
        $this->assertRegExp('~1.*hidden~',
                $tree->get_full_information($info));

        // Hidden marker if single item is tree.
        $structure->c[0] = tree::get_nested_json(array(
                self::mock(array('m' => '1')),
                self::mock(array('m' => '2'))), tree::OP_AND);
        $tree = new tree($structure);
        $this->assertRegExp('~Not available \(hidden.*1.*2~',
                $tree->get_full_information($info));

        // Single item tree containing single item.
        unset($structure->c[0]->c[1]);
        $tree = new tree($structure);
        $this->assertRegExp('~SA.*1.*hidden~',
                $tree->get_full_information($info));
    }

    /**
     * Tests the is_empty() function.
     */
    public function test_is_empty() {
        // Tree with nothing in should be empty.
        $structure = tree::get_root_json(array(), tree::OP_OR);
        $tree = new tree($structure);
        $this->assertTrue($tree->is_empty());

        // Tree with something in is not empty.
        $structure = tree::get_root_json(array(self::mock(array('m' => '1'))), tree::OP_OR);
        $tree = new tree($structure);
        $this->assertFalse($tree->is_empty());
    }

    /**
     * Tests the get_all_children() function.
     */
    public function test_get_all_children() {
        // Create a tree with nothing in.
        $structure = tree::get_root_json(array(), tree::OP_OR);
        $tree1 = new tree($structure);

        // Create second tree with complex structure.
        $structure->c = array(
                tree::get_nested_json(array(
                    self::mock(array('m' => '1')),
                    self::mock(array('m' => '2'))
                ), tree::OP_OR),
                self::mock(array('m' => 3)));
        $tree2 = new tree($structure);

        // Check list of conditions from both trees.
        $this->assertEquals(array(), $tree1->get_all_children('core_availability\condition'));
        $result = $tree2->get_all_children('core_availability\condition');
        $this->assertEquals(3, count($result));
        $this->assertEquals('{mock:n,1}', (string)$result[0]);
        $this->assertEquals('{mock:n,2}', (string)$result[1]);
        $this->assertEquals('{mock:n,3}', (string)$result[2]);

        // Check specific type, should give same results.
        $result2 = $tree2->get_all_children('availability_mock\condition');
        $this->assertEquals($result, $result2);
    }

    /**
     * Tests the update_dependency_id() function.
     */
    public function test_update_dependency_id() {
        // Create tree with structure of 3 mocks.
        $structure = tree::get_root_json(array(
                tree::get_nested_json(array(
                    self::mock(array('table' => 'frogs', 'id' => 9)),
                    self::mock(array('table' => 'zombies', 'id' => 9))
                )),
                self::mock(array('table' => 'frogs', 'id' => 9))));

        // Get 'before' value.
        $tree = new tree($structure);
        $before = $tree->save();

        // Try replacing a table or id that isn't used.
        $this->assertFalse($tree->update_dependency_id('toads', 9, 13));
        $this->assertFalse($tree->update_dependency_id('frogs', 7, 8));
        $this->assertEquals($before, $tree->save());

        // Replace the zombies one.
        $this->assertTrue($tree->update_dependency_id('zombies', 9, 666));
        $after = $tree->save();
        $this->assertEquals(666, $after->c[0]->c[1]->id);

        // And the frogs one.
        $this->assertTrue($tree->update_dependency_id('frogs', 9, 3));
        $after = $tree->save();
        $this->assertEquals(3, $after->c[0]->c[0]->id);
        $this->assertEquals(3, $after->c[1]->id);
    }

    /**
     * Tests the filter_users function.
     */
    public function test_filter_users() {
        $info = new \core_availability\mock_info();
        $checker = new capability_checker($info->get_context());

        // Don't need to create real users in database, just use these ids.
        $users = array(1 => null, 2 => null, 3 => null);

        // Test basic tree with one condition that doesn't filter.
        $structure = tree::get_root_json(array(self::mock(array())));
        $tree = new tree($structure);
        $result = $tree->filter_user_list($users, false, $info, $checker);
        ksort($result);
        $this->assertEquals(array(1, 2, 3), array_keys($result));

        // Now a tree with one condition that filters.
        $structure = tree::get_root_json(array(self::mock(array('filter' => array(2, 3)))));
        $tree = new tree($structure);
        $result = $tree->filter_user_list($users, false, $info, $checker);
        ksort($result);
        $this->assertEquals(array(2, 3), array_keys($result));

        // Tree with two conditions that both filter (|).
        $structure = tree::get_root_json(array(
                self::mock(array('filter' => array(3))),
                self::mock(array('filter' => array(1)))), tree::OP_OR);
        $tree = new tree($structure);
        $result = $tree->filter_user_list($users, false, $info, $checker);
        ksort($result);
        $this->assertEquals(array(1, 3), array_keys($result));

        // Tree with two condition that both filter (&).
        $structure = tree::get_root_json(array(
                self::mock(array('filter' => array(2, 3))),
                self::mock(array('filter' => array(1, 2)))));
        $tree = new tree($structure);
        $result = $tree->filter_user_list($users, false, $info, $checker);
        ksort($result);
        $this->assertEquals(array(2), array_keys($result));

        // Tree with child tree with NOT condition.
        $structure = tree::get_root_json(array(
                tree::get_nested_json(array(
                    self::mock(array('filter' => array(1)))), tree::OP_NOT_AND)));
        $tree = new tree($structure);
        $result = $tree->filter_user_list($users, false, $info, $checker);
        ksort($result);
        $this->assertEquals(array(2, 3), array_keys($result));
    }

    /**
     * Tests the get_json methods in tree (which are mainly for use in testing
     * but might be used elsewhere).
     */
    public function test_get_json() {
        // Create a simple child object (fake).
        $child = (object)array('type' => 'fake');
        $childstr = json_encode($child);

        // Minimal case.
        $this->assertEquals(
                (object)array('op' => '&', 'c' => array()),
                tree::get_nested_json(array()));
        // Children and different operator.
        $this->assertEquals(
                (object)array('op' => '|', 'c' => array($child, $child)),
                tree::get_nested_json(array($child, $child), tree::OP_OR));

        // Root empty.
        $this->assertEquals('{"op":"&","c":[],"showc":[]}',
                json_encode(tree::get_root_json(array(), tree::OP_AND)));
        // Root with children (multi-show operator).
        $this->assertEquals('{"op":"&","c":[' . $childstr . ',' . $childstr .
                    '],"showc":[true,true]}',
                json_encode(tree::get_root_json(array($child, $child), tree::OP_AND)));
        // Root with children (single-show operator).
        $this->assertEquals('{"op":"|","c":[' . $childstr . ',' . $childstr .
                    '],"show":true}',
                json_encode(tree::get_root_json(array($child, $child), tree::OP_OR)));
        // Root with children (specified show boolean).
        $this->assertEquals('{"op":"&","c":[' . $childstr . ',' . $childstr .
                    '],"showc":[false,false]}',
                json_encode(tree::get_root_json(array($child, $child), tree::OP_AND, false)));
        // Root with children (specified show array).
        $this->assertEquals('{"op":"&","c":[' . $childstr . ',' . $childstr .
                    '],"showc":[true,false]}',
                json_encode(tree::get_root_json(array($child, $child), tree::OP_AND, array(true, false))));
    }

    /**
     * Tests get_user_list_sql.
     */
    public function test_get_user_list_sql() {
        global $DB;
        $this->resetAfterTest();
        $generator = $this->getDataGenerator();

        // Create a test course with 2 groups and users in each combination of them.
        $course = $generator->create_course();
        $group1 = $generator->create_group(array('courseid' => $course->id));
        $group2 = $generator->create_group(array('courseid' => $course->id));
        $userin1 = $generator->create_user();
        $userin2 = $generator->create_user();
        $userinboth = $generator->create_user();
        $userinneither = $generator->create_user();
        $studentroleid = $DB->get_field('role', 'id', array('shortname' => 'student'));
        foreach (array($userin1, $userin2, $userinboth, $userinneither) as $user) {
            $generator->enrol_user($user->id, $course->id, $studentroleid);
        }
        groups_add_member($group1, $userin1);
        groups_add_member($group2, $userin2);
        groups_add_member($group1, $userinboth);
        groups_add_member($group2, $userinboth);
        $info = new \core_availability\mock_info($course);

        // Tree with single group condition.
        $tree = new tree(tree::get_root_json(array(
            \availability_group\condition::get_json($group1->id)
            )));
        list($sql, $params) = $tree->get_user_list_sql(false, $info, false);
        $result = $DB->get_fieldset_sql($sql, $params);
        sort($result);
        $this->assertEquals(array($userin1->id, $userinboth->id), $result);

        // Tree with 'AND' of both group conditions.
        $tree = new tree(tree::get_root_json(array(
            \availability_group\condition::get_json($group1->id),
            \availability_group\condition::get_json($group2->id)
        )));
        list($sql, $params) = $tree->get_user_list_sql(false, $info, false);
        $result = $DB->get_fieldset_sql($sql, $params);
        sort($result);
        $this->assertEquals(array($userinboth->id), $result);

        // Tree with 'AND' of both group conditions.
        $tree = new tree(tree::get_root_json(array(
            \availability_group\condition::get_json($group1->id),
            \availability_group\condition::get_json($group2->id)
        ), tree::OP_OR));
        list($sql, $params) = $tree->get_user_list_sql(false, $info, false);
        $result = $DB->get_fieldset_sql($sql, $params);
        sort($result);
        $this->assertEquals(array($userin1->id, $userin2->id, $userinboth->id), $result);

        // Check with flipped logic (NOT above level of tree).
        list($sql, $params) = $tree->get_user_list_sql(true, $info, false);
        $result = $DB->get_fieldset_sql($sql, $params);
        sort($result);
        $this->assertEquals(array($userinneither->id), $result);
    }

    /**
     * Utility function to build the PHP structure representing a mock condition.
     *
     * @param array $params Mock parameters
     * @return \stdClass Structure object
     */
    protected static function mock(array $params) {
        $params['type'] = 'mock';
        return (object)$params;
    }
}

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
 * Memcached unit tests.
 *
 * If you wish to use these unit tests all you need to do is add the following definition to
 * your config.php file.
 *
 * define('TEST_CACHESTORE_MEMCACHED_TESTSERVERS', '127.0.0.1:11211');
 *
 * @package    cachestore_memcached
 * @copyright  2013 Sam Hemelryk
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

// Include the necessary evils.
global $CFG;
require_once($CFG->dirroot.'/cache/tests/fixtures/stores.php');
require_once($CFG->dirroot.'/cache/stores/memcached/lib.php');

/**
 * Memcached unit test class.
 *
 * @package    cachestore_memcached
 * @copyright  2013 Sam Hemelryk
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class cachestore_memcached_test extends advanced_testcase{
    /**
     * Data Provider for is_connection_ready.
     *
     * @return array
     */
    public function is_connection_ready_provider() {
        return [
            'No ping; Not shared; Not ready' => [
                false,
                false,
                false,
                false,
            ],
            'No ping; Shared; Not ready' => [
                false,
                false,
                false,
                false,
            ],
            'Ping; Not shared; getAllKeys empty array; Ready' => [
                true,
                false,
                [],
                true,
            ],
            'Ping; Not shared; getAllKeys broken; Ready' => [
                true,
                false,
                false,
                true,
            ],
            'Ping; Shared; getAllKeys empty array; Ready' => [
                true,
                true,
                [],
                true,
            ],
            'Ping; Shared; getAllKeys filled array; Ready' => [
                true,
                true,
                ['example', 'foo', 'bar', 'baz'],
                true,
            ],
            'Ping; Shared; getAllKeys broken; Not ready' => [
                true,
                true,
                false,
                false,
            ],
        ];
    }

    /**
     * Test the is_connection_ready function.
     *
     * @dataProvider is_connection_ready_provider
     * @param   bool    $ping       Whether the ping returns success
     * @param   bool    $shared     Whether the connection is shared
     * @param   mixed   $getallkeys The value returned by getAllKeys
     * @param   bool    $expected   The expected value of is_connection_ready
     */
    public function test_is_connection_ready($ping, $shared, $getallkeys, $expected) {
        $connection = $this->getMockBuilder(Memcached::class)
            ->disableOriginalConstructor()
            ->setMethods(['set', 'getAllKeys'])
            ->getMock();

        $connection->method('set')->will($this->returnValue($ping));
        $connection->method('getAllKeys')->will($this->returnValue($getallkeys));

        $uit = $this->getMockBuilder(cachestore_memcached::class)
            ->disableOriginalConstructor()
            ->setMethods(null)
            ->getMock();

        $rc = new ReflectionClass(cachestore_memcached::class);
        $rcp = $rc->getProperty('connection');
        $rcp->setAccessible(true);
        $rcp->setValue($uit, $connection);

        $rcp = $rc->getProperty('isshared');
        $rcp->setAccessible(true);
        $rcp->setValue($uit, $shared);

        if ($expected) {
            $this->assertTrue($uit->is_connection_ready());
        } else {
            $this->assertFalse($uit->is_connection_ready());
        }
    }
}

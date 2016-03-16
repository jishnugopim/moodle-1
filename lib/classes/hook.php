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
 * Hook dispatcher.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core;

defined('MOODLE_INTERNAL') || die();

/**
 * Hook dispatcher.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class hook {

    /**
     * @var array   cache of all hook callables.
     */
    protected static $hooks = null;

    /**
     * Call all callables for the named hook.
     * This function is shorthand for (\core\hook::create($name, $arguments))->fire();
     *
     * @param   string      $name       The name of the hook to call.
     * @param   stdClass    $arguments  The set of arguments to pass to the hook.
     * @return  void
     */
    public static function fire($name, \stdClass $arguments = null) {
        if ($facade = self::create($name, $arguments)) {
            $facade->fire();
        }
    }

    /**
     * Create a hook for the named hook and data.
     *
     * @param   string      $name       The name of the hook to call.
     * @param   stdClass    $arguments  The set of arguments to pass to the hook.
     * @return  hook\hook               The created hook.
     */
    public static function create($name, \stdClass $arguments = null) {
        if (!during_initial_install()) {
            self::initialise_hook_implementors();
        }

        $callables = [];
        if (self::$hooks && isset(self::$hooks[$name])) {
            $callables = self::$hooks[$name];
        }
        return new hook\hook($name, $callables, $arguments);
    }

    /**
     * Initialise the list of hook implementations.
     */
    protected static function initialise_hook_implementors() {
        global $CFG;

        if (is_array(self::$hooks)) {
            return;
        }

        if (!PHPUNIT_TEST and !during_initial_install()) {
            $cache = \cache::make('core', 'hookcallables');
            self::$hooks = $cache->get('callables');
            if (is_array(self::$hooks)) {
                return;
            }
        }

        self::$hooks = array();

        // Add any core callables.
        // Note - these are highly irregular but we technically do support them.
        self::add_callables($CFG->libdir);

        // Add plugin callables.
        $plugintypes = \core_component::get_plugin_types();
        foreach ($plugintypes as $plugintype => $ignored) {
            $plugins = \core_component::get_plugin_list($plugintype);

            foreach ($plugins as $fulldir) {
                self::add_callables($fulldir);
            }
        }

        // Order all of the callables according to priority.
        self::order_all_callables();

        if (!PHPUNIT_TEST and !during_initial_install()) {
            $cache->set('callables', self::$hooks);
        }
    }

    /**
     * Add callables.
     *
     * @param string $fulldir
     */
    protected static function add_callables($fulldir) {
        $file = $fulldir . '/db/hooks.php';
        if (!is_readable($file)) {
            return;
        }

        $callables = [];
        include($file);

        static::add_callables_from_array($file, $callables);
    }

    /**
     * Add a set of callables from the specified array.
     *
     * @param   string  $creator    The name of the item creating this callable.
     * @param   array   $callables  The list of callable definitions.
     */
    protected static function add_callables_from_array($creator, array $callables = []) {
        foreach ($callables as $callable) {
            if (empty($callable['hookname']) or !is_string($callable['hookname'])) {
                debugging("Invalid 'hookname' detected in {$creator} callable definition", DEBUG_DEVELOPER);
                continue;
            }

            if (empty($callable['callable'])) {
                debugging("Invalid 'callable' detected in {$creator} callable definition", DEBUG_DEVELOPER);
                continue;
            }

            $hook = new \stdClass();
            $hook->callable = $callable['callable'];
            $hook->priority = 0;

            if (isset($callable['priority'])) {
                $hook->priority = (int) $callable['priority'];
            }

            self::$hooks[$callable['hookname']][] = $hook;
        }
    }

    /**
     * Reorder callables to allow quick lookup of callable for each hook.
     */
    protected static function order_all_callables() {
        foreach (self::$hooks as $hookname => $callables) {
            \core_collator::asort_objects_by_property($callables, 'priority', \core_collator::SORT_NUMERIC);
            self::$hooks[$hookname] = array_reverse($callables);
        }
    }

}

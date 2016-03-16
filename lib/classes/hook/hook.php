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
 * Hook Runner.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\hook;

defined('MOODLE_INTERNAL') || die();

/**
 * Hook Runner.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class hook {

    /**
     * @var string      The name of this hook.
     */
    protected $hookname;

    /**
     * @var array       $callables  The list of callables to call.
     */
    protected $callables = [];

    /**
     * @var facade      $facade     The hook\facade instance.
     */
    protected $facade;

    /**
     * @var array       $deprecated Deprecation details for this hook.
     */
    protected $deprecated = null;

    /**
     * Return a new hook facade with the supplied data.
     *
     * @param   string      $name       The name of the hook to call.
     * @param   array       $callables  The list of callables to call.
     * @param   stdClass    $data       The data to make available to hook callables.
     */
    public function __construct($name, array $callables, \stdClass $data = null) {
        $this->callables = $callables;
        $this->hookname = $name;

        if (empty($this->callables)) {
            // Return early - there are no callables, so nothing needs to be set up.
            return;
        }

        $this->facade = new facade($name, $data);
    }

    /**
     * Trigger the hook callables.
     */
    public function fire() {
        foreach ($this->callables as $callable) {
            if ($this->deprecated) {
                debugging(
                        "The hook '{$this->hookname}' was deprecated " .
                        "in {$this->deprecated['since']} " .
                        "and will be removed in {$this->deprecated['removal']}.  " .
                        "Please do not use this hook any more.",
                        DEBUG_DEVELOPER);
            }

            if (!$this->facade->is_stopped()) {
                call_user_func($callable->callable, $this->facade);
            }
        }
    }

    /**
     * Mark a key as deprecated.
     *
     * @param   string      $key        The key to deprecate
     * @param   string      $since      When this was deprecated
     * @param   string      $removal    When this will be removed
     * @return  $this
     */
    public function deprecate_key($key, $since, $removal) {
        if (empty($this->callables)) {
            // This hook will not be invoked because there are no callables.
            return $this;
        }

        $this->facade->deprecate_key($key, $since, $removal);

        return $this;
    }

    /**
     * Mark the hook as deprecated.
     *
     * @param   string      $since      When this hook was deprecated
     * @param   string      $removal    When this hook will be removed
     * @return  $this
     */
    public function deprecate($since, $removal) {
        if (empty($this->callables)) {
            // This hook will not be invoked because there are no callables.
            return $this;
        }

        $this->deprecated = [
                'since'     => $since,
                'removal'   => $removal,
            ];

        return $this;
    }
}

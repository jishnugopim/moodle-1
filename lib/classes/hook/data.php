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
 * Hook Facade Data.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\hook;

defined('MOODLE_INTERNAL') || die();

/**
 * Hook Facade Data.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class data {

    /**
     * @var string      The name of the hook that this hook data belongs to.
     */
    protected $hookname;

    /**
     * @var     stdClass    $data       The data to store.
     */
    protected $data = null;

    /**
     * @var     array       $deprecated The list of deprecated keys.
     */
    protected $deprecated = [];

    /**
     * Create a new hook\data object.
     *
     * @param   string      $name       The name of the hook to call.
     * @param   stdClass    $data       The data to store.
     */
    public function __construct($name, \stdClass $data) {
        $this->hookname = $name;
        $this->data = $data;
    }

    /**
     * Magic getter to fetch a piece of the data, adding appropriate deprecation notices.
     *
     * @param   string      $key    The key to fetch
     * @return  mixed
     */
    public function __get($key) {
        $this->check_deprecation($key);
        return $this->data->$key;
    }

    /**
     * Magic setter to set a piece of the data, adding appropriate deprecation notices.
     *
     * @param   string      $key    The key to set
     * @param   mixed       $value  The value to set
     * @return  mixed
     */
    public function __set($key, $value) {
        $this->check_deprecation($key);
        return $this->data->$key = $value;
    }

    /**
     * Check for deprecation and display any relevant deprecation notices.
     *
     * @param   string      $key    The key to check
     * @return  $this
     */
    protected function check_deprecation($key) {
        if (isset($this->deprecated[$key])) {
            debugging(
                    "The key '{$key}' of hook '{$this->hookname}' was deprecated " .
                    "in {$this->deprecated[$key]['since']} " .
                    "and will be removed in {$this->deprecated[$key]['removal']}.  " .
                    "Please do not use this key any more.",
                    DEBUG_DEVELOPER);
        }

        return $this;
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
        $this->deprecated[$key] = [
                'since'     => $since,
                'removal'   => $removal,
            ];

        return $this;
    }
}

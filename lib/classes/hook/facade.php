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
 * Hook Facade.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\hook;

defined('MOODLE_INTERNAL') || die();

/**
 * Hook Facade.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class facade {

    /**
     * @var string      The name of the hook that this hook facade belongs to.
     */
    protected $hookname;

    /**
     * @var stdClass    $data       The data belonging to this facade.
     */
    public $data;

    /**
     * @var boolean     $stoppped   Whether a callable has called halt() on the facade.
     */
    protected $stopped = false;

    /**
     * Return a new hook facade with the supplied data.
     *
     * @param   string      $name       The name of the hook to call.
     * @param   stdClass    $data   The data to make available to hook callables.
     */
    public function __construct($name, \stdClass $data = null) {
        $this->hookname = $name;
        $this->set_data($data);
    }

    /**
     * Set the data for the facade.
     *
     * @param   stdClass    $data   The data to make available to hook callables.
     * @return  $this
     */
    protected function set_data(\stdClass $data = null) {
        if ($data === null) {
            $data = new \stdClass();
        }

        $this->data = $data;

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
        if (!is_a($this->data, '\\core\\hook\\data')) {
            $this->data = new data($this->hookname, $this->data);
        }
        $this->data->deprecate_key($key, $since, $removal);
    }

    /**
     * Prevent execution of subsequent callables.
     *
     * @return  $this
     */
    public function halt() {
        $this->stopped = true;

        return $this;
    }

    /**
     * Check whether subsequent callables will be called.
     *
     * @return  boolean
     */
    public function is_stopped() {
        return $this->stopped == true;
    }
}

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
 * Fixtures for VERP tests.
 *
 * @package    core
 * @category   phpunit
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\test;
defined('MOODLE_INTERNAL') || die();

class handler_base extends \core\verp\handler {
    public function get_description() {}
    public function process_message(\stdClass $data, $headers, $body, $attachments) {}
}

class handler_one extends handler_base {}
class handler_two extends handler_base {}
class handler_three extends handler_base {}
class handler_four extends handler_base {}

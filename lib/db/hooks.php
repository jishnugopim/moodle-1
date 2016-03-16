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
 * Definition of core hooks callables.
 *
 * The callables defined in this file are notified when their respective hooks is executed.
 *
 * For more information see the Hooks API documentation {@link http://docs.moodle.org/dev/Hook}
 *
 * Example of hook callable:
 *
 * $callbacks = array(
 *      array(
 *          'hookname' => 'pre_something_happens',
 *          'callable' => 'local_example\hooks::some_method_name',
 *
 *          // Optional, callbacks with higher priority will be executed earlier.
 *          // Negative priorities are also acceptable.
 *          'priority' => 0,
 *      ),
 * );
 *
 * @package   core
 * @copyright 2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

// Callbacks implemented by Moodle core.
$callables = [
    [
        'hookname' => 'pre_page_header_print',
        'callable' => '\core\test::pre_page_header_print',
    ],
    [
        'hookname' => 'pre_page_header_print',
        'callable' => '\core\test::another_page_header_print',
        'priority' => -1
    ],
];

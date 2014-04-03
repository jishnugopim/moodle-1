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
 * Retrieve a user preference in response to an ajax call.
 *
 * You should not send requests to this script directly.
 * Instead use the get_user_preference JavaScript function.
 *
 * @package    core
 * @category   preference
 * @copyright  2014 Vignesh Panneer <me@vignesh.info>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require_once(dirname(dirname(__DIR__)) . '/config.php');

require_sesskey();

// Get the name of the preference to update.
$name = required_param('pref', PARAM_RAW);

if (!isset($USER->ajax_fetchable_user_prefs[$name])) {
    // To be able to retrieve a preference, it must have been marked as fetchable.
    print_error('notallowedtofetchprefremotely');
}

$result = new stdClass();
$result->name = $name;
$result->value = get_user_preferences($name);
echo json_encode($result);

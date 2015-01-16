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
 * Displays calendar via AJAX call
 *
 * @copyright 2015 Andrew Nicols
 * @package   core
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);
require_once(__DIR__ . '/config.php');

$calm = optional_param('cal_m', 0, PARAM_INT);
$caly = optional_param('cal_y', 0, PARAM_INT);
$time = optional_param('time', 0, PARAM_INT);

require_once($CFG->dirroot.'/calendar/lib.php');

if ($this->content !== null) {
    return $this->content;
}

// If a day, month and year were passed then convert it to a timestamp. If these were passed then we can assume
// the day, month and year are passed as Gregorian, as no where in core should we be passing these values rather
// than the time. This is done for BC.
if (!empty($calm) && (!empty($caly))) {
    $time = make_timestamp($caly, $calm, 1);
} else if (empty($time)) {
    $time = time();
}

// [pj] To me it looks like this if would never be needed, but Penny added it
// when committing the /my/ stuff. Reminder to discuss and learn what it's about.
// It definitely needs SOME comment here!
$courseid = $this->page->course->id;
$issite = ($courseid == SITEID);

if ($issite) {
    // Being displayed at site level. This will cause the filter to fall back to auto-detecting
    // the list of courses it will be grabbing events from.
    $filtercourse = calendar_get_default_courses();
} else {
    // Forcibly filter events to include only those from the particular course we are in.
    $filtercourse = array($courseid => $this->page->course);
}

list($courses, $group, $user) = calendar_set_filters($filtercourse);
if ($issite) {
    // For the front page.
    $data = calendar_get_mini_content($courses, $group, $user, false, false, 'frontpage', $courseid, $time);
    // No filters for now.
} else {
    // For any other course.
    $data = calendar_get_mini_content($courses, $group, $user, false, false, 'course', $courseid, $time);
}

echo json_encode($data);

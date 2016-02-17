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
 * @package   mod_forum
 * @copyright 1999 onwards Martin Dougiamas  {@link http://moodle.com}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../../config.php');

$contextid = required_param('id', PARAM_INT);
$context = context::instance_by_id($contextid, MUST_EXIST);

$PAGE->set_disguise_configuration_page();
$PAGE->set_url('/user/disguise/basic/configure.php', array('id' => $contextid));
$PAGE->set_context($context);
if ($context instanceof \context_module) {
    list ($course, $cm) = get_course_and_cm_from_cmid($context->instanceid);
    $PAGE->set_cm($cm);
}

$isconfigured = optional_param('c', 0, PARAM_INT);
if ($isconfigured) {
    $context->disguise->handle_user_now_configured();
}

echo $OUTPUT->header();
echo "Awesome - let's configure this thing :)";
echo $OUTPUT->footer();

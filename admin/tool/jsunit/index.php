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
 * JSUnit info
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require(dirname(__FILE__) . '/../../../config.php');
require_once($CFG->libdir.'/adminlib.php');

admin_externalpage_setup('tooljsunit');

echo $OUTPUT->header();
echo $OUTPUT->heading(get_string('pluginname', 'tool_jsunit'));
echo $OUTPUT->box_start();

$info = file_get_contents(__DIR__ . "/readme.md");
echo markdown_to_html($info);

echo $OUTPUT->box_end();
echo $OUTPUT->footer();

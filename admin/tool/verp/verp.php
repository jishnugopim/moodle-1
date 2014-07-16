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
 * VERP Settings pages.
 *
 * @package    tool_verp
 * @copyright  2014 Andrew NIcols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once(dirname(__FILE__) . '/../../../config.php');
require_once($CFG->libdir.'/adminlib.php');
require_once($CFG->libdir.'/tablelib.php');

admin_externalpage_setup('verp_handlers');

$PAGE->set_url('/admin/tool/verp/verp.php');
$PAGE->set_context(context_system::instance());
$PAGE->set_pagelayout('admin');
$strheading = get_string('verp', 'tool_verp');
$PAGE->set_title($strheading);
$PAGE->set_heading($strheading);

require_login();

require_capability('moodle/site:config', context_system::instance());

$renderer = $PAGE->get_renderer('tool_verp');

echo $OUTPUT->header();

$records = $DB->get_records('verp_handlers', null, 'enabled desc');
$instances = array();
foreach ($records as $record) {
    $instances[] = \core\verp\manager::handler_from_record($record);
}
echo $renderer->verp_handlers_table($instances);
echo $OUTPUT->footer();

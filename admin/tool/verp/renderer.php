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
 * Output rendering for the plugin.
 *
 * @package     tool_verp
 * @copyright   2014 Andrew Nicols
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Implements the plugin renderer
 *
 * @copyright 2014 Andrew Nicols
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tool_verp_renderer extends plugin_renderer_base {

    /**
     * Render a table listing all of the VERP handlers.
     *
     * @param array $handlers - list of all verp handlers.
     * @return string HTML to output.
     */
    public function verp_handlers_table(array $handlers) {
        global $CFG;

        $table = new html_table();
        $component = new html_table_cell(get_string('component', 'tool_verp') . "\n" .
                html_writer::tag('span', get_string('classname', 'tool_verp'), array('class' => 'handler-function')));

        $table->head  = array($component,
                              get_string('description', 'tool_verp'),
                              get_string('requirevalidation', 'tool_verp'),
                              get_string('enabled', 'tool_verp'),
                        );
        $table->attributes['class'] = 'admintable generaltable';

        $yes = get_string('yes');
        $no = get_string('no');

        $data = array();
        foreach ($handlers as $handler) {
            $component = new html_table_cell($handler->component . "\n" .
                    html_writer::tag('span', $handler->classname, array('class' => 'handler-function')));
            $component->header = true;
            $row = new html_table_row(array(
                        $component,
                        $handler->description,
                        $handler->validate_address ? $yes : $no,
                        $handler->enabled ? $yes : $no,
                    ));

            if (!$handler->enabled) {
                $row->attributes['class'] = 'disabled';
            }
            $data[] = $row;
        }
        $table->data = $data;
        return html_writer::table($table);
    }

}

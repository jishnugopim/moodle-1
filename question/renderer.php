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
 * Renderers for outputting parts of the question bank.
 *
 * @package    moodlecore
 * @subpackage questionbank
 * @copyright  2011 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


defined('MOODLE_INTERNAL') || die();


/**
 * This renderer outputs parts of the question bank.
 *
 * @copyright  2011 The Open University
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class core_question_bank_renderer extends plugin_renderer_base {

    /**
     * Output the icon for a question type
     * @param string $qtype the question type.
     * @return string HTML fragment.
     */
    public function qtype_icon($qtype) {
        if (!is_a($qtype, 'question_type')) {
            $qtype = question_bank::get_qtype($qtype, false);
        }
        $namestr = $qtype->local_name();

        return $this->pix_icon('icon', $namestr, $qtype->plugin_name(), array('title' => $namestr));
    }

    /**
     * Build the HTML for the module chooser javascript popup
     *
     * @param array $modules A set of modules as returned form @see
     * get_module_metadata
     * @param object $course The course that will be displayed
     * @return string The composed HTML for the module
     */
    public function qbank_chooser($real, $fake, $course, $hiddenparams) {
        global $OUTPUT;

        // Add the header
        $header = html_writer::tag('div', get_string('chooseqtypetoadd', 'question'),
                array('class' => 'choosertitle hd'));

        $formcontent = html_writer::start_tag('form', array('action' => new moodle_url('/question/question.php'),
                'id' => 'chooserform', 'method' => 'get'));
        $formcontent .= html_writer::start_tag('div', array('id' => 'typeformdiv'));
        $formcontent .= html_writer::tag('input', '', array('type' => 'hidden', 'name' => 'category', 'id' => 'qbankcategory'));
        $formcontent .= html_writer::tag('input', '', array('type' => 'hidden', 'name' => 'courseid', 'value' => $course->id));
        foreach ($hiddenparams as $k => $v) {
            $formcontent .= html_writer::tag('input', '',
                    array('type' => 'hidden', 'name' => $k, 'value' => $v));
        }
        $formcontent .= html_writer::tag('input', '', array('type' => 'hidden', 'name' => 'sesskey',
                'value' => sesskey()));
        $formcontent .= html_writer::end_tag('div');

        // Put everything into one tag 'options'
        $formcontent .= html_writer::start_tag('div', array('class' => 'options'));
        $formcontent .= html_writer::tag('div', get_string('selectaqtypefordescription', 'question'),
                array('class' => 'instruction'));
        // Put all options into one tag 'qoptions' to allow us to handle scrolling
        $formcontent .= html_writer::start_tag('div', array('class' => 'alloptions'));

        // First display real
        $formcontent .= $this->qbank_chooser_title('questions', 'question');
        $formcontent .= $this->qbank_chooser_types($real);

        $formcontent .= html_writer::tag('div', '', array('class' => 'separator'));

        // Then fake
        $formcontent .= $this->qbank_chooser_title('other');
        $formcontent .= $this->qbank_chooser_types($fake);

        $formcontent .= html_writer::end_tag('div'); // options
        $formcontent .= html_writer::end_tag('div'); // types

        $formcontent .= html_writer::start_tag('div', array('class' => 'submitbuttons'));
        $formcontent .= html_writer::tag('input', '',
                array('type' => 'submit', 'name' => 'submitbutton', 'class' => 'submitbutton', 'value' => get_string('add')));
        $formcontent .= html_writer::tag('input', '',
                array('type' => 'submit', 'name' => 'addcancel', 'class' => 'addcancel', 'value' => get_string('cancel')));
        $formcontent .= html_writer::end_tag('div');
        $formcontent .= html_writer::end_tag('form');

        // Wrap the whole form in a div
        $formcontent = html_writer::tag('div', $formcontent, array('id' => 'chooseform'));

        // Put all of the content together
        $content = $formcontent;

        $content = html_writer::tag('div', $content, array('class' => 'choosercontainer'));
        return $header . html_writer::tag('div', $content, array('class' => 'chooserdialogue'));
    }

    /**
     * Build the HTML for a specified set of modules
     *
     * @param array $modules A set of modules as used by the
     * qbank_chooser_module function
     * @return string The composed HTML for the module
     */
    protected function qbank_chooser_types($types) {
        $return = '';
        foreach ($types as $type) {
            $return .= $this->qbank_chooser_qtype($type);
        }
        return $return;
    }

    /**
     * Return the HTML for the specified module adding any required classes
     *
     * @param object $module An object containing the title, and link. An
     * icon, and help text may optionally be specified. If the module
     * contains subtypes in the types option, then these will also be
     * displayed.
     * @param array $classes Additional classes to add to the encompassing
     * div element
     * @return string The composed HTML for the module
     */
    protected function qbank_chooser_qtype($qtype, $classes = array()) {
        $output = '';
        $classes[] = 'option';
        $output .= html_writer::start_tag('div', array('class' => implode(' ', $classes)));
        $output .= html_writer::start_tag('label', array('for' => 'qtype_' . $qtype->plugin_name()));
        $output .= html_writer::tag('input', '', array('type' => 'radio',
                'name' => 'qtype', 'id' => 'qtype_' . $qtype->plugin_name(), 'value' => $qtype->name()));

        $output .= html_writer::start_tag('span', array('class' => 'modicon'));
        // Add an icon if we have one
        $output .= $this->pix_icon('icon', $qtype->local_name(), $qtype->plugin_name(), array('title' => $qtype->local_name(), 'class' => 'icon'));
        $output .= html_writer::end_tag('span');

        $output .= html_writer::tag('span', $qtype->menu_name(), array('class' => 'typename'));

        // Format the help text using markdown with the following options
        $options = new stdClass();
        $options->trusted = false;
        $options->noclean = false;
        $options->smiley = false;
        $options->filter = false;
        $options->para = true;
        $options->newlines = false;
        $options->overflowdiv = false;
        $qtype->help = format_text(get_string('pluginnamesummary', $qtype->plugin_name()), FORMAT_MARKDOWN, $options);
        $output .= html_writer::tag('span', $qtype->help, array('class' => 'typesummary'));
        $output .= html_writer::end_tag('label');
        $output .= html_writer::end_tag('div');

        return $output;
    }

    protected function qbank_chooser_title($title, $identifier = null) {
        $output = '';
        $classes = array(
            'option',
            'moduletypetitle',
        );
        $output .= html_writer::start_tag('div', array('class' => implode(' ', $classes)));
        $output .= html_writer::tag('span', '', array('class' => 'modicon'));
        $output .= html_writer::tag('span', get_string($title, $identifier), array('class' => 'typename'));
        $output .= html_writer::end_tag('div');

        return $output;
    }
}

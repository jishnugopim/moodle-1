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
 * Password type form element with unmask option
 *
 * Contains HTML class for a password type element with unmask option
 *
 * @package   core_form
 * @copyright 2009 Petr Skoda
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

if (!defined('MOODLE_INTERNAL')) {
    die('Direct access to this script is forbidden.');    ///  It must be included from a Moodle page
}

global $CFG;
require_once($CFG->libdir.'/form/password.php');
require_once('templatable_form_element.php');

/**
 * Password type form element with unmask option
 *
 * HTML class for a password type element with unmask option
 *
 * @package   core_form
 * @category  form
 * @copyright 2009 Petr Skoda {@link http://skodak.org}
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class MoodleQuickForm_passwordunmask extends MoodleQuickForm_password {

    use templatable_form_element;

    /**
     * constructor
     *
     * @param string $elementName (optional) name of the password element
     * @param string $elementLabel (optional) label for password element
     * @param mixed $attributes (optional) Either a typical HTML attribute string
     *              or an associative array
     */
    public function __construct($elementName=null, $elementLabel=null, $attributes=null) {
        // no standard mform in moodle should allow autocomplete of passwords
        if (empty($attributes)) {
            $attributes = array('autocomplete'=>'off');
        } else if (is_array($attributes)) {
            $attributes['autocomplete'] = 'off';
        } else {
            if (strpos($attributes, 'autocomplete') === false) {
                $attributes .= ' autocomplete="off" ';
            }
        }
        $this->_persistantFreeze = true;

        parent::__construct($elementName, $elementLabel, $attributes);
    }

    /**
     * Old syntax of class constructor for backward compatibility.
     */
    public function MoodleQuickForm_passwordunmask($elementName=null, $elementLabel=null, $attributes=null) {
        self::__construct($elementName, $elementLabel, $attributes);
    }

    /**
     * Returns HTML for this form element.
     *
     * @return string
     */
    function toHtml() {
        global $OUTPUT;

        $context = $this->export_for_template($OUTPUT);
        $context['valuechars'] = array_fill(0, strlen($context['value']), 'x');

        return $OUTPUT->render_from_template('core_form/element-passwordunmask', [
                'element' => $context,
            ]);
    }
}

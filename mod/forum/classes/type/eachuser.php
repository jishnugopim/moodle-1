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
 * Each User must post forum type.
 *
 * @package    mod_forum
 * @copyright  2014 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_forum\type;

defined('MOODLE_INTERNAL') || die();

use stdClass;

/**
 * Each User must post forum type.
 *
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class eachuser extends \mod_forum\manager {

    /**
     * @inheritDoc
     */
    public function can_create_discussion($group = null) {
        global $USER;

        if (!parent::can_create_discussion($group)) {
            return false;
        }

        $cm = $this->get_course_module();
        if (forum_user_has_posted_discussion($this->forum->id, $USER->id, groups_get_activity_group($cm))) {
            return false;
        }

        return true;
    }

    /**
     * @inheritDoc
     */
    protected function create_discussion_capability() {
        return 'mod/forum:startdiscussion';
    }
}

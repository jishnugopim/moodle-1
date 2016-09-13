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
 * Forum manager.
 *
 * @package    mod_forum
 * @copyright  2014 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_forum;

defined('MOODLE_INTERNAL') || die();

use stdClass;

/**
 * Forum manager.
 *
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
abstract class manager {

    /**
     * @var forum               Forum for this manager
     */
    protected $forum;

    /**
     * @var context_module      Context for the module
     */
    protected $modcontext;

    /**
     * @var context_course      Context for the course
     */
    protected $coursecontext;

    /**
     * @var stdClass            The course module record
     */
    protected $cm;

    /**
     * @var stdClass            The course record
     */
    protected $course;

    final protected function __construct(forum $forum) {
        $this->forum = $forum;
    }

    /**
     * Return the manager instance for the specified forum.
     *
     * @param   forum       $forum          The forum to create a manager for
     * @return  manager
     */
    public static function instance(forum $forum) {
        $type = $forum->get_type();
        $typeclass = "\\mod_forum\\type\\{$type}";
        if (!class_exists($typeclass)) {
            throw new \coding_exception('Could not find type ' . $forum->type);
        }

        return new $typeclass($forum);
    }

    /**
     * Whether the current user can reply to the specified discussion.
     *
     * @param   discussion  $discussion     The discussion being tested
     * @param   post        $post           The post being tested
     * @return  bool
     */
    public function can_reply_to_post(discussion $discussion, post $post) {
        if (!$this->can_reply_to_discussion($discussion)) {
            return false;
        }

        return true;
    }

    /**
     * Whether the current user can reply to the specified discussion.
     *
     * @param   discussion  $discussion     The discussion being tested
     * @return  bool
     */
    public function can_reply_to_discussion(discussion $discussion) {
        if (isguestuser() or !isloggedin()) {
            return false;
        }

        // Normal users with temporary guest access can not post, suspended users can not post either.
        $context = $this->get_context_module();
        if (!is_viewing($context) and !is_enrolled($context, null, '', true)) {
            return false;
        }

        if (!has_capability($this->reply_to_discussion_capability(), $context)) {
            return false;
        }

        $cm = $this->get_course_module();
        if (!$groupmode = groups_get_activity_groupmode($cm, $this->get_course())) {
            return true;
        }

        if (has_capability('moodle/site:accessallgroups', $context)) {
            return true;
        }

        if ($groupmode == VISIBLEGROUPS) {
            if ($discussion->get_groupid() == -1) {
                // allow students to reply to all participants discussions - this was not possible in Moodle <1.8
                return true;
            }
            return groups_is_member($discussion->groupid);

        } else {
            // Separate groups.
            if ($discussion->get_groupid() == -1) {
                return false;
            }
            return groups_is_member($discussion->get_groupid());
        }

        if ($this->is_locked($discussion)) {
            if (!has_capability('mod/forum:ignoreforumlock', $this->get_context_module())) {
                return false;
            }
        }

        return true;
    }

    /**
     * Return the capability required to reply to a discussion.
     *
     * @return  string
     */
    protected function reply_to_discussion_capability() {
        return 'mod/forum:replypost';
    }

    /**
     * Whether the current user can create a discussion in the forum.
     *
     * @param   mixed       $group          The group being posted in
     *                                      If no group is specified, use the current group
     * @return  bool
     */
    public function can_create_discussion($group = null) {
        if (isguestuser() or !isloggedin()) {
            return false;
        }

        if (!has_capability($this->create_discussion_capability(), $this->get_context_module())) {
            return false;
        }

        $cm = $this->get_course_module();
        $groupmode = groups_get_activity_groupmode($cm);
        if (!$groupmode or has_capability('moodle/site:accessallgroups', $this->get_context_module())) {
            return true;
        }

        if ($group === null) {
            $group = groups_get_activity_group($cm);
        }

        if ($group) {
            return groups_is_member($group);
        } else {
            return false;
        }
    }

    /**
     * Return the capability required to create a discussion.
     *
     * @return  string
     */
    protected function create_discussion_capability() {
        return 'mod/forum:startdiscussion';
    }

    /**
     * Whether the specified discussion is locked.
     *
     * @param   discussion  $discussion     The discussion being tested
     * @return  bool
     */
    public function is_locked(discussion $discussion) {
        if ($this->forum->get_lockdiscussionafter()) {
            return !static::within_bounds($discussion->get_timemodified(), $this->forum->get_lockdiscussionafter());
        }

        return false;
    }

    /**
     * Fetch the context for the module.
     *
     * @return  context_module
     */
    public function get_context_module() {
        if (empty($this->modcontext)) {
            $this->modcontext = \context_module::instance($this->get_course_module()->id);
        }

        return $this->modcontext;
    }

    /**
     * Fetch the context for the course that the forum is in.
     *
     * @return  context_course
     */
    public function get_context_course() {
        if (empty($this->coursecontext)) {
            $modcontext = $this->get_context_module();
            $this->coursecontext = $modcontext->get_course_context();
        }

        return $this->coursecontext;
    }

    /**
     * Fetch the course module information.
     *
     * @return  stdClass
     */
    public function get_course_module() {
        if ($this->cm === null) {
            $this->cm = get_fast_modinfo($this->forum->get_course())->instances['forum'][$this->forum->get_id()];
        }

        return $this->cm;
    }

    /**
     * Fetch the course record.
     *
     * @return  stdClass
     */
    public function get_course() {
        if ($this->course === null) {
            $this->course = get_course($this->forum->get_course());
        }

        return $this->course;
    }

    /**
     * Determine whether the specified timestamp is within the boundary.
     *
     * @param   int         $timestamp      The timestamp to check
     * @param   int         $bound          The boundary period
     * @return  bool
     */
    protected static function within_bounds($timestamp, $bound) {
        if ($timestamp === null) {
            // The timestamp is assumed to be out of bounds if it not set.
            return true;
        }

        if (($timestamp + $bound) < time()) {
            return true;
        }

        return false;
    }
}

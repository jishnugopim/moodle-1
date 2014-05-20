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
 * Module management.
 *
 * @package    mod_forum
 * @copyright  2013 Andrew Robert Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Module management for mod_forum.
 */
class mod_forum_module {

    /**
     * Given an object containing all the necessary data,
     * (defined by the form in mod_form.php) this function
     * will create a new instance and return the id number
     * of the new instance.
     *
     * @param stdClass $forum add forum instance
     * @param mod_forum_mod_form $mform
     * @return int intance id
     */
    public static function add_instance($forum, $mform = null) {
        global $CFG, $DB;

        $forum->timemodified = time();

        if (empty($forum->assessed)) {
            $forum->assessed = 0;
        }

        if (empty($forum->ratingtime) or empty($forum->assessed)) {
            $forum->assesstimestart  = 0;
            $forum->assesstimefinish = 0;
        }

        $forum->id = $DB->insert_record('forum', $forum);
        $modcontext = context_module::instance($forum->coursemodule);

        if ($forum->type == 'single') {  // Create related discussion.
            $discussion = new stdClass();
            $discussion->course        = $forum->course;
            $discussion->forum         = $forum->id;
            $discussion->name          = $forum->name;
            $discussion->assessed      = $forum->assessed;
            $discussion->message       = $forum->intro;
            $discussion->messageformat = $forum->introformat;
            $discussion->messagetrust  = trusttext_trusted(context_course::instance($forum->course));
            $discussion->mailnow       = false;
            $discussion->groupid       = -1;

            $message = '';

            $discussion->id = forum_add_discussion($discussion, null, $message);

            if ($mform and $draftid = file_get_submitted_draft_itemid('introeditor')) {
                // Ugly hack - we need to copy the files somehow.
                $discussion = $DB->get_record('forum_discussions', array('id'=>$discussion->id), '*', MUST_EXIST);
                $post = $DB->get_record('forum_posts', array('id'=>$discussion->firstpost), '*', MUST_EXIST);

                $options = array('subdirs'=>true); // Use the same options as intro field!
                $post->message = file_save_draft_area_files($draftid, $modcontext->id, 'mod_forum', 'post', $post->id, $options, $post->message);
                $DB->set_field('forum_posts', 'message', $post->message, array('id'=>$post->id));
            }
        }

        forum_grade_item_update($forum);

        return $forum->id;
    }
    /**
     * Given an object containing all the necessary data,
     * (defined by the form in mod_form.php) this function
     * will update an existing instance with new data.
     *
     * @global object
     * @param object $forum forum instance (with magic quotes)
     * @return bool success
     */
    public static function update_instance($forum, $mform) {
        global $DB, $OUTPUT, $USER;

        $forum->timemodified = time();
        $forum->id           = $forum->instance;

        if (empty($forum->assessed)) {
            $forum->assessed = 0;
        }

        if (empty($forum->ratingtime) or empty($forum->assessed)) {
            $forum->assesstimestart  = 0;
            $forum->assesstimefinish = 0;
        }

        $oldforum = $DB->get_record('forum', array('id'=>$forum->id));

        // MDL-3942 - if the aggregation type or scale (i.e. max grade) changes then recalculate the grades for the entire forum
        // if  scale changes - do we need to recheck the ratings, if ratings higher than scale how do we want to respond?
        // for count and sum aggregation types the grade we check to make sure they do not exceed the scale (i.e. max score) when calculating the grade
        if (($oldforum->assessed<>$forum->assessed) or ($oldforum->scale<>$forum->scale)) {
            forum_update_grades($forum); // recalculate grades for the forum
        }

        if ($forum->type == 'single') {  // Update related discussion and post.
            $discussions = $DB->get_records('forum_discussions', array('forum'=>$forum->id), 'timemodified ASC');
            if (!empty($discussions)) {
                if (count($discussions) > 1) {
                    echo $OUTPUT->notification(get_string('warnformorepost', 'forum'));
                }
                $discussion = array_pop($discussions);
            } else {
                // try to recover by creating initial discussion - MDL-16262
                $discussion = new stdClass();
                $discussion->course          = $forum->course;
                $discussion->forum           = $forum->id;
                $discussion->name            = $forum->name;
                $discussion->assessed        = $forum->assessed;
                $discussion->message         = $forum->intro;
                $discussion->messageformat   = $forum->introformat;
                $discussion->messagetrust    = true;
                $discussion->mailnow         = false;
                $discussion->groupid         = -1;

                $message = '';

                forum_add_discussion($discussion, null, $message);

                if (! $discussion = $DB->get_record('forum_discussions', array('forum'=>$forum->id))) {
                    print_error('cannotadd', 'forum');
                }
            }
            if (! $post = $DB->get_record('forum_posts', array('id'=>$discussion->firstpost))) {
                print_error('cannotfindfirstpost', 'forum');
            }

            $cm         = get_coursemodule_from_instance('forum', $forum->id);
            $modcontext = context_module::instance($cm->id, MUST_EXIST);

            $post = $DB->get_record('forum_posts', array('id'=>$discussion->firstpost), '*', MUST_EXIST);
            $post->subject       = $forum->name;
            $post->message       = $forum->intro;
            $post->messageformat = $forum->introformat;
            $post->messagetrust  = trusttext_trusted($modcontext);
            $post->modified      = $forum->timemodified;
            $post->userid        = $USER->id;    // MDL-18599, so that current teacher can take ownership of activities.

            if ($mform and $draftid = file_get_submitted_draft_itemid('introeditor')) {
                // Ugly hack - we need to copy the files somehow.
                $options = array('subdirs'=>true); // Use the same options as intro field!
                $post->message = file_save_draft_area_files($draftid, $modcontext->id, 'mod_forum', 'post', $post->id, $options, $post->message);
            }

            $DB->update_record('forum_posts', $post);
            $discussion->name = $forum->name;
            $DB->update_record('forum_discussions', $discussion);
        }

        $DB->update_record('forum', $forum);

        $modcontext = context_module::instance($forum->coursemodule);
        if (($forum->forcesubscribe == FORUM_INITIALSUBSCRIBE) && ($oldforum->forcesubscribe <> $forum->forcesubscribe)) {
            $users = forum_get_potential_subscribers($modcontext, 0, 'u.id, u.email', '');
            foreach ($users as $user) {
                forum_subscribe($user->id, $forum->id);
            }
        }

        forum_grade_item_update($forum);

        return true;
    }

    /**
     * Given an ID of an instance of this module,
     * this function will permanently delete the instance
     * and any data that depends on it.
     *
     * @global object
     * @param int $id forum instance id
     * @return bool success
     */
    public static function delete_instance($id) {
        global $DB;

        if (!$forum = $DB->get_record('forum', array('id'=>$id))) {
            return false;
        }
        if (!$cm = get_coursemodule_from_instance('forum', $forum->id)) {
            return false;
        }
        if (!$course = $DB->get_record('course', array('id'=>$cm->course))) {
            return false;
        }

        $context = context_module::instance($cm->id);

        // now get rid of all files
        $fs = get_file_storage();
        $fs->delete_area_files($context->id);

        $result = true;

        if ($discussions = $DB->get_records('forum_discussions', array('forum'=>$forum->id))) {
            foreach ($discussions as $discussion) {
                if (!forum_delete_discussion($discussion, true, $course, $cm, $forum)) {
                    $result = false;
                }
            }
        }

        if (!$DB->delete_records('forum_digests', array('forum' => $forum->id))) {
            $result = false;
        }

        if (!$DB->delete_records('forum_subscriptions', array('forum'=>$forum->id))) {
            $result = false;
        }

        forum_tp_delete_read_records(-1, -1, -1, $forum->id);

        if (!$DB->delete_records('forum', array('id'=>$forum->id))) {
            $result = false;
        }

        forum_grade_item_delete($forum);

        return $result;
    }
}

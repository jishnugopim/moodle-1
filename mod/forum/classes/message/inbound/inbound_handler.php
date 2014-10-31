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
 * A Handler to process replies to forum posts.
 *
 * @package    mod_forum
 * @subpackage core_message
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_forum\message\inbound;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/forum/lib.php');
require_once($CFG->dirroot . '/repository/lib.php');

/**
 * A Handler to process generic replies to forum posts.
 *
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
abstract class inbound_handler extends \core\message\inbound\handler {

    /**
     * Process a message received and validated by the Inbound Message processor.
     *
     * @throws \core\message\inbound\processing_failed_exception
     * @param \stdClass $messagedata The Inbound Message record
     * @param \stdClass $messagedata The message data packet
     * @return bool Whether the message was successfully processed.
     */
    public function process_message(\stdClass $record, \stdClass $messagedata, $for) {
        global $DB, $USER;

        $forum = $for->forum;

        // Load the other required data.
        $course = $DB->get_record('course', array('id' => $forum->course));
        $cm = get_fast_modinfo($course->id)->instances['forum'][$forum->id];
        $modcontext = \context_module::instance($cm->id);
        $usercontext = \context_user::instance($USER->id);

        // Make sure user can post in this discussion.
        $canpost = true;
        if ($for->discussion) {
            if (!forum_user_can_post($forum, $discussion, $USER, $cm, $course, $modcontext)) {
                $canpost = false;
            }
            $groupid = $discussion->groupid;
        } else if ($for->group) {
            $groupid = $for->groupid;
            if (!forum_user_can_post_discussion($forum, $groupid, null, $cm, $modcontext)) {
                $canpost = false;
            }
        } else {
            $canpost = false;
        }

        if (isset($cm->groupmode) && empty($course->groupmodeforce)) {
            $groupmode = $cm->groupmode;
        } else {
            $groupmode = $course->groupmode;
        }

        if ($groupmode == SEPARATEGROUPS and !has_capability('moodle/site:accessallgroups', $modcontext)) {
            if ($groupid == -1) {
                $canpost = false;
            } else {
                if (!groups_is_member($groupid)) {
                    $canpost = false;
                }
            }
        }

        if (!$canpost) {
            $data = new \stdClass();
            $data->forum = $forum;
            throw new \core\message\inbound\processing_failed_exception('messageinboundnopostforum', 'mod_forum', $data);
        }

        // And check the availability.
        if (!\core_availability\info_module::is_user_visible($cm, $USER, true)) {
            $data = new \stdClass();
            $data->forum = $forum;
            throw new \core\message\inbound\processing_failed_exception('messageinboundforumhidden', 'mod_forum', $data);
        }

        // Before we add this we must check that the user will not exceed the blocking threshold.
        // This should result in an appropriate reply.
        $thresholdwarning = forum_check_throttling($forum, $cm);
        if (!empty($thresholdwarning) && !$thresholdwarning->canpost) {
            $data = new \stdClass();
            $data->forum = $forum;
            $data->message = get_string($thresholdwarning->errorcode, $thresholdwarning->module, $thresholdwarning->additional);
            throw new \core\message\inbound\processing_failed_exception('messageinboundthresholdhit', 'mod_forum', $data);
        }

        // Create the new discussion

        $addpost = new \stdClass();
        $addpost->course       = $course->id;
        $addpost->forum        = $forum->id;
        $addpost->discussion   = $discussion->id;
        $addpost->modified     = $messagedata->timestamp;
        $addpost->subject      = clean_param($messagedata->envelope->subject, PARAM_TEXT);
        $addpost->parent       = $postid;
        $addpost->itemid       = file_get_unused_draft_itemid();

        if (!empty($messagedata->html)) {
            $addpost->message = $messagedata->html;
            $addpost->messageformat = FORMAT_HTML;
        } else {
            $addpost->message = $messagedata->plain;
            $addpost->messageformat = FORMAT_PLAIN;
        }

        // We don't trust text coming from e-mail.
        $addpost->messagetrust = false;

        // Add attachments to the post.
        if (!empty($messagedata->attachments['attachment']) && count($messagedata->attachments['attachment'])) {
            $attachmentcount = count($messagedata->attachments['attachment']);
            if (empty($forum->maxattachments) || $forum->maxbytes == 1 ||
                    !has_capability('mod/forum:createattachment', $modcontext)) {
                // Attachments are not allowed.
                mtrace("--> User does not have permission to attach files in this forum. Rejecting e-mail.");

                $data = new \stdClass();
                $data->forum = $forum;
                $data->attachmentcount = $attachmentcount;
                throw new \core\message\inbound\processing_failed_exception('messageinboundattachmentdisallowed', 'mod_forum', $data);
            }

            if ($forum->maxattachments < $attachmentcount) {
                // Too many attachments.
                mtrace("--> User attached {$attachmentcount} files when only {$forum->maxattachments} where allowed. "
                     . " Rejecting e-mail.");

                $data = new \stdClass();
                $data->forum = $forum;
                $data->attachmentcount = $attachmentcount;
                throw new \core\message\inbound\processing_failed_exception('messageinboundfilecountexceeded', 'mod_forum', $data);
            }

            $filesize = 0;
            $addpost->attachments  = file_get_unused_draft_itemid();
            foreach ($messagedata->attachments['attachment'] as $attachment) {
                mtrace("--> Processing {$attachment->filename} as an attachment.");
                $this->process_attachment('*', $usercontext, $addpost->attachments, $attachment);
                $filesize += $attachment->filesize;
            }

            if ($forum->maxbytes < $filesize) {
                // Too many attachments.
                mtrace("--> User attached {$filesize} bytes of files when only {$forum->maxbytes} where allowed. "
                     . "Rejecting e-mail.");
                $data = new \stdClass();
                $data->forum = $forum;
                $data->maxbytes = display_size($forum->maxbytes);
                $data->filesize = display_size($filesize);
                throw new \core\message\inbound\processing_failed_exception('messageinboundfilesizeexceeded', 'mod_forum', $data);
            }
        }

        // Process any files in the message itself.
        if (!empty($messagedata->attachments['inline'])) {
            foreach ($messagedata->attachments['inline'] as $attachment) {
                mtrace("--> Processing {$attachment->filename} as an inline attachment.");
                $this->process_attachment('*', $usercontext, $addpost->itemid, $attachment);

                // Convert the contentid link in the message.
                $draftfile = \moodle_url::make_draftfile_url($addpost->itemid, '/', $attachment->filename);
                $addpost->message = preg_replace('/cid:' . $attachment->contentid . '/', $draftfile, $addpost->message);
            }
        }

        // Insert the message content now.
        $addpost->id = forum_add_new_post($addpost, true);

        return $addpost;
    }

    /**
     * Process attachments included in a message.
     *
     * @param string[] $acceptedtypes String The mimetypes of the acceptable attachment types.
     * @param \context_user $context context_user The context of the user creating this attachment.
     * @param int $itemid int The itemid to store this attachment under.
     * @param \stdClass $attachment stdClass The Attachment data to store.
     * @return \stored_file
     */
    protected function process_attachment($acceptedtypes, \context_user $context, $itemid, \stdClass $attachment) {
        global $USER, $CFG;

        // Create the file record.
        $record = new \stdClass();
        $record->filearea   = 'draft';
        $record->component  = 'user';

        $record->itemid     = $itemid;
        $record->license    = $CFG->sitedefaultlicense;
        $record->author     = fullname($USER);
        $record->contextid  = $context->id;
        $record->userid     = $USER->id;

        // All files sent by e-mail should have a flat structure.
        $record->filepath   = '/';

        $record->filename = $attachment->filename;

        mtrace("--> Attaching {$record->filename} to " .
               "/{$record->contextid}/{$record->component}/{$record->filearea}/" .
               "{$record->itemid}{$record->filepath}{$record->filename}");

        $fs = get_file_storage();
        return $fs->create_file_from_string($record, $attachment->content);
    }

}

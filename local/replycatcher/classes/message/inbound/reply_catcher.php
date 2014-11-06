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
 * @package    local_replycatcher
 * @subpackage core_message
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace local_replycatcher\message\inbound;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/mod/forum/lib.php');
require_once($CFG->dirroot . '/repository/lib.php');

/**
 * A Handler to process replies to forum posts.
 *
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class reply_catcher extends \core\message\inbound\handler {

    /**
     * Return a description for the current handler.
     *
     * @return string
     */
    public function get_description() {
        return get_string('reply_catcher', 'local_replycatcher');
    }

    /**
     * Return a short name for the current handler.
     * This appears in the admin pages as a human-readable name.
     *
     * @return string
     */
    public function get_name() {
        return get_string('reply_catcher_name', 'local_replycatcher');
    }

    /**
     * Process a message received and validated by the Inbound Message processor.
     *
     * @throws \core\message\inbound\processing_failed_exception
     * @param \stdClass $messagedata The Inbound Message record
     * @param \stdClass $messagedata The message data packet
     * @return bool Whether the message was successfully processed.
     */
    public function process_message(\stdClass $record, \stdClass $messagedata) {
        global $DB, $USER;

        // Load the reply being replied to.
        $reply = $DB->get_record('replycatcher_data', array('id' => $record->datavalue));
        if (!$reply) {
            mtrace("--> Unable to find a reply source matching id {$record->datavalue}");
            return false;
        }

        // Each reply address can only be used once.
        if ($reply->used) {
            mtrace("--> Reply already used");
            return false;
        }

        $usercontext = \context_user::instance($USER->id);

        // Store the plaintext and the htmltext as files.
        $itemid  = file_get_unused_draft_itemid();

        $this->process_attachment('*', $usercontext, $itemid, 'message.txt', $messagedata->plain);
        $this->process_attachment('*', $usercontext, $itemid, 'message.html', $messagedata->html);

        $DB->set_field('replycatcher_data', 'used', 1, array('id' => $reply->id));

        return true;
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
    protected function process_attachment($acceptedtypes, \context_user $context, $itemid, $filename, $content) {
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

        $record->filename = $filename;

        mtrace("--> Attaching {$record->filename} to " .
               "/{$record->contextid}/{$record->component}/{$record->filearea}/" .
               "{$record->itemid}{$record->filepath}{$record->filename}");

        $fs = get_file_storage();
        return $fs->create_file_from_string($record, $content);
    }


    /**
     * Return the content of any success notification to be sent.
     * Both an HTML and Plain Text variant must be provided.
     *
     * @param \stdClass $messagedata The message data.
     * @param \stdClass $handlerresult The record for the newly created post.
     * @return \stdClass with keys `html` and `plain`.
     */
    public function get_success_message(\stdClass $messagedata, $handlerresult) {
        $a = new \stdClass();
        $a->subject = $handlerresult->subject;
        $discussionurl = new \moodle_url('/mod/forum/discuss.php', array('d' => $handlerresult->discussion));
        $a->discussionurl = $discussionurl->out();

        $message = new \stdClass();
        $message->plain = get_string('postbymailsuccess', 'local_replycatcher', $a);
        $message->html = get_string('postbymailsuccess_html', 'local_replycatcher', $a);
        return $message;
    }

}

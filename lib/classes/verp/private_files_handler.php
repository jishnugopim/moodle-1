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
 * A Handler to store attachments sent in e-mails as private files.
 *
 * @package    core
 * @category   verp
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\verp;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->dirroot . '/repository/lib.php');

/**
 * A Handler to store attachments sent in e-mails as private files.
 *
 * @package    core
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class private_files_handler extends \core\verp\handler {

    /**
     * Return a description for the current handler.
     *
     * @return string
     */
    public function get_description() {
        return get_string('private_files_handler', 'moodle');
    }

    public function process_message(\stdClass $data, $headers, $bodyplain, $bodyhtml, $attachmenttypes) {
        global $DB, $CFG;

        echo "Received a message from {$data->user->id}\n";

        $user = $data->user;
        $context = \context_user::instance($user->id);
        $component = 'user';
        $filearea = 'private';
        $itemid = 0;

        $repoid = $DB->get_field('repository', 'id', array('type' => 'upload'));
        if (!$repoid) {
            return false;
        }

        // The private files repository accepts all file types and uses the 'upload' repository'.
        $repo = \repository::get_repository_by_id($repoid, $context->id, array(
            'mimetypes' => '*',
        ));

        // Check permissions
        $repo->check_capability();

        $license = $CFG->sitedefaultlicense;
        $author = '';

        $fs = get_file_storage();

        foreach ($attachmenttypes as $attachmenttype => $attachments) {
            foreach ($attachments as $attachment) {
                echo "Processing a record for {$attachment->filename}\n";
                // Save the file to disk temporarily.
                $record = new \stdClass();
                $record->filearea = $filearea;
                $record->component = $component;
                $record->filepath = '/';
                $record->itemid   = $itemid;
                $record->license  = $license;
                $record->author   = $author;
                $record->contextid = $context->id;
                $record->userid    = $user->id;

                //repository::antivir_scan_file($_FILES[$elname]['tmp_name'], $attachment->filename, true);
                $sourcefield = $repo->get_file_source_info($attachment->filename);
                $record->source = \repository::build_source_field($sourcefield);
                $record->filename = $attachment->filename;

                echo "Creating a  record for /{$record->contextid}/{$record->component}/{$record->filearea}/{$record->itemid}/{$record->filepath}/{$record->filename}\n";

                $fs->create_file_from_string($record, $attachment->content);
            }
        }
    }
}

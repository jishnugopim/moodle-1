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
 * A scheduled task to handle VERP e-mail pickup.
 *
 * @package    tool_verp
 * @copyright  2014 Andrew Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace tool_verp\task;

defined('MOODLE_INTERNAL') || die();

class pickup_task extends \core\task\scheduled_task {

    /**
     * Get a descriptive name for this task (shown to admins).
     *
     * @return string
     */
    public function get_name() {
        return get_string('taskpickup', 'tool_verp');
    }

    /**
     * Execute the VERP pickup task.
     */
    public function execute() {
        global $CFG;

        if (!isset($CFG->verp_host) || !isset($CFG->verp_hostuser) || !isset($CFG->verp_hostpass)) {
            // E-mail processing not set up.
            return;
        }

        $client = new \Horde_Imap_Client_Socket(array(
            'username' => $CFG->verp_hostuser,
            'password' => $CFG->verp_hostpass,
            'hostspec' => $CFG->verp_host,

            'secure'   => 'ssl',
        ));

        $search = new \Horde_Imap_Client_Search_Query();
        $search->flag('\Seen', false);
        $search->flag('\Flagged', false);
        $results = $client->search('INBOX', $search);

        $query = new \Horde_Imap_Client_Fetch_Query();
        $query->envelope();
        $query->structure();
        $messages = $client->fetch('INBOX', $query, array('ids' => $results['match']));
        $handler = new \core\verp\address();
        foreach ($messages as $message) {
            $recipients = $message->getEnvelope()->to->bare_addresses;
            foreach ($recipients as $recipient) {
                if (!preg_match('/' . $CFG->verp_mailbox . '\+[^@]*@' . $CFG->verp_domain . '/', $recipient)) {
                    // Message did not contain a subaddress.
                    continue;
                }

                // We use the Client IDs several times - store them here.
                $messageid = new \Horde_Imap_Client_Ids($message->getUid());

                // First flag this message to prevent another running hitting this message while we look at the headers.
                $client->store('INBOX', array(
                    'ids' => $messageid,
                    'add' => '\Flagged',
                ));

                // Message contained a match.
                $senders = $message->getEnvelope()->sender->bare_addresses;
                if (count($senders) === 1) {
                    $sender = array_shift($senders);
                } else {
                    // TODO check whether there's ever an occasion in which this can happen.
                    echo "Some bizarre number of senders...\n";
                    continue;
                }

                mtrace("Received a message for {$recipient} from {$sender}");

                // Check one last time that this message isn't already read.
                $query = new \Horde_Imap_Client_Fetch_Query();
                $query->flags();
                $query->structure();
                $messagedata = $client->fetch('INBOX', $query, array(
                    'ids' => $messageid,
                ))->first();
                $flags = $messagedata->getFlags();

                if (in_array('\seen', $flags)) {
                    // Something else has already seen this message. Skip it now.
                    mtrace("Skipping the message - it's now been seen\n");
                    continue;
                }


                // Mark it as read to lock the message.
                $client->store('INBOX', array(
                    'ids' => $messageid,
                    'add' => '\Seen',
                ));

                // Now pass it through the VERP processor.
                $status = $handler->process_envelope($recipient, $sender);
                if ($status !== \core\verp\address::VALIDATION_SUCCESS) {
                    echo "Skipped message - it did not meet validation. Failed with {$status}\n";
                } else {
                    // And process the message.
                    echo "Processing the message\n";
                    $this->process_message($handler, $client, $message, $messagedata, $messageid);
                }

                // TODO - remove this.
                // Handle tidy-up.
                $client->store('INBOX', array(
                    'ids' => new \Horde_Imap_Client_Ids($message->getUid()),
                    'remove' => array(
                        '\Seen',
                        '\Flagged',
                    ),
                ));
            }
        }

        return;
    }

    private function process_message($handler, $client, $message, $messagedata, $messageid) {
        // We need the structure at various points below.
        $structure = $messagedata->getStructure();

        // Now fetch the rest of the message content.
        $query = new \Horde_Imap_Client_Fetch_Query();
        $query->fullText();

        // Fetch all of the message parts too.
        $typemap = $structure->contentTypeMap();
        foreach ($typemap as $part => $type) {
            // The body of the part - attempt to decode it on the server.
            $query->bodyPart($part, array(
                'decode' => true,
                'peek' => true,
            ));
            $query->bodyPartSize($part);

            // The header.
            $query->headerText(array(
                'id' => $part,
            ));
        }

        $messagedata = $client->fetch('INBOX', $query, array('ids' => $messageid))->first();

        // Store the data for this message.
        $headers = '';
        $content_plain = '';
        $content_html = '';
        $attachments = array(
            'inline' => array(),
            'attachment' => array(),
        );

        $plainpartid = $structure->findBody('plain');
        $htmlpartid = $structure->findBody('html');

        foreach ($typemap as $part => $type) {
            // Get the message data from the body part, and combine it with the structure to give a fully-formed output.
            $stream = $messagedata->getBodyPart($part, true);
            $partdata = $structure->getPart($part);
            $partdata->setContents($stream, array(
                'usestream' => true,
            ));


            if ($part === $plainpartid || $part === $htmlpartid || $part === '1.1') {
                // This is a content section for the main body.
                
                // Get the string version of it.
                $content = $messagedata->getBodyPart($part);
                if (!$messagedata->getBodyPartDecode($part)) {
                    // Decode the content.
                    $partdata->setContents($content);
                    $content = $partdata->getContents();
                }

                if ($part === $plainpartid) {
                    $content_plain = $content;
                } else if ($part === $htmlpartid) {
                    $content_html = $content;
                } else {
                }
            } else if ($filename = $partdata->getName($part)) {
                // If a filename is present, assume that this part is an attachment.
                $attachment = new \stdClass();
                $attachment->filename       = $filename;
                $attachment->type           = $partdata->getType();
                $attachment->content        = $partdata->getContents();
                $attachment->charset        = $partdata->getCharset();
                $attachment->description    = $partdata->getDescription();
                $attachment->contentid      = $partdata->getContentId();
                $attachment->filesize       = $messagedata->getBodyPartSize($part);

                // The disposition should be one of 'attachment', 'inline'. If an empty string is provided, default to 'attachment'.
                $disposition = $partdata->getDisposition();
                $disposition = $disposition == 'inline' ? 'inline' : 'attachment';
                $attachments[$disposition][] = $attachment;
            }

            $headers .= $messagedata->getHeaderText($part);

            // We don't handle any of the other MIME content at this stage.
        }

        /*
        echo "\n";
        echo "----------------------------------------------------------------------------\n";
        echo "== Headers\n";
        echo $headers;
        echo "Got a body text as follows:\n";
        echo "== Part {$plainpartid} ===================================================================\n";
        echo "\n";
        echo $content_plain;
        echo "\n";
        echo "== Part {$htmlpartid} ===================================================================\n";
        echo "\n";
        echo $content_html;
        echo "\n";
        echo "== Inline Attachments ======================================================\n";
        foreach ($attachments['inline'] as $index => $attachment) {
            echo "==== {$index}\n";
            echo "Filename: '{$attachment->filename}'\n";
            echo "Type: '{$attachment->type}'\n";
        }
        echo "== Attachments =============================================================\n";
        foreach ($attachments['attachment'] as $index => $attachment) {
            echo "==== {$index}\n";
            echo "Filename: '{$attachment->filename}'\n";
            echo "Type: '{$attachment->type}'\n";
        }
        echo "============================================================================\n";

         */

        mtrace("-> Passing to VERP handler {$handler->get_handler()->classname}\n");
        if ($handler->handle_message($headers, $content_plain, $content_html, $attachments)) {
            // Mark this message as deleted.
            return true;
        }

        // Something went wrong and the message was not handled well in the VERP handler.
        return false;
    }

}

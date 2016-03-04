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
 * Forum post renderable for e-mail.
 *
 * @package    mod_forum
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_forum\output;

defined('MOODLE_INTERNAL') || die();

/**
 * Forum post renderable for use in e-mail.
 *
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class forum_post_email extends forum_post {
    /**
     * Whether the user can reply to this post.
     *
     * @var boolean $canreply
     */
    protected $canreply = false;

    /**
     * Builds a renderable forum post
     *
     * @param object $course Course of the forum
     * @param object $cm Course Module of the forum
     * @param object $forum The forum of the post
     * @param object $discussion Discussion thread in which the post appears
     * @param object $post The post
     * @param object $author Author of the post
     * @param object $recipient Recipient of the email
     * @param bool $canreply True if the user can reply to the post
     */
    public function __construct($course, $cm, $forum, $discussion, $post, $author, $recipient, $canreply) {
        parent::__construct($course, $cm, $forum, $discussion, $post, $author);

        $this->userto = $recipient;
        $this->canreply = $canreply;
    }

    /**
     * Export this data so it can be used as the context for a mustache template.
     *
     * @param \mod_forum_renderer $renderer The render to be used for formatting the message and attachments
     * @return stdClass Data ready for use in a mustache template
     */
    public function export_for_template(\renderer_base $renderer) {
        return array_merge($this->export_for_template_base(), [
            'id'                            => $this->post->id,
            'coursename'                    => $this->get_coursename(),
            'courselink'                    => $this->get_courselink(),
            'forumname'                     => $this->get_forumname(),
            'showdiscussionname'            => $this->get_showdiscussionname(),
            'discussionname'                => $this->get_discussionname(),
            'subject'                       => $this->get_subject(),
            'authorfullname'                => $this->get_author_fullname(),
            'postdate'                      => $this->get_postdate(),

            // Format some components according to the renderer.
            'message'                       => $renderer->format_message_text($this->cm, $this->post),
            'attachments'                   => $renderer->format_message_attachments($this->cm, $this->post),

            'grouppicture'                  => $this->get_group_picture(),
        ]);
    }

    /**
     * Export this data so it can be used as the context for a mustache template.
     *
     * @param \mod_forum_renderer $renderer The render to be used for formatting the message and attachments
     * @return stdClass Data ready for use in a mustache template
     */
    public function export_for_template_text(\mod_forum_renderer $renderer) {
        return array_merge($this->export_for_template_base(), [
            'id'                            => html_entity_decode($this->post->id),
            'coursename'                    => html_entity_decode($this->get_coursename()),
            'courselink'                    => html_entity_decode($this->get_courselink()),
            'forumname'                     => html_entity_decode($this->get_forumname()),
            'showdiscussionname'            => html_entity_decode($this->get_showdiscussionname()),
            'discussionname'                => html_entity_decode($this->get_discussionname()),
            'subject'                       => html_entity_decode($this->get_subject()),
            'authorfullname'                => html_entity_decode($this->get_author_fullname()),
            'postdate'                      => html_entity_decode($this->get_postdate()),

            // Format some components according to the renderer.
            'message'                       => html_entity_decode($renderer->format_message_text($this->cm, $this->post)),
            'attachments'                   => html_entity_decode($renderer->format_message_attachments($this->cm, $this->post)),

            'grouppicture'                  => $this->get_group_picture(),
        ]);
    }

    protected function export_for_template_base() {
        return [
            'permalink'                     => $this->get_permalink(),
            'firstpost'                     => $this->get_is_firstpost(),
            'replylink'                     => $this->get_replylink(),
            'unsubscribediscussionlink'     => $this->get_unsubscribediscussionlink(),
            'unsubscribeforumlink'          => $this->get_unsubscribeforumlink(),
            'parentpostlink'                => $this->get_parentpostlink(),
            'canreply'                      => $this->canreply,

            'forumindexlink'                => $this->get_forumindexlink(),
            'forumviewlink'                 => $this->get_forumviewlink(),
            'discussionlink'                => $this->get_discussionlink(),

            'authorlink'                    => $this->get_authorlink(),
            'authorpicture'                 => $this->get_author_picture(),
        ];

    }
}

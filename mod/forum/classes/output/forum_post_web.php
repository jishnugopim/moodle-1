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
 * Forum post renderable for web.
 *
 * @package    mod_forum
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace mod_forum\output;

defined('MOODLE_INTERNAL') || die();

/**
 * Forum post renderable for use in web.
 *
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class forum_post_web extends forum_post {
    /**
     * @var array   The list of commands available for actions such as edit, reply, etc.
     */
    protected $commands = [];

    /**
     * @var bool    Whether to show the post as just a link rather than the full post.
     */
    protected $linkonly = false;

    /**
     * @var bool    Whether to show the word count.
     */
    protected $displaywordcount = false;

    /**
     * @var string  Portfolio link HTML content.
     */
    protected $portfoliobutton = null;

    /**
     * @var bool    Whether this is the first unread post.
     */
    protected $firstunread = false;

    /**
     * @var bool    Whether the author is shown.
     */
    protected $authorshown = true;

    /**
     * Builds a renderable forum post for web.
     *
     * @param object $course Course of the forum
     * @param object $cm Course Module of the forum
     * @param object $forum The forum of the post
     * @param object $discussion Discussion thread in which the post appears
     * @param object $post The post
     * @param object $author Author of the post
     */
    public function __construct($course, $cm, $forum, $discussion, $post, $author) {
        $this->course = $course;
        $this->cm = $cm;
        $this->forum = $forum;
        $this->discussion = $discussion;
        $this->post = $post;
        $this->author = $author;
    }

    /**
     * Whether the user has read tracking enabled for this foum.
     *
     * @return bool
     */
    public function is_forum_tracked() {
        return forum_tp_can_track_forums($this->forum) && forum_tp_is_tracked($this->forum);
    }

    /**
     * Whether the user has read this post.
     *
     * @return bool
     */
    public function is_read() {
        global $USER;
        return forum_tp_is_post_read($USER->id, $this->post);
    }

    /**
     * Whether this is the final post to display.
     *
     * @return bool
     */
    public function is_last_post() {
        return !empty($this->post->lastpost);
    }

    /**
     * Add a command to display.
     *
     * @param   moodle_url  $link       The link for the command.
     * @param   string      $linktext   The text of the link.
     * @return  $this
     */
    public function add_command(\moodle_url $link, $linktext) {
        $this->commands[] = (object) [
                'link'  => $link->out(),
                'text'  => $linktext,
            ];

        return $this;
    }

    /**
     * Whether to only show a link for the post, and not the actual post.
     *
     * @param   boolean     $linkonly   This is only a link to the post
     * @return  $this
     */
    public function set_link_only($linkonly = false) {
        $this->linkonly = $linkonly;

        return $this;
    }

    /**
     * Whether this post should be shortened.
     *
     * @return bool
     */
    public function should_shorten_post() {
        global $CFG;

        return $this->linkonly && (strlen(strip_tags($this->post->message)) > $CFG->forum_longpost);
    }

    /**
     * Set the link to the portfolio.
     *
     * @param   portfolio_add_button    $button     The link to the button.
     * @return  $this
     */
    public function set_portfolio_link(\portfolio_add_button $button) {
        $this->portfoliobutton = $button;

        return $this;
    }

    /**
     * Whether this is the first unread post.
     *
     * @param   bool    $state  First unread or not
     * @return  $this
     */
    public function set_first_unread_post(bool $state) {
        $this->firstunread = $state;

        return $this;
    }

    /**
     * Whether this is the first unread post in the discussion.
     *
     * @return  bool
     */
    public function is_first_unread_post() {
        return $this->firstunread;
    }

    /**
     * Whether this is the first unread post in the discussion.
     *
     * @return  bool
     */
    public function is_author_shown() {
        return !($this->forum->type === 'single' && empty($this->post->parent));
    }

    /**
     * Whether this is the first unread post in the discussion.
     *
     * @return  bool
     */
    public function is_group_picture_shown() {
        return $this->is_author_shown() || $this->is_group_member();
    }

    /**
     * Export this data so it can be used as the context for a mustache template.
     *
     * @param \mod_forum_renderer $renderer The render to be used for formatting the message and attachments
     * @return stdClass Data ready for use in a mustache template
     */
    public function export_for_template(\renderer_base $renderer, $plaintext = false) {
        global $CFG;
        $data = parent::export_for_template($renderer);

        if ($this->is_forum_tracked()) {
            $data['tracked'] = true;
            $data['read'] = $this->is_read();
            $data['firstunread'] = $this->is_first_unread_post();
        } else {
            $data['tracked'] = false;
            $data['read'] = true;
            $data['firstunread'] = false;
        }
        $data['lastpost'] = $this->is_last_post();

        list($data['attachments'], $data['attachedimages']) =
                forum_print_attachments($this->post, $this->cm, 'separateimages');

        if ($this->should_shorten_post()) {
            $data['shortenpost'] = true;
            $data['message'] = shorten_text($data['message'], $CFG->forum_shortpost);
            $data['link'] = true;
            $this->displaywordcount = true;
        }

        if ($this->displaywordcount) {
            $data['numwords'] = count_words($data['message']);
        }

        if (!empty($this->post->rating)) {
            $data['rating'] = $this->render($this->post->rating);
        } else {
            $data['rating'] = '';
        }

        foreach ($this->commands as $command) {
            $command->last = false;
        }
        $command->last = true;

        $data['commands'] = $this->commands;

        if (!empty($data['portfolio_link'])) {
            $data['portfolio_link'] = $this->portfoliobutton->to_html(PORTFOLIO_ADD_TEXT_LINK);
        }

        $data['authorshown'] = $this->is_author_shown();
        $data['grouppictureshown'] = $this->is_group_picture_shown();

        return $data;
    }
}

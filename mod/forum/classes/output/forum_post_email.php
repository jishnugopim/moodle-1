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
     * The user's digest preference was ignored.
     *
     * @var boolean $digestignored
     */
    protected $digestignored = false;

    /**
     * Export this data so it can be used as the context for a mustache template.
     *
     * @param   renderer_base   $renderer   The render to be used for formatting the message and attachments
     * @param   boolean         $plaintext  Whether the target is a plaintext target
     * @return  stdClass                    Data ready for use in a mustache template
     */
    public function export_for_template(\renderer_base $renderer, $plaintext = false) {
        $data = parent::export_for_template($renderer, $plaintext);
        $data['digestignored'] = $this->digestignored;

        return $data;
    }

    /**
     * Set whether the daily digest was ignored for this user.
     *
     * @param   boolean     $ignored    Whether the digest was ignored.
     * @return  self
     */
    protected function set_digestignored($ignored = false) {
        $this->digestignored = true;

        return $this;
    }
}

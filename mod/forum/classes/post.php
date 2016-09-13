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
 * Class for loading/storing forum posts from the DB.
 *
 * @package    mod_forum
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
namespace mod_forum;
defined('MOODLE_INTERNAL') || die();

use coding_exception;
use context_system;
use lang_string;
use stdClass;
use core_competency\persistent;

/**
 * Class for loading/storing forums from the DB.
 *
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class post extends persistent {

    const TABLE = 'forum_posts';

    /**
     * Return the definition of the properties of this model.
     *
     * @return array
     */
    protected static function define_properties() {
        return [
			'id' => [
                'type' => PARAM_INT,
			],
			'discussion' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
			'parent' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
			'userid' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
			'created' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
			'modified' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
			'mailed' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
			'subject' => [
                'type' => PARAM_TEXT,
                'default' => '',
			],
			'message' => [
                'type' => PARAM_RAW
			],
			'messageformat' => [
                'choices' => [
                    FORMAT_HTML,
                    FORMAT_MOODLE,
                    FORMAT_PLAIN,
                    FORMAT_MARKDOWN,
                ],
                'type' => PARAM_INT,
                'default' => FORMAT_HTML

			],
			'messagetrust' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
			'attachment' => [
                'type' => PARAM_TEXT,
                'default' => '',
			],
			'totalscore' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
			'mailnow' => [
                'type' => PARAM_INT,
                'default' => 0,
			],
        ];
    }
}

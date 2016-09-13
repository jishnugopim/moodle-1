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
 * Class for loading/storing forums from the DB.
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
class forum extends persistent {

    const TABLE = 'forum';

    /** Type news */
    const TYPE_NEWS = 'news';

    /** Type eachuser */
    const TYPE_EACHUSER = 'eachuser';

    /** Type single */
    const TYPE_SINGLE = 'single';

    /** Type general */
    const TYPE_GENERAL = 'general';

    /** Type qanda */
    const TYPE_QANDA = 'qanda';

    /** Type blog */
    const TYPE_BLOG = 'blog';

    /**
     * Return the definition of the properties of this model.
     *
     * @return array
     */
    protected static function define_properties() {
        return [
            'course' => [
                'type' => PARAM_INT,
            ],
            'type' => [
                'choices' => [
                    self::TYPE_NEWS,
                    self::TYPE_EACHUSER,
                    self::TYPE_SINGLE,
                    self::TYPE_GENERAL,
                    self::TYPE_QANDA,
                    self::TYPE_BLOG,
                ],
                'type' => PARAM_ALPHA,
                'default' => 'general',
            ],
            'name' => [
                'type' => PARAM_TEXT,
                'default' => '',
            ],
            'intro' => [
                'default' => '',
                'type' => PARAM_RAW
            ],
            'introformat' => [
                'choices' => [
                    FORMAT_HTML,
                    FORMAT_MOODLE,
                    FORMAT_PLAIN,
                    FORMAT_MARKDOWN,
                ],
                'type' => PARAM_INT,
                'default' => FORMAT_HTML
            ],
            'assessed' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'assesstimestart' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'assesstimefinish' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'scale' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'maxbytes' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'maxattachments' => [
                'default' => 1,
                'type' => PARAM_INT
            ],
            'forcesubscribe' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'trackingtype' => [
                'default' => 1,
                'type' => PARAM_INT
            ],
            'rsstype' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'rssarticles' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'timemodified' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'warnafter' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'blockafter' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'blockperiod' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'completiondiscussions' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'completionreplies' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'completionposts' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'displaywordcount' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
            'lockdiscussionafter' => [
                'default' => 0,
                'type' => PARAM_INT
            ],
        ];
    }
}

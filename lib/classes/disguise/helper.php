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
 * Disguise.
 *
 * @package    core
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\disguise;

defined('MOODLE_INTERNAL') || die();

/**
 * Disguise.
 *
 * @package    core
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class helper {
    public static function instance(\context $context) {
        global $DB;
        if ($record = $DB->get_record('disguises', array('id' => $context->disguiseid))) {
            $classname = '\\disguise_' . $record->type . '\\disguise';
            if (class_exists($classname)) {
                return new $classname($record, $context);
            }
        }
        // TODO
        throw new \coding_exception('Disguise not found.');
    }

    public static function is_configured_for_user(\context $context, \stdClass $user) {
        global $USER;

        if (!$context->disguise) {
            return true;
        }

        if (null === $user) {
            $user = $USER;
        }

        return $context->disguise->is_configured_for_user($user);
    }

    public static function ensure_configured_for_user(\context $context, \stdClass $user = null) {
        global $USER;

        if (!$context->disguise) {
            return;
        }

        if (null === $user) {
            $user = $USER;
        }

        return $context->disguise->ensure_configured_for_user($user);
    }
}

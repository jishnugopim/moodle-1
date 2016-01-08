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
 * Fixture for \core_files\filestorage.
 *
 * @package   core_files
 * @category  phpunit
 * @copyright 2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core_files\filestorage {

    function sha1_file() {
        global $namespacemocks;
        if (isset($namespacemocks['sha1_file'])) {
            return call_user_func_array($namespacemocks['sha1_file'], func_get_args());
        } else {
            return call_user_func_array('\sha1_file', func_get_args());
        }
    }

}

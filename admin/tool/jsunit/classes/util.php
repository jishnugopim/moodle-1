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
 * JSUnit implementation of YUI Configuration object
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * JSUnit tool
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tool_jsunit_util {

    public static function check_dir_exists($directory, $removefirst = false) {
        global $CFG;

        if (empty($CFG->jsunit_root)) {
            throw new tool_jsunit_exception('No jsunit_root defined');
        }
        if (!is_dir($CFG->jsunit_root)) {
            if (strpos($CFG->jsunit_root, $CFG->dirroot) !== false) {
                // The jsunit_root is wihin the dirroot - bail.
                throw new tool_jsunit_exception('The jsunit_root cannot be within the dirroot');
            }
        }

        if (strpos($directory, '/') === 0) {
            // The directory starts with a / so it is absolute.
            // Check that it's within the jsunit_root.
            if (strpos($directory, $CFG->jsunit_root) !== 0) {
                throw new tool_jsunit_exception('Attempted to create ' . $directory .
                    ' outside of the the jsunit_root directory');
            }
        } else {
            // Prefix wtih the jsunit_root.
            $directory = $CFG->jsunit_root . DIRECTORY_SEPARATOR . $directory;
        }

        if ($removefirst) {
            remove_dir($directory);
        }
        if (check_dir_exists($directory)) {
            return $directory;
        } else {
            throw new tool_jsunit_exception('Could not create your new shiny directory :(');
        }
    }

    public static function recursive_copy($source, $destination) {
        if (!is_dir($source) || !is_readable($source)) {
            throw new tool_jsunit_exception("Invalid source directory '$source'");
        }
        if (!is_dir($destination)) {
            mkdir($destination);
        }
        if (!is_dir($destination) || !is_readable($destination)) {
            throw new tool_jsunit_exception("Invalid destination directory '$source'");
        }
        $directoryiterator = new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS);
        $iterator = new RecursiveIteratorIterator($directoryiterator,  RecursiveIteratorIterator::SELF_FIRST);
        foreach ($iterator as $item) {
            $path = $destination . DIRECTORY_SEPARATOR . $iterator->getSubPathName();
            if ($item->isDir()) {
                mkdir($path);
            } else {
                copy($item, $path);
            }
        }
    }
}

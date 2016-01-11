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

namespace core_files\filestorage;

/**
 * Implementation of .tar.gz packer.
 *
 * A limited subset of the .tar format is supported. This packer can open files
 * that it wrote, but may not be able to open files from other sources,
 * especially if they use extensions. There are restrictions on file
 * length and character set of filenames.
 *
 * We generate POSIX-compliant ustar files. As a result, the following
 * restrictions apply to archive paths:
 *
 * - Filename may not be more than 100 characters.
 * - Total of path + filename may not be more than 256 characters.
 * - For path more than 155 characters it may or may not work.
 * - May not contain non-ASCII characters.
 *
 * @package core_files
 * @copyright 2013 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Handles extraction to pathname.
 */
class tgz_packer_extract_to_pathname implements tgz_extractor_handler {
    /**
     * @var string Target directory for extract.
     */
    protected $pathname;
    /**
     * @var array Array of files to extract (other files are skipped).
     */
    protected $onlyfiles;

    /**
     * Constructor.
     *
     * @param string $pathname target directory
     * @param array $onlyfiles only extract files present in the array
     */
    public function __construct($pathname, array $onlyfiles = null) {
        $this->pathname = $pathname;
        $this->onlyfiles = $onlyfiles;
    }

    /**
     * @see tgz_extractor_handler::tgz_start_file()
     */
    public function tgz_start_file($archivepath) {
        // Check file restriction.
        if ($this->onlyfiles !== null && !in_array($archivepath, $this->onlyfiles)) {
            return null;
        }
        // Ensure directory exists and prepare filename.
        $fullpath = $this->pathname . '/' . $archivepath;
        check_dir_exists(dirname($fullpath));
        return $fullpath;
    }

    /**
     * @see tgz_extractor_handler::tgz_end_file()
     */
    public function tgz_end_file($archivepath, $realpath) {
        // Do nothing.
    }

    /**
     * @see tgz_extractor_handler::tgz_directory()
     */
    public function tgz_directory($archivepath, $mtime) {
        // Check file restriction.
        if ($this->onlyfiles !== null && !in_array($archivepath, $this->onlyfiles)) {
            return false;
        }
        // Ensure directory exists.
        $fullpath = $this->pathname . '/' . $archivepath;
        check_dir_exists($fullpath);
        return true;
    }
}

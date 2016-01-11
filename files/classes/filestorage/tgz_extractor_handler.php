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
 * Implementation of .tar.gz extractor. Handles extraction of .tar.gz files.
 * Do not call directly; use methods in tgz_packer.
 *
 * @see tgz_packer
 * @package core_files
 * @copyright 2013 The Open University
 * @license http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Interface for callback from tgz_extractor::extract.
 *
 * The file functions will be called (in pairs tgz_start_file, tgz_end_file) for
 * each file in the archive. (There is only one exception, the special
 * .ARCHIVE_INDEX file which is not reported to the handler.)
 *
 * The directory function is called whenever the archive contains a directory
 * entry.
 */
interface tgz_extractor_handler {
    /**
     * Called when the system begins to extract a file. At this point, the
     * handler must decide where on disk the extracted file should be located.
     * This can be a temporary location or final target, as preferred.
     *
     * The handler can request for files to be skipped, in which case no data
     * will be written and tgz_end_file will not be called.
     *
     * @param string $archivepath Path and name of file within archive
     * @return string Location for output file in filesystem, or null to skip file
     */
    public function tgz_start_file($archivepath);

    /**
     * Called when the system has finished extracting a file. The handler can
     * now process the extracted file if required.
     *
     * @param string $archivepath Path and name of file within archive
     * @param string $realpath Path in filesystem (from tgz_start_file return)
     * @return bool True to continue processing, false to abort archive extract
     */
    public function tgz_end_file($archivepath, $realpath);

    /**
     * Called when a directory entry is found in the archive.
     *
     * The handler can create a corresponding directory if required.
     *
     * @param string $archivepath Path and name of directory within archive
     * @param int $mtime Modified time of directory
     * @return bool True if directory was created, false if skipped
     */
    public function tgz_directory($archivepath, $mtime);
}

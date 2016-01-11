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
 * Handles extraction to file storage.
 */
class tgz_packer_extract_to_storage implements tgz_extractor_handler {
    /**
     * @var string Path to temp file.
     */
    protected $tempfile;

    /**
     * @var int Context id for files.
     */
    protected $contextid;
    /**
     * @var string Component name for files.
     */
    protected $component;
    /**
     * @var string File area for files.
     */
    protected $filearea;
    /**
     * @var int Item ID for files.
     */
    protected $itemid;
    /**
     * @var string Base path for files (subfolders will go inside this).
     */
    protected $pathbase;
    /**
     * @var int User id for files or null if none.
     */
    protected $userid;

    /**
     * Constructor.
     *
     * @param int $contextid Context id for files.
     * @param string $component Component name for files.
     * @param string $filearea File area for files.
     * @param int $itemid Item ID for files.
     * @param string $pathbase Base path for files (subfolders will go inside this).
     * @param int $userid User id for files or null if none.
     */
    public function __construct($contextid, $component, $filearea, $itemid, $pathbase, $userid) {
        global $CFG;

        // Store all data.
        $this->contextid = $contextid;
        $this->component = $component;
        $this->filearea = $filearea;
        $this->itemid = $itemid;
        $this->pathbase = $pathbase;
        $this->userid = $userid;

        // Obtain temp filename.
        $tempfolder = $CFG->tempdir . '/core_files';
        check_dir_exists($tempfolder);
        $this->tempfile = tempnam($tempfolder, '.dat');
    }

    /**
     * @see tgz_extractor_handler::tgz_start_file()
     */
    public function tgz_start_file($archivepath) {
        // All files are stored in the same filename.
        return $this->tempfile;
    }

    /**
     * @see tgz_extractor_handler::tgz_end_file()
     */
    public function tgz_end_file($archivepath, $realpath) {
        // Place temp file into storage.
        $fs = get_file_storage();
        $filerecord = array('contextid' => $this->contextid, 'component' => $this->component,
                'filearea' => $this->filearea, 'itemid' => $this->itemid);
        $filerecord['filepath'] = $this->pathbase . dirname($archivepath) . '/';
        $filerecord['filename'] = basename($archivepath);
        if ($this->userid) {
            $filerecord['userid'] = $this->userid;
        }
        // Delete existing file (if any) and create new one.
        tgz_packer::delete_existing_file_record($fs, $filerecord);
        $fs->create_file_from_pathname($filerecord, $this->tempfile);
        unlink($this->tempfile);
    }

    /**
     * @see tgz_extractor_handler::tgz_directory()
     */
    public function tgz_directory($archivepath, $mtime) {
        // Standardise path.
        if (!preg_match('~/$~', $archivepath)) {
            $archivepath .= '/';
        }
        // Create directory if it doesn't already exist.
        $fs = get_file_storage();
        if (!$fs->file_exists($this->contextid, $this->component, $this->filearea, $this->itemid,
                $this->pathbase . $archivepath, '.')) {
            $fs->create_directory($this->contextid, $this->component, $this->filearea, $this->itemid,
                    $this->pathbase . $archivepath);
        }
        return true;
    }
}

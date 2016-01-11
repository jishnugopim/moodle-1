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
 * File handling related exceptions.
 *
 * @package   core_files
 * @copyright 2008 Petr Skoda (http://skodak.org)
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Problem with records in the {files_reference} table.
 *
 * @package   core_files
 * @category  files
 * @copyright 2012 David Mudrak <david@moodle.com>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class file_reference_exception extends file_exception {
    /**
     * Constructor.
     *
     * @param int $repositoryid the id of the repository that provides the referenced file
     * @param string $reference the information for the repository to locate the file
     * @param int|null $referencefileid the id of the record in {files_reference} if known
     * @param int|null $fileid the id of the referrer's record in {files} if known
     * @param string|null $debuginfo extra debug info
     */
    function __construct($repositoryid, $reference, $referencefileid=null, $fileid=null, $debuginfo=null) {
        $a = new \stdClass();
        $a->repositoryid = $repositoryid;
        $a->reference = $reference;
        $a->referencefileid = $referencefileid;
        $a->fileid = $fileid;
        parent::__construct('filereferenceproblem', $a, $debuginfo);
    }
}

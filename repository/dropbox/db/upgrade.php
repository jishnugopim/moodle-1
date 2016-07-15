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

defined('MOODLE_INTERNAL') || die();

/**
 * @param int $oldversion the version we are upgrading from
 * @return bool result
 */
function xmldb_repository_dropbox_upgrade($oldversion) {
    global $DB;

    // Moodle v2.8.0 release upgrade line.
    // Put any upgrade step following this.

    // Moodle v2.9.0 release upgrade line.
    // Put any upgrade step following this.

    // Moodle v3.0.0 release upgrade line.
    // Put any upgrade step following this.

    // Moodle v3.1.0 release upgrade line.
    // Put any upgrade step following this.
    if ($oldversion < 2016071500) {
        if ($DB->record_exists('repository', ['type' => 'dropbox'])) {
            // If the dropbox plugin is currently enabled, we will initially need to continue using the legacy API.
            set_config('legacyapi', true, 'dropbox');
        }
        upgrade_plugin_savepoint(true, 2016071500, 'repository', 'dropbox');
    }

    return true;
}

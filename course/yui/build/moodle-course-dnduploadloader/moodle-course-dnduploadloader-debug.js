YUI.add('moodle-course-dnduploadloader', function (Y, NAME) {

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
 * Adds the ability to perform drag-and-drop upload of files into a course.
 *
 * @module moodle-course-dndupload
 * @package    core
 * @subpackage course
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

Y.namespace('Moodle.course.dnduploadloader');

var LOGNAME = 'moodle-course-dnduploadloader';

Y.Moodle.course.dnduploadloader = {
    init: function(config) {
        Y.log('Drag and Drop upload loader initialising', 'info', LOGNAME);

        if (!this.browser_supported()) {
            return false;
        }

        Y.log('Drag and Drop support detected - loading dndupload module', 'info', LOGNAME);
        Y.use('moodle-course-dndupload', function() {
            Y.Moodle.course.dndupload.init(config);
        });
    },

    /**
     * Check whether the browser has the required functionality.
     * This is also checked in the dndupload-loader before-hand but we
     * check again in case this module was loaded separately.
     *
     * @method browser_supported
     * @return {Boolean} Whether the user's browser supports drag-and-drop uploading of files.
     */
    browser_supported: function() {
        if (typeof FileReader === 'undefined') {
            return false;
        }
        if (typeof FormData === 'undefined') {
            return false;
        }
        return true;
    }
};


}, '@VERSION@');

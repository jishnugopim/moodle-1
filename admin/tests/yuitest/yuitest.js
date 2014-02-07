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

// A module name should be composed of:
// moodle-<component>-<module>[-<submodule>][-skin]
var me = (function(me) {
    var parts = me.name.split('-'),
        component = parts[1],
        module = parts[2];

    if (/-(skin|core)$/.test(me.name)) {
        // For unit tests, we don't actually care about these bits, so return early.
        return me;
    }

    // Determine the filename based on the remaining parts.
    var modulename = 'moodle-' + component + '_' + module;

    // Build the first part of the filename.
    me.path = 'build/' + modulename + '/' + me.name + '.js';

    return me;
}(me));

YUI.add('moodle-atto_collapse-button', function (Y, NAME) {

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
 * Atto text editor collapse plugin.
 *
 * @package    atto_collapse
 * @copyright  2013 Damyon Wiese  <damyon@moodle.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

var GROUPS = '.atto_group';

function AttoCollapse() {
    AttoCollapse.superclass.constructor.apply(this, arguments);
}

Y.namespace('M.atto_collapse').Button = Y.extend(AttoCollapse, Y.M.editor_atto.EditorPlugin, {
    initializer: function() {
        var button = this.addButton({
            icon: M.util.image_url('icon', 'atto_collapse'),
            callback: this.collapse
        });

        // Set the initial button state.
        button.setData('collapsed', false);

        // Perform a toggle after all plugins have been loaded for the first time.
        this.get('host').on('pluginsloaded', this._toggle, this);
    },

    /**
     * Toggle the visibility of the extra groups in the toolbar.
     *
     * @method toggle
     * @param {EventFacade} e
     */
    collapse: function(e) {
        e.preventDefault();
        this._toggle();
    },

    /**
     * Toggle the visibility of the extra groups in the toolbar.
     *
     * @method toggle
     * @private
     */
    _toggle: function() {
        var button = this.buttons[0],
            groups = this.toolbar.all(GROUPS).slice(this.get('showGroups'));

        if (button.getData('collapsed')) {
            button.set('title', M.util.get_string('showmore', 'atto_collapse'));
            groups.show();
            button.setData('collapsed', false);
        } else {
            button.set('title', M.util.get_string('showless', 'atto_collapse'));
            groups.hide();
            button.setData('collapsed', true);
        }
    }
}, {
    ATTRS: {
        /**
         * How many groups to show when collapsed.
         *
         * @property showGroups
         * @type number
         * @default 3
         */
        showGroups: {
            value: 3
        }
    }
});


}, '@VERSION@', {"requires": ["node"]});

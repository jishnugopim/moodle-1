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
 * javascript for a searchable select type element
 *
 * @package   formlib
 * @copyright 2009 Jerome Mouneyrac
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

selector = {
    template:   '<div class="searchui">' +
                    '<label for="{{id}}">{{strsearch}}</label>' +
                    '<input type="text" id="{{id}}"' +
                "</div>",

    filter_init: function(strsearch, selectinputid) {
        var list = Y.one(document.getElementById(selectinputid)),
            listOptions = {};

        Y.use('event-key', 'handlebars', function() {
            // Store the selector options in its own data attribute.
            list.get('options').each(function() {
                listOptions[this.get('value') + ': ' + this.get('innerHTML')] = this.get('outerHTML');
            });
            list.setData('options', listOptions);

            var template = Y.Handlebars.compile(selector.template),
                searchField = Y.Node.create(template({
                    id: selectinputid + '_input'
                })),
                searchInput = searchField.one('input');
            searchInput.setData('for', list);
            searchInput.on('keyup', selector.filter_change);
            list.insert(searchField, 'before');
        });
    },

    filter_change: function(e) {
        var list = e.currentTarget.getData('for'),
            pattern = "^\\d+: .*" + e.currentTarget.get('value') + ".*$",
            regex = new RegExp(pattern, 'i'),
            allOptions = list.getData('options');

        list.empty();
        Y.Object.each(allOptions, function(value, key) {
            if (regex.test(key)) {
                list.appendChild(value);
            }
        });

        if (list.one('select')) {
            list.removeClass('error');
        } else {
            list.addClass('error');
        }
    }
};

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
 * Popup
 *
 * @module     core/popup
 * @package    popup
 * @copyright  2016 Andrew Robert Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since      3.1
 */
define(['jquery'],
function($) {
    $('body').delegate('[data-popup]', 'click', function(e) {
        var link    = $(e.target.closest('a[data-popup]'));
        window.openpopup(e, $.extend({
                url: link.attr('href'),
                options: link.data('popup'),
                name: link.data('name')
            }));
    });

    return {};
});

require(['core/popup']);

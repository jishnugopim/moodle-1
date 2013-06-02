YUI.add('moodle-course-dndupload', function (Y, NAME) {

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
 * @copyright  2012 Davo Smith
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

Y.namespace('Moodle.course.dndupload');

var SELECTORS = {
    sections: 'li.section.main',
    section_mod: 'ul.section',
    sections_mods: 'li.section.main ul.section',
    section_types: 'li.section, li.main',
    preview_element: '.dndupload-preview'
},
    CSS = {
    preview_hide: 'dndupload-hidden',
    preview_over: 'dndupload-over'
};

Y.Moodle.course.dndupload = {

    // Various attributes.
    maxbytes: null,
    courseid: null,
    handlers: null,
    uploadqueue: [],
    lastselected: [],

    showstatus: false,
    previews_established: false,

    currentsection: null,

    entercount: 0,

    init: function(config) {

        // Check whether this browser supports drag-and-drop upload.
        if (!this.browser_supported()) {
            return;
        }

        // Nothing to upload to - exit early.
        if (!Y.one(SELECTORS.sections)) {
            return;
        }

        // Assign attributes from our provided configuration.
        this.maxbytes = config.maxbytes;
        this.courseid = config.courseid;
        this.handlers = config.handlers;

        // Add the event listeners.
        Y.delegate('dragenter', this.dragenter, Y.config.doc, SELECTORS.sections, this);
        Y.delegate('dragleave', this.dragleave, Y.config.doc, SELECTORS.sections, this);
        Y.delegate('dragover',  this.dragover,  Y.config.doc, SELECTORS.sections, this);
        Y.delegate('drop',      this.drop,      Y.config.doc, SELECTORS.sections, this);

        // Add the status message.
        if (this.showstatus) {
            this.add_status_div();
        }
    },

    /**
     * Check whether the browser has the required functionality
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
    },

    /**
     * Set up preview elements for each section.
     *
     * This is a potentially expensive operation which requires
     * modification to the DOM. Try and leave it as late as possible.
     *
     * @method setup_section_previews
     * @return {null}
     */
    setup_section_previews: function() {
        if (this.previews_established) {
            return;
        }

        var template = Y.Node.create(
                '<li class="dndupload-preview dndupload-hidden">' +
                    '<div class="mod-indent">' +
                        '<img /> <span class="instancename" />' +
                    '</div>' +
                '</li>');

        template.one('img').set('src', M.util.image_url('t/addfile'));
        template.one('span').set('innerHTML', M.util.get_string('addfilehere', 'moodle'));

        // Ensure that all sections have the relevant mod selectors - this
        // makes the following code to add the previews easier.
        //this.setup_section_mod_elements();

        Y.all(SELECTORS.sections_mods).each(function(node) {
            node.appendChild(template.cloneNode(true));
        });

        this.previews_established = true;
    },

    // TODO Fixme
    setup_section_mod_elements: function() {
        var selectors = Y.all(SELECTORS.sections);
        var template = Y.Node.create('<ul class="section img-text"></ul>');

        // Actually add the selectors now.
        selectors.each(function() {
            if (this.one(SELECTORS.section_mod)) {
                return;
            }
            this.appendChild(template.cloneNode(true));
        });
    },

    /**
     * Check if the event includes data of the given type.
     *
     * @method types_includes
     * @param {EventFacade} e
     * @param {String} type The data type to check for.
     * @return {Boolean} Whether the data type is found in the event data.
     */
    types_includes: function(e, type) {
        var paramkey;
        for(paramkey in e._event.dataTransfer.types) {
            if (!e._event.dataTransfer.types.hasOwnProperty(paramkey)) {
                continue;
            }
            if (e._event.dataTransfer.types[paramkey] === type) {
                return true;
            }
        }
        return false;
    },

    dragtype: function(e) {
        // Check there is some data attached.
        if (e._event.dataTransfer === null) {
            return false;
        }
        if (e._event.dataTransfer.types === null) {
            return false;
        }
        if (e._event.dataTransfer.types.length === 0) {
            return false;
        }

        // Check for files first.
        if (this.types_includes(e, 'Files')) {
            if (e.type !== 'drop' || e._event.dataTransfer.files.length !== 0) {
                if (this.handlers.filehandlers.length === 0) {
                    return false; // No available file handlers - ignore this drag.
                }

                return {
                    realtype: 'Files',
                    addmessage: 'addfilehere',
                    namemessage: null, // Should not be asked for anyway
                    type: 'Files'
                };
            }
        }

        // Check each of the registered types.
        var typekey;
        for (typekey in this.handlers.types) {
            if (!this.handlers.types.hasOwnProperty(typekey)) {
                continue;
            }

            // Check each of the different identifiers for this type.
            var dttypes = this.handlers.types[typekey].datatransfertypes,
                thistype;
            for (thistype in dttypes) {
                if (!dttypes.hasOwnProperty(thistype)) {
                    continue;
                }
                if (this.types_includes(e, dttypes[thistype])) {
                    return {
                        realtype: dttypes[thistype],
                        addmessage:     this.handlers.types[typekey].addmessage,
                        namemessage:    this.handlers.types[typekey].namemessage,
                        handlermessage: this.handlers.types[typekey].handlermessage,
                        type:           this.handlers.types[typekey].identifier,
                        handlers:       this.handlers.types[typekey].handlers
                    };
                }
            }
        }

        // There are no types that we can handle, return false here.
        return false;

    },

    /**
     * Check the content of the drag/drop includes a type we can handle.
     *
     * @param {EventFacade} e
     * @return {String|null} The type of the event, or null if no event found.
     */
    check_drag: function(e) {
        var type = this.dragtype(e);
        if (type) {
            // Prevent this event being handled by any further listeners.
            e.stopPropagation();
            e.preventDefault();
        }
        return type;
    },

    /**
     * Get the section from the provided child of the section.
     *
     * @param {Node} node The node
     * @return {Node} The section.
     */
    get_section: function(node) {
        return node.ancestor(SELECTORS.section_types, true);
    },

    /**
     * Determine the section ID for the section presented.
     *
     * @param {Node} node The node to check.
     * @return {Integer|null} The section to test.
     */
    get_section_id: function(node) {
        return node.get('id').replace('section-', '');
    },

    /**
     * Hide the current preview element.
     *
     * @method hide_preview_element
     */
    hide_preview_element: function() {
        // Hide the currently shown preview element.
        if (this.currentsection) {
            this.currentsection.addClass(CSS.preview_hide)
                    .removeClass(CSS.preview_over);
        }
    },

    /**
     * Show the preview element for the specified section and type.
     *
     * @method show_preview_element
     * @param {Node} section The section being targetted.
     * @param {String} type The type of file being uploaded.
     */
    show_preview_element: function(section, type) {
        this.hide_preview_element();

        // Show the preview for the current section.
        if (section) {
            this.currentsection = section;
            this.currentsection.removeClass(CSS.preview_hide)
                    .addClass(CSS.preview_over);

            // Horrible work-around to allow the 'Add X here' text to be a drop target in Firefox.
            var node = this.currentsection.one('span').getDOMNode();
            node.firstChild.nodeValue = type.addmessage;
        }

    },

    /**
     * Handle the case where a file is dragged over the course.
     *
     * @method dragenter
     * @param {EventFacade} e
     */
    dragenter: function(e) {
        this.setup_section_previews();

        var type = this.check_drag(e),
            section = e.currentTarget.ancestor(SELECTORS.section_types, true);

        if (!type) {
            return false;
        }

        if (!section) {
            return false;
        }

        section = section.one(SELECTORS.preview_element);
        if (this.currentsection !== section) {
            this.entercount = 1;
            this.show_preview_element(section, type);
            return true;
        } else {
            this.entercount++;
            if (this.entercount > 2) {
                this.entercount = 2;
                return false;
            }
        }

        return false;
    },

    /**
     * Handle the case where the drag operation leaves the current event area.
     *
     * @method dragenter
     * @param {EventFacade} e
     */
    dragleave: function(e) {
        if (!this.check_drag(e)) {
            return false;
        }

        this.entercount--;
        if (this.entercount >= 0) {
            return false;
        }
        this.entercount = 0;
        this.hide_preview_element();

        this.currentsection = null;
        return true;
    },

    /**
     * Handle a dragover event: just prevent the browser default (necessary
     * to allow drag and drop handling to work).
     *
     * @method dragover
     * @param {EventFacade} e
     */
    dragover: function(e) {
        this.check_drag(e);
    },

    /**
     * Handle a drop event: hide the 'add here' message, check the attached
     * data type and start the upload process.
     *
     * @method drop
     * @param {EventFacade} e
     */
    drop: function(e) {
        var type = this.check_drag(e),
            section = this.get_section(e.currentTarget);

        if (!type) {
            return false;
        }

        if (!section) {
            return false;
        }

        this.hide_preview_element();

        var sectionid = this.get_section_id(section),
            files,
            contents,
            index;

        // Process the file or the included data.
        if (type.type === 'Files') {
            files = e._event.dataTransfer.files;
            for (index in files) {
                if (!files.hasOwnProperty(index)) {
                    continue;
                }
                this.handle_file(files[index], section, sectionid);
            }
        } else {
            contents = e._event.dataTransfer.getData(type.realtype);
            if (contents) {
                this.handle_item(type, contents, section, sectionid);
            }
        }
    }
};


}, '@VERSION@', {"requires": ["node", "event", "json", "anim", "dd", "moodle-core-notification", "selector-css3"]});

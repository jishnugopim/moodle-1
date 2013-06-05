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
        // TODO
        //this.setup_section_mod_elements();

        Y.all(SELECTORS.sections_mods).each(function(node) {
            node.appendChild(template.cloneNode(true));
        });

        this.previews_established = true;
    },

    // TODO Fixme
    setup_section_mod_elements: function() {
        var selectors = Y.all(SELECTORS.sections),
            template = Y.Node.create('<ul class="section img-text"></ul>');

        // Actually add the selectors now.
        selectors.each(function() {
            if (this.one(SELECTORS.section_mod)) {
                // This section already has a section mod - no need to add another.
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
        for (paramkey in e._event.dataTransfer.types) {
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
                    // No available file handlers - ignore this drag.
                    return false;
                }

                return {
                    realtype: 'Files',
                    addmessage: 'addfilehere',
                    namemessage: null,
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
     * @method check_drag
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
    },

    /**
     * Find the registered handler for the given file type. If there is more than one, ask the
     * user which one to use. Then upload the file to the server
     *
     * TODO Rewrite
     * @method handle_file
     * @param {Object} file the details of the file, taken from the FileList in the drop event
     * @param {Node} section the DOM element representing the selected course section
     * @param {Integer} sectionnumber the number of the selected course section
     */
    handle_file: function(file, section, sectionnumber) {
        var handlers = [],
            handler = null,
            current = null,
            filehandlers = this.handlers.filehandlers,
            extension = '',
            dotpos = file.name.lastIndexOf('.');

        if (dotpos !== -1) {
            extension = file.name.substr(dotpos+1, file.name.length).toLowerCase();
        }

        for (handler in filehandlers) {
            if (!filehandlers.hasOwnProperty(handler)) {
                continue;
            }
            current = filehandlers[handler];
            if (current.extension === '*' || current.extension === extension) {
                handlers.push(current);
            }
        }

        if (handlers.length === 0) {
            // No handlers at all.
            return;
        }

        if (handlers.length === 1) {
            // Only one handler - just upload using this handler.
            return this.upload_file(file, section, sectionnumber, handlers[0].module);
        }

        return this.file_handler_dialog(file, section, sectionnumber, handlers, extension);
    },

    /**
     * Do the file upload: show the dummy element, use an AJAX call to send the data
     * to the server, update the progress bar for the file, then replace the dummy
     * element with the real information once the AJAX call completes
     *
     * TODO Rewrite
     * @param {Object} file the details of the file, taken from the FileList in the drop event
     * @param section the DOM element representing the selected course section
     * @param sectionnumber the number of the selected course section
     */
    upload_file: function(file, section, sectionnumber, module) {

        // This would be an ideal place to use the Y.io function
        // however, this does not support data encoded using the
        // FormData object, which is needed to transfer data from
        // the DataTransfer object into an XMLHTTPRequest
        // This can be converted when the YUI issue has been integrated:
        // http://yuilibrary.com/projects/yui3/ticket/2531274
        var xhr = new XMLHttpRequest();
        var self = this;

        if (file.size > this.maxbytes) {
            alert("'"+file.name+"' "+M.util.get_string('filetoolarge', 'moodle'));
            return;
        }

        // Add the file to the display
        var resel = this.add_resource_element(file.name, section, module);

        // Update the progress bar as the file is uploaded
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                var percentage = Math.round((e.loaded * 100) / e.total);
                resel.progress.style.width = percentage + '%';
            }
        }, false);

        // Wait for the AJAX call to complete, then update the
        // dummy element with the returned details
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    var result = JSON.parse(xhr.responseText);
                    if (result) {
                        if (result.error === 0) {
                            // All OK - update the dummy element
                            if (result.content) {
                                // A label
                                resel.indentdiv.innerHTML = '<div class="activityinstance" ></div>' + result.content + result.commands;
                            } else {
                                // Not a label
                                resel.icon.src = result.icon;
                                resel.a.href = result.link;
                                resel.namespan.innerHTML = result.name;

                                if (!parseInt(result.visible, 10)) {
                                    resel.a.className = 'dimmed';
                                }

                                if (result.groupingname) {
                                    resel.groupingspan.innerHTML = '(' + result.groupingname + ')';
                                } else {
                                    resel.div.removeChild(resel.groupingspan);
                                }

                                resel.div.removeChild(resel.progressouter);
                                resel.indentdiv.innerHTML += result.commands;
                                if (result.onclick) {
                                    resel.a.onclick = result.onclick;
                                }
                                if (self.Y.UA.gecko > 0) {
                                    // Fix a Firefox bug which makes sites with a '~' in their wwwroot
                                    // log the user out when clicking on the link (before refreshing the page).
                                    resel.div.innerHTML = unescape(resel.div.innerHTML);
                                }
                            }
                            resel.li.id = result.elementid;
                            self.add_editing(result.elementid);
                        } else {
                            // Error - remove the dummy element
                            resel.parent.removeChild(resel.li);
                            alert(result.error);
                        }
                    }
                } else {
                    alert(M.util.get_string('servererror', 'moodle'));
                }
            }
        };

        // Prepare the data to send
        var formData = new FormData();
        formData.append('repo_upload_file', file);
        formData.append('sesskey', M.cfg.sesskey);
        formData.append('course', this.courseid);
        formData.append('section', sectionnumber);
        formData.append('module', module);
        formData.append('type', 'Files');

        // Send the AJAX call
        xhr.open("POST", this.url, true);
        xhr.send(formData);
    },

    /**
     * Call the AJAX course editing initialisation to add the editing tools
     * to the newly-created resource link
     *
     * @param elementid the id of the DOM element containing the new resource link
     * @param sectionnumber the number of the selected course section
     */
    add_editing: function(elementid) {
        Y.use('moodle-course-coursebase', function() {
            this.add_editing = this._add_editing;
            this.add_editing(elementid);
        });
    },

    _add_editing: function(elementid) {
        M.course.coursebase.invoke_function('setup_for_resource', '#' + elementid);
    }
};


}, '@VERSION@', {"requires": ["node", "event", "json", "anim", "dd", "moodle-core-notification", "selector-css3"]});

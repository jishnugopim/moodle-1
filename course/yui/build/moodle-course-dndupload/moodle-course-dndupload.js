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
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

Y.namespace('Moodle.course.dndupload');

var SELECTORS = {
        sections: 'li.section.main',
        section_mod: 'ul.section',
        sections_mods: 'li.section.main ul.section',
        section_types: 'li.section, li.main',
        preview_element: '.dndupload-preview',
        dnduploader: '.dndupload-loaded'
    },
    CSS = {
        dnduploader: 'dndupload-loaded',
        preview_hide: 'dndupload-hidden',
        preview_over: 'dndupload-over'
    },
    LOGNAME = 'moodle-course-dndupload',
    DNDUPLOAD;

DNDUPLOAD = function() {
    DNDUPLOAD.superclass.constructor.apply(this, arguments);
};


Y.extend(DNDUPLOAD, Y.Base, {
    uploadqueue: [],
    currentsection: null,
    lastSection: null,
    entercount: 0,

    // TODO fix
    previews_established: false,

    initializer: function() {
        if (Y.one(Y.config.doc.body).hasClass(SELECTORS.dnduploader)) {
            return;
        }

        // Add the dnduploader class to the body to prevent it from being loaded again.
        Y.one(Y.config.doc.body).addClass(CSS.dnduploader);

        // Check whether this browser supports drag-and-drop upload.
        if (!Y.Moodle.course.dnduploadloader.browser_supported()) {
            return;
        }

        // Nothing to upload to - exit early.
        if (!Y.one(SELECTORS.sections)) {
            return;
        }

        // Add the event listeners.
        Y.delegate('dragenter', this.dragenter, Y.config.doc, SELECTORS.sections, this);
        Y.delegate('dragleave', this.dragleave, Y.config.doc, SELECTORS.sections, this);
        Y.delegate('dragover',  this.dragover,  Y.config.doc, SELECTORS.sections, this);
        Y.delegate('drop',      this.drop,      Y.config.doc, SELECTORS.sections, this);

        // Add the status message.
        if (this.get('showStatusMessage')) {
            // TODO fix this.
            this.add_status_div();
        }
    },

    add_status_div: function() {
    },

    add_preview_to_section: function(section) {
        if (this.previews_established) {
            return;
        }

        if (typeof this.previewnode === "undefined") {
            this.previewnode = Y.Node.create(
                '<li class="dndupload-preview dndupload-hidden">' +
                    '<div class="mod-indent">' +
                        '<img src="' +
                            M.util.image_url('t/addfile') +
                            '"/>' +
                        '<span class="instancename" />' +
                    '</div>' +
                '</li>');
            this.previewnode.one('span').set('innerHTML',
                    M.util.get_string('addfilehere', 'core'));
        }

        section.one('ul.section').append(this.previewnode);

        return this.previewnode;
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
                    '<img src="' +
                        M.util.image_url('t/addfile') +
                        '"/>' +
                    '<span class="instancename" />' +
                '</div>' +
            '</li>');

        template.one('span').set('innerHTML', M.util.get_string('addfilehere', 'core'));

        // Ensure that all sections have the relevant mod selectors - this
        // makes the following code to add the previews easier.
        // TODO - is this still required?
        //this.setup_section_mod_elements();

        Y.all(SELECTORS.sections_mods).each(function(node) {
            node.appendChild(template.cloneNode(true));
        });

        this.previews_established = true;
    },

    // TODO Fixme - still required?
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
                if (this.get('handlers').filehandlers.length === 0) {
                    // No available file handlers - ignore this drag.
                    return false;
                }

                return {
                    realtype: 'Files',
                    addmessage: M.util.get_string('addfilehere', 'core'),
                    namemessage: null,
                    type: 'Files'
                };
            }
        }

        // Check each of the registered types.
        var typekey;
        for (typekey in this.get('handlers').types) {
            if (!this.get('handlers').types.hasOwnProperty(typekey)) {
                continue;
            }

            // Check each of the different identifiers for this type.
            var dttypes = this.get('handlers').types[typekey].datatransfertypes,
                thistype;
            for (thistype in dttypes) {
                if (!dttypes.hasOwnProperty(thistype)) {
                    continue;
                }
                if (this.types_includes(e, dttypes[thistype])) {
                    return {
                        realtype: dttypes[thistype],
                        addmessage:     this.get('handlers').types[typekey].addmessage,
                        namemessage:    this.get('handlers').types[typekey].namemessage,
                        handlermessage: this.get('handlers').types[typekey].handlermessage,
                        type:           this.get('handlers').types[typekey].identifier,
                        handlers:       this.get('handlers').types[typekey].handlers
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
     * @method hideDropTarget
     */
    hideDropTarget: function() {
        if (this.currentsection) {
            //this.currentsection.getMask().hide();
        }
    },

    /**
     * Show the preview element for the specified section and type.
     *
     * @method showDropTarget
     * @param {Node} section The section being targetted.
     * @param {String} type The type of file being uploaded.
     */
    showDropTarget: function(section, type) {
        this.hideDropTarget();

        // Show the preview for the current section.
        if (section) {
            this.currentsection = section;
            var mask = section.getMask();
            mask.one('.mask-content').set('innerHTML', type.addmessage);
            mask.show();
        }

    },

    /**
     * Handle the case where a file is dragged over the course.
     *
     * @method dragenter
     * @param {EventFacade} e
     */
    dragenter: function(e) {
        var type = this.check_drag(e),
            section = e.currentTarget.ancestor(SELECTORS.section_types, true);

        if (!type) {
            return;
        }

        if (!section) {
            return;
        }

        if (section === this.lastSection) {
            return;
        }
        this.lastSection = section;

        this.showDropTarget(section, type);
        if (section.one(SELECTORS.preview_element)) {
            this.entercount = 1;
            return;
        } else {
            // Add the preview to the current section.
            this.add_preview_to_section(section);

            this.entercount++;
            if (this.entercount > 2) {
                this.entercount = 2;
                return;
            }
        }

        return;
    },

    /**
     * Handle the case where the drag operation leaves the current event area.
     *
     * @method dragenter
     * @param {EventFacade} e
     */
    dragleave: function(e) {
        // Everything else must be file specific.
        if (!this.check_drag(e)) {
            return;
        }
        var section = e.currentTarget.ancestor(SELECTORS.section_types, true);
        if (this.lastSection !== section) {
        }

        //section.getMask().hide();

        this.entercount--;
        if (this.entercount === 0) {
            return;
        }

        this.entercount = 0;
        this.currentsection = null;

        // Always hide the element to begin.
        this.hideDropTarget();

        return;
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

        this.hideDropTarget();

        if (!type) {
            return false;
        }

        if (!section) {
            return false;
        }

        var files,
            contents,
            index;

        // Process the file or the included data.
        if (type.type === 'Files') {
            files = e._event.dataTransfer.files;
            for (index in files) {
                if (!files.hasOwnProperty(index)) {
                    continue;
                }
                // Bah - fix TODO fix this properly
                if (index === 'length') {
                    continue;
                }
                this.handle_file(files[index], section);
            }
        } else {
            contents = e._event.dataTransfer.getData(type.realtype);
            if (contents) {
                this.handle_item(type, contents, section);
            }
        }
    },

    /**
     * Handle upload and creation of a new item.
     *
     * @method handle_item
     * @param {Object} type the details of the type of content
     * @param {Object} contents the contents to be uploaded
     * @param {Object} section the DOM element for the section being uploaded to
     * @param {Integer} sectionnumber the number of the section being uploaded to
     * @return void
     * @TODO rewrite
     */
    handle_item: function(type, contents, section) {
        if (type.get('handlers').length === 0) {
            // Nothing to handle this - should not have got here
            return;
        }

        // Rewrite me
        if (type.get('handlers').length === 1 && type.get('handlers')[0].noname) {
            // Only one handler and it doesn't need a name (i.e. a label).
            this.upload_item('', type.type, contents, section, sectionnumber, type.get('handlers')[0].module);
            this.check_upload_queue();
            return;
        }

        if (this.uploaddialog) {
            var details = {
                isfile: false,
                type: type,
                contents: contents,
                section: section
            };
            return this.uploadqueue.push(details);
        }

        // FIXME WTF
        this.uploaddialog = true;

        var timestamp = new Date().getTime();
        var uploadid = Math.round(Math.random()*100000)+'-'+timestamp;
        var nameid = 'dndupload_handler_name'+uploadid;
        var content = '';
        if (type.get('handlers').length > 1) {
            content += '<p>'+type.handlermessage+'</p>';
            content += '<div id="dndupload_handlers'+uploadid+'">';
            var sel = type.get('handlers')[0].module;
            for (var i=0; i<type.get('handlers').length; i++) {
                var id = 'dndupload_handler'+uploadid+type.get('handlers')[i].module;
                var checked = (type.get('handlers')[i].module == sel) ? 'checked="checked" ' : '';
                content += '<input type="radio" name="handler" value="'+i+'" id="'+id+'" '+checked+'/>';
                content += ' <label for="'+id+'">';
                content += type.get('handlers')[i].message;
                content += '</label><br/>';
            }
            content += '</div>';
        }
        var disabled = (type.get('handlers')[0].noname) ? ' disabled = "disabled" ' : '';
        content += '<label for="'+nameid+'">'+type.namemessage+'</label>';
        content += ' <input type="text" id="'+nameid+'" value="" '+disabled+' />';

        var self = this;
        var panel = new M.core.dialogue({
            bodyContent: content,
            width: '350px',
            modal: true,
            visible: true,
            render: true,
            align: {
                node: null,
                points: [Y.WidgetPositionAlign.CC, Y.WidgetPositionAlign.CC]
            }
        });

        // When the panel is hidden - destroy it and then check for other pending uploads
        panel.after("visibleChange", function(e) {
            if (!panel.get('visible')) {
                panel.destroy(true);
                self.check_upload_queue();
            }
        });

        var namefield = Y.one('#'+nameid);
        var submit = function(e) {
            e.preventDefault();
            var name = Y.Lang.trim(namefield.get('value'));
            var module = false;
            var noname = false;
            if (type.get('handlers').length > 1) {
                // Find out which module was selected
                var div = Y.one('#dndupload_handlers'+uploadid);
                div.all('input').each(function(input) {
                    if (input.get('checked')) {
                        var idx = input.get('value');
                        module = type.get('handlers')[idx].module;
                        noname = type.get('handlers')[idx].noname;
                    }
                });
                if (!module) {
                    return;
                }
            } else {
                module = type.get('handlers')[0].module;
                noname = type.get('handlers')[0].noname;
            }
            if (name == '' && !noname) {
                return;
            }
            if (noname) {
                name = '';
            }
            panel.hide();
            // Do the upload
            self.upload_item(name, type.type, contents, section, sectionnumber, module);
        };

        // Add the submit/cancel buttons to the bottom of the dialog.
        panel.addButton({
            label: M.util.get_string('upload', 'core'),
            action: submit,
            section: Y.WidgetStdMod.FOOTER,
            name: 'submit',
            isDefault: true
        });
        panel.addButton({
            label: M.util.get_string('cancel', 'core'),
            action: function(e) {
                e.preventDefault();
                panel.hide();
            },
            section: Y.WidgetStdMod.FOOTER
        });
        var submitbutton = panel.getButton('submit').button;
        namefield.on('key', submit, 'enter'); // Submit the form if 'enter' pressed
        namefield.after('keyup', function() {
            if (Y.Lang.trim(namefield.get('value')) == '') {
                submitbutton.disable();
            } else {
                submitbutton.enable();
            }
        });

        // Enable / disable the 'name' box, depending on the handler selected.
        for (i=0; i<type.handlers.length; i++) {
            if (type.get('handlers')[i].noname) {
                Y.one('#dndupload_handler'+uploadid+type.get('handlers')[i].module).on('click', function (e) {
                    namefield.set('disabled', 'disabled');
                    submitbutton.enable();
                });
            } else {
                Y.one('#dndupload_handler'+uploadid+type.get('handlers')[i].module).on('click', function (e) {
                    namefield.removeAttribute('disabled');
                    namefield.focus();
                    if (Y.Lang.trim(namefield.get('value')) == '') {
                        submitbutton.disable();
                    }
                });
            }
        }

        // Focus on the 'name' box
        Y.one('#'+nameid).focus();
    },

    /**
     * Handle the upload of any non-file data-types.
     *
     * This will include:
     * <ul>
     * <li>displaying a dummy resource element;</li>
     * <li>sending data to the server;</li>
     * <li>updating the progress bar; and</li>
     * <li>replacing the dummy element with real data.</li>
     * </ul>
     *
     * @method upload_item
     * @param name the display name for the resource / activity to create
     * @param type the details of the data type found in the drop event
     * @param contents the actual data that was dropped
     * @param section the DOM element representing the selected course section
     * @param sectionnumber the number of the selected course section
     * @param module the module chosen to handle this upload
     * @return void;
     */
    upload_item: function(name, type, contents, section, module) {

        // This would be an ideal place to use the Y.io function
        // however, this does not support data encoded using the
        // FormData object, which is needed to transfer data from
        // the DataTransfer object into an XMLHTTPRequest
        // This can be converted when the YUI issue has been integrated:
        // http://yuilibrary.com/projects/yui3/ticket/2531274
        var xhr = new XMLHttpRequest();
        var self = this;

        // Add the item to the display
        var resel = this.add_resource_element(name, section, module);
        resel.removeClass(CSS.preview_hide);

        // Wait for the AJAX call to complete, then update the
        // dummy element with the returned details
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    var result = JSON.parse(xhr.responseText);
                    if (result) {
                        if (result.error == 0) {
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
                                resel.div.innerHTML += result.commands;
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
                            // TODO - sectionnumber usage
                            self.add_editing(result.elementid, sectionnumber);
                        } else {
                            // Error - remove the dummy element
                            resel.parent.removeChild(resel.li);
                            alert(result.error);
                        }
                    }
                } else {
                    // ICK TODO rewrite using moodle-core-dialogue
                    alert(M.util.get_string('servererror', 'core'));
                }
            }
        };

        // Prepare the data to send
        var formData = new FormData();
        formData.append('contents', contents);
        formData.append('displayname', name);
        formData.append('sesskey', M.cfg.sesskey);
        formData.append('course', this.get('courseid'));
        formData.append('section', sectionnumber);
        formData.append('type', type);
        formData.append('module', module);

        // Send the data
        xhr.open("POST", this.get('uploadURL'), true);
        xhr.send(formData);
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
    handle_file: function(file, section) {
        var handlers = [],
            handler = null,
            current = null,
            filehandlers = this.get('handlers').filehandlers,
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
            return this.upload_file(file, section, handlers[0].module);
        }

        return this.file_handler_dialog(file, section, handlers, extension);
    },

    /**
     * Do the file upload: show the dummy element, use an AJAX call to send the data
     * to the server, update the progress bar for the file, then replace the dummy
     * element with the real information once the AJAX call completes
     *
     * TODO Rewrite
     * @param {Object} file the details of the file, taken from the FileList in the drop event
     * @param {Node} section the DOM element representing the selected course section
     * @param {String} module The modtype of the file being uploaded
     */
    upload_file: function(file, section, module) {

        if (file.size > this.get('maxbytes')) {
            // Check that the file fits within the restraints.
            return new M.core.alert({
                title: M.util.get_string('fileuploaderror', 'core'),
                message: M.util.get_string('filetoolarge', 'core', file.name)
            });
        }

        // Add the file to the display
        var resel = this.add_resource_element(file.name, section, module),
            progress = resel.one('.dndupload-progress-inner'),
            uploader = new Y.File({
                file: file
            });

        // Add progress handling.
        uploader.on('uploadprogress', function(event) {
            progress.setStyle('width', event.percentLoaded + '%');
        });

        // Handle the result too.
        uploader.on('uploadcomplete', this.add_file_to_page, this, resel);

        uploader.startUpload(this.get('uploadURL'), {
            sesskey: M.cfg.sesskey,
            course: this.get('courseid'),
            section: this.get_section_id(section),
            module: module,
            type: 'Files'
        }, 'repo_upload_file');
        return;
    },

    /**
     * Handle addition of the file to the page.
     *
     * @method add_file_to_page
     * @param {EventFacade} event
     */
    add_file_to_page: function(event, resel) {
        try {
            responseobject = Y.JSON.parse(event.data);
            if (responseobject.error) {
                return new M.core.ajaxException(responseobject);
            }
        } catch (error) {
            return new M.core.exception(error);
        }

        // Set the id - this is required for later AJAX interactions.
        resel.set('id', responseobject.elementid);

        // Remove the progress bar
        resel.one('.dndupload-progress-outer').remove();

        if (responseobject.content) {
            var activityinstance = Y.Node.create('<div class="activityinstance" ></div>'),
                wrapper = Y.Node.create('<div />'),
                content = Y.Node.create(responseobject.content);

            wrapper.appendChild(content);
            resel.one('.activityinstance').replace(activityinstance);
            resel.one('.mod-indent')
                .appendChild(wrapper);
        } else {
            // Modify the new element for the actual data.
            resel.one('img').setAttribute('src', responseobject.icon);
            resel.one('.instancename').set('innerHTML', responseobject.name);

            // Various link options.
            var link = resel.one('a');
            link.setAttribute('href', responseobject.link);
            if (responseobject.visible !== "1") {
                link.addClass('dimmed');
            }
            if (responseobject.onclick) {
                link.setAttribute('onclick', responseobject.onclick);
            }

            var groupinfo = resel.one('.groupinglabel');
            if (responseobject.groupingname) {
                groupinfo.set('innerHTML', '(' + responseobject.groupingname + ')');
            } else {
                groupinfo.remove();
            }

            // TODO Check for gecko bug.
        }

        // Add the editing tools.
        var commands = Y.Node.create(responseobject.commands);
        resel.one('.mod-indent').appendChild(commands);
        this.add_editing(resel.get('id'));
    },

    /**
     * Check to see if there are any other dialog boxes to show, now that the current one has
     * been dealt with
     */
    check_upload_queue: function() {
        // FIXME uploaddialog is dirty?
        this.uploaddialog = false;
        if (this.uploadqueue.length === 0) {
            // Nothing in the queue at the moment.
            return;
        }

        var details = this.uploadqueue.shift();
        if (details.isfile) {
            // FIXME Why not handle_file ?
            return this.file_handler_dialog(details.file, details.section, details.handlers, details.extension);
        } else {
            this.handle_item(details.type, details.contents, details.section, details.sectionnumber);
        }
    },


    /**
     * Show a dialog box, allowing the user to choose what to do with the file they are
     * uploading.
     *
     * @method file_handler_dialog
     * @param file the File object being uploaded
     * @param section the DOM element of the section being uploaded to
     * @param handlers the available handlers to choose between
     * @param extension the extension of the file being uploaded
     */
    file_handler_dialog: function(file, section, handlers) {
        if (!this.uploaddialog) {
            this.uploaddialog = new M.core.dialogue({
                visible: false,
                render: false,
                centered: true,
                modal: true,
                draggable: true
            });

            this.uploaddialog.uploadbutton = this.uploaddialog.addButton({
                label: M.util.get_string('upload', 'core'),
                context: this,
                action: 'process_uploaddialog',
                isDefault: true
            });

            this.uploaddialog.closebutton = this.uploaddialog.addButton({
                label: M.util.get_string('cancel', 'core'),
                context: this.uploaddialog,
                action: function() {
                    this.hide();
                }
            });

            this.uploaddialog
                .render()
                .hide();
        }

        // TODO find a better way of doing this.
        this.uploaddialog.file = file;
        this.uploaddialog.section = section;

        var index,
            template = Y.Node.create(
                '<div class="option">' +
                    '<label>' +
                        '<input type="radio" name="handler" />' +
                        '<span class="modicon">' +
                            '<img class="icon" />' +
                        '</span>' +
                        '<span class="typename" />' +
                    '</label>' +
                '</div>'
            ),
            newbody = Y.Node.create('<div><p /></div>'),
            currentoption = null,
            handler = null;

        newbody.one('p').set('innerHTML', M.util.get_string('actionchoice', 'core', file.name));

        // Add all of the handlers.
        for (index = 0; index < handlers.length; index++) {
            handler = handlers[index];
            currentoption = template.cloneNode(true);
            currentoption.one('img').setAttribute('src',
                    M.util.image_url('icon', 'mod_' + handler.module));
            currentoption.one('input').setAttribute('value', handler.module);
            currentoption.one('span.typename').set('innerHTML', handler.message);
            newbody.appendChild(currentoption);
        }

        this.uploaddialog.options = newbody;
        this.uploaddialog.set('bodyContent', newbody);
        this.uploaddialog.show();

        // Focus on the first element to allow easier keyboard navigation.
        newbody.one('input[type=radio]').focus();

        return;
    },

    /**
     * Process the values selected in the upload dialog.
     *
     * @method process_uploaddialog
     * @return void
     */
    process_uploaddialog: function() {
        // Find out which module was selected.
        var module = null;

        // Determine which module was selected.
        this.uploaddialog.get('boundingBox').all('input').each(function(thisoption) {
            if (thisoption.get('checked')) {
                module = thisoption.get('value');
            }
        }, this);

        if (module === null) {
            // No option selected yet - return.
            return;
        }

        // Handle the upload.
        this.uploaddialog.hide();
        this.upload_file(this.uploaddialog.file, this.uploaddialog.section, module);
    },

    /**
     * Add a new dummy item to the list of mods, to be replaced by a real item and link
     * once the AJAX upload call has completed.
     *
     * @method add_resource_element
     * @param {String} name the label to show in the element
     * @param {Node} section the DOM element reperesenting the course section
     * @param {String} modtype The type of activity module
     * @return DOM element containing the new item
     */
    add_resource_element: function(name, section, modtype) {
        var resel = Y.Node.create(
                '<li class="activity">' +
                    '<div class="mod-indent">' +
                        '<div class="activityinstance">' +
                            '<a href="#">' +
                                '<img src="' + M.util.image_url('i/ajaxloader') + '" class="activityicon iconlarge" />' +
                                '<span class="instancename" />' +
                            '</a>' +
                            '<span class="groupinglabel" />' +
                            '<span class="dndupload-progress-outer" >' +
                                '<span class="dndupload-progress-inner">&nbsp;</span>' +
                            '</span>' +
                        '</div>' +
                    '</div>' +
                '</li>'
            ),
            namespan = resel.one('.instancename'),
            modsel = this.get_mods_element(section);

        namespan.set('innerHTML', name);
        resel.addClass('modtype_' + modtype)
             .addClass(modtype);

        // Leave the 'preview element' at the bottom.
        modsel.insert(resel, modsel.one(SELECTORS.preview_element));

        return resel;
    },

    /**
     * Find or create the 'ul' element that contains all of the module instances in this
     * section.
     *
     * @method get_mods_element
     * @param {Node} section the DOM element representing the section
     * @return {Node} The module instance container
     */
    get_mods_element: function(section) {
        // Find the 'ul' containing the list of mods.
        var modsel = section.one(SELECTORS.section_mod);
        if (!modsel) {
            // Create the above 'ul' if it doesn't exist.
            // TODO Rewrite - yuck!!!
            modsel = Y.Node.create( '<ul class="section img-text"/>');
            var contentel = section.get('children').pop();
            var brel = contentel.get('children').pop();
            contentel.insertBefore(modsel, brel);
        }

        return modsel;
    },


    /**
     * Call the AJAX course editing initialisation to add the editing tools
     * to the newly-created resource link
     *
     * @param elementid the id of the DOM element containing the new resource link
     * @param sectionnumber the number of the selected course section
     */
    add_editing: function(elementid) {
        M.course.coursebase.invoke_function('setup_for_resource', '#' + elementid);
    }
}, {
    ATTRS: {

        /**
         * The maximum size of files being uploaded.
         *
         * @attribute maxbytes
         * @type Number|null
         * @default null
         */
        maxbytes: {
            value: null
        },

        /**
         * The ID of the current course.
         *
         * @attribute courseid
         * @writeOnce
         * @type Number|null
         * @default null
         */
        courseid: {
            value: null
        },

        /**
         * The list of handlers which are available for drag-and-drop upload.
         *
         * @attribute handlers
         * @type Array
         * @default []
         */
        handlers: {
            value: []
        },

        /**
         * Whether to show the status the message that drag-and-drop upload is available.
         *
         * @attribute showStatusMessage
         * @type Boolean
         * @default true
         */
        showStatusMessage: {
            value: true
        },

        /**
         * The message to show when drag-and-drop is available.
         *
         * This must be provided in the format:
         * {
         *  identifer: String,
         *  component: String
         * }
         *
         * @attribute statusMessage
         * @type Object
         * @default dndstat, moodle
         */
        statusMessage: {
            value: {
                identifier: 'dndstatus',
                component: 'moodle'
            },
            getter: function(val) {
                return M.util.get_string(val.identifier, val.component);
            }
        },

        /**
         * The endpoint to use for drag-and-drop upload.
         *
         * @attribute uploadURL
         * @writeOnce
         * @type String
         * @default M.cfg.wwwroot + '/course/dndupload.php'
         */
        uploadURL: {
            value: M.cfg.wwwroot + '/course/dndupload.php'
        }
    }
});

Y.Moodle.course.dndupload.init = function(config) {
    return new DNDUPLOAD(config);
};


}, '@VERSION@', {
    "requires": [
        "moodle-course-dndupload-loader",
        "node",
        "event",
        "json",
        "anim",
        "dd",
        "moodle-core-notification",
        "moodle-course-coursebase",
        "selector-css3",
        "file",
        "moodle-core-util-mask"
    ]
});

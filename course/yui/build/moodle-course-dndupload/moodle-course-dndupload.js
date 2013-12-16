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
        couremodule: 'li.activity',
        sections: 'li.section.main',
        section_mod: 'ul.section',
        section_types: 'li.section, li.main',
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
    processQueue: new Y.AsyncQueue(),
    dialogueQueue: new Y.AsyncQueue(),
    currentSection: null,
    enterCount: 0,

    // We delay the dialogues until the end.
    delayDialogues: true,

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
            // Note - we may need to remove this if dynamic section creation is added.
            return;
        }

        // Add the event listeners.
        Y.delegate('dragenter', this.dragenter, Y.config.doc, SELECTORS.sections, this);
        Y.delegate('dragleave', this.dragleave, Y.config.doc, SELECTORS.sections, this);
        Y.delegate('dragover',  this.dragover,  Y.config.doc, SELECTORS.sections, this);
        Y.delegate('drop',      this.drop,      Y.config.doc, SELECTORS.sections, this);

        // Add the status message.
        if (this.get('showStatusMessage')) {
            this.addStatusMessage();
        }
    },

    /**
     * Display a status message to inform users that drag-and-drop upload is available.
     *
     * @method addStatusMessage
     * @chainable
     */
    addStatusMessage: function() {

        return this;
    },

    /**
     * Check if the event includes data of the given type.
     *
     * @method isUploadTypeValid
     * @param {EventFacade} e
     * @param {String} type The data type to check for.
     * @return {Boolean} Whether the data type is found in the event data.
     */
    isUploadTypeValid: function(e, type) {
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

    // TODO rewrite
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
        if (this.isUploadTypeValid(e, 'Files')) {
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
        var types = this.get('handlers').types,
            typekey;
        for (typekey in types) {
            if (!types.hasOwnProperty(typekey)) {
                continue;
            }

            // Check each of the different identifiers for this type.
            var dttypes = types[typekey].datatransfertypes,
                thistype;

            for (thistype in dttypes) {
                if (!dttypes.hasOwnProperty(thistype)) {
                    continue;
                }
                if (this.isUploadTypeValid(e, dttypes[thistype])) {
                    return {
                        realtype: dttypes[thistype],
                        addmessage:     types[typekey].addmessage,
                        namemessage:    types[typekey].namemessage,
                        handlermessage: types[typekey].handlermessage,
                        type:           types[typekey].identifier,
                        handlers:       types[typekey].handlers
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
     * @method checkDrag
     * @param {EventFacade} e
     * @return {String|null} The type of the event, or null if no event found.
     */
    checkDrag: function(e) {
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
     * @chainable
     */
    hideDropTarget: function(section) {
        section = section || this.currentSection;
        if (section) {
            // Hide the preview for the current section.
            section.getMask().hide();
        }

        return this;
    },

    /**
     * Show the preview element for the specified section and type.
     *
     * @method showDropTarget
     * @param {Node} section The section being targetted.
     * @param {String} type The type of file being uploaded.
     * @chainable
     */
    showDropTarget: function(section, type) {
        // Show the preview for the current section.
        var mask = section.getMask();
        mask.one('.mask-content').set('innerHTML', type.addmessage);
        mask.show();

        return this;
    },

    /**
     * Handle the case where a file is dragged over the course.
     *
     * @method dragenter
     * @param {EventFacade} e
     */
    dragenter: function(e) {
        var type = this.checkDrag(e),
            section = e.currentTarget.ancestor(SELECTORS.section_types, true);

        if (!type) {
            return;
        }

        if (!section) {
            return;
        }

        if (section !== this.currentSection || this.enterCount === 0) {
            // The section has changed - we've just entered for the first time.
            this.currentSection = section;
            this.enterCount = 1;
            this.showDropTarget(section, type);
        } else {
            this.enterCount = 2;
        }
    },

    /**
     * Handle the case where the drag operation leaves the current event area.
     *
     * @method dragenter
     * @param {EventFacade} e
     */
    dragleave: function(e) {
        // Everything else must be file specific.
        if (!this.checkDrag(e)) {
            return;
        }

        // TODO replace with Y.Moodle.course.util.section.get() ???
        var section = e.currentTarget.ancestor(SELECTORS.section_types, true);
        if (!section) {
            return;
        }

        if (section !== this.currentSection) {
            this.hideDropTarget(section);
            this.enterCount = 1;
            return;
        }

        if (this.enterCount <= 1) {
            this.enterCount = 0;
            this.hideDropTarget(section);
        } else {
            this.enterCount = 1;
        }
    },

    /**
     * Handle a dragover event: just prevent the browser default (necessary
     * to allow drag and drop handling to work).
     *
     * @method dragover
     * @param {EventFacade} e
     */
    dragover: function(e) {
        this.checkDrag(e);
    },

    /**
     * Handle a drop event: hide the 'add here' message, check the attached
     * data type and start the upload process.
     *
     * @method drop
     * @param {EventFacade} e
     */
    drop: function(e) {
        var type = this.checkDrag(e),
            section = this.get_section(e.currentTarget);

        // Clear the section tracking data.
        this.enterCount = 0;
        this.hideDropTarget(section);

        if (!type) {
            this.hideDropTarget();
            return false;
        }

        if (!section) {
            this.hideDropTarget();
            return false;
        }

        var files,
            contents,
            index;

        // Process the file or the included data.
        if (type.type === 'Files') {
            files = e._event.dataTransfer.files;
            for (index = 0; index < files.length; index++) {
                if (!files.hasOwnProperty(index)) {
                    continue;
                }
                this.processQueue.add({
                    fn: this.handleFile,
                    context: this,
                    args: [
                        files[index],
                        section
                    ]
                });
            }
        } else {
            contents = e._event.dataTransfer.getData(type.realtype);
            if (contents) {
                this.processQueue.add({
                    fn: this.handle_item,
                    context: this,
                    args: [
                        type,
                        contents,
                        section
                    ]
                });
            }
        }

        // Kick off the dialogueQueue at the end of the processQueue's first run.
        this.processQueue.add({
            fn: this.dialogueQueue.run,
            context: this.dialogueQueue
        });

        // Run the process queue.
        this.processQueue.run();
    },

    /**
     * Find the registered handler for the given file type. If there is more than one, ask the
     * user which one to use. Then upload the file to the server
     *
     * @method handleFile
     * @param {Object} file the details of the file, taken from the FileList in the drop event
     * @param {Node} section the DOM element representing the selected course section
     * @param {Node} placeholder the DOM element representing the progress bar placeholder
     */
    handleFile: function(file, section) {
        var handlers = [],
            handler = null,
            current = null,
            filehandlers = this.get('handlers').filehandlers,
            extension = '',
            dotpos = file.name.lastIndexOf('.');

        if (dotpos !== -1) {
            // Attempt to determine the file extension.
            extension = file.name.substr(dotpos+1, file.name.length).toLowerCase();
        }

        for (handler in filehandlers) {
            if (!filehandlers.hasOwnProperty(handler)) {
                continue;
            }
            current = filehandlers[handler];

            // Add this handler to the list if it is an exact match, or a wildcard.
            if (current.extension === '*' || current.extension === extension) {
                handlers.push(current);
            }
        }

        if (handlers.length === 0) {
            // None of the file handlers were suitable for this file.
            this.hideDropTarget();
            return;
        }

        if (handlers.length === 1) {
            // Only one handler - just upload using this handler.
            this.hideDropTarget();
            return this.uploadFile(file, section, handlers[0].module);
        }

        this.dialogueQueue.add({
            fn: this.queryFileType,
            context: this,
            args: [
                file,
                section,
                handlers
            ]
        });

        return this;
    },

    /**
     * Perform the file upload:
     * <dl>
     *  <dt>show the dummy element;</dt>
     *  <dt> use an AJAX call to send the data to the server;</dt>
     *  <dt> update the progress bar for the file; then</dt>
     *  <dt> replace the dummy element with the real information once the AJAX call completes.</dt>
     * </dl>
     *
     * @param {Object} file the details of the file, taken from the FileList in the drop event
     * @param {Node} section the DOM element representing the selected course section
     * @param {String} module The modtype of the file being uploaded
     */
    uploadFile: function(file, section, module) {
        // Ensure that the drop target is hidden.
        this.hideDropTarget(section);

        // Process the next item in the queue.
        if (!this.processQueue.isRunning()) {
            this.processQueue.run();
        }

        // Check that the file fits within the constraints.
        if (file.size > this.get('maxbytes')) {
            return Y.use('moodle-core-notification-alert', function() {
                return new M.core.alert({
                    title: M.util.get_string('fileuploaderror', 'core'),
                    message: M.util.get_string('filetoolarge', 'core', file.name)
                });
            });
        }

        // Add the progress placeholder to the display and calculate its' relative position.
        var placeholder = this.addProgressBar(file.name, section),
            progress = placeholder.one('.dndupload-progress-inner'),
            current = Y.one(placeholder),
            position = 0;

        do {
            position++;
            current = current.previous(SELECTORS.coursemodule);
        } while (current);

        // The upload options we'll use in a moment.
        var uploadOptions = {
            sesskey: M.cfg.sesskey,
            course: this.get('courseid'),
            section: this.get_section_id(section),
            module: module,
            type: 'Files',
            position: position
        };

        // Create the uploader mechanism.
        var uploader = new Y.File({
            file: file
        });

        // Add progress handling.
        uploader.on('uploadprogress', function(e) {
            progress.setStyle('width', e.percentLoaded + '%');
        });

        // Handle the result too.
        uploader.on('uploadcomplete', this.handleUploadResponse, this, placeholder);

        // Actually upload the file.
        uploader.startUpload(this.get('uploadURL'), uploadOptions, 'repo_upload_file');

        return uploader;
    },

    /**
     * Handle addition of the file to the page.
     *
     * @method handleUploadResponse
     * @param {EventFacade} event
     */
    handleUploadResponse: function(event, placeholder) {
        try {
            var data = event.data || event.response;
            responseobject = Y.JSON.parse(data);
            if (responseobject.error) {
                // Remove the placeholder before displayng the error.
                placeholder.remove(true);

                return Y.use('moodle-core-notification-ajaxexception', function() {
                    new M.core.ajaxException(responseobject);
                });
            }
        } catch (error) {
            // Remove the placeholder before displayng the error.
            placeholder.remove(true);

            return Y.use('moodle-core-notification-exception', function() {
                new M.core.exception(error);
            });
        }

        // Replace the place holder with the new content.
        var courseModule = Y.Node.create(responseobject.fullcontent);
        placeholder.replace(courseModule);

        // Ensure that we ajaxify the content.
        this.setupJSForCourseModule(responseobject.cmid);

        return;
    },

    /**
     */
    queryFileType: function(file, section, handlers) {
        // Pause the current queue.
        this.dialogueQueue.pause();

        var dialogue = this.getDialogue(),
            bodyContent,
            config;

        // Set up the configuration used to build the template.
        config = {
            filemessage: M.util.get_string('filemessage', 'course', file),
            items: []
        };

        Y.Array.each(handlers, function(handler) {
            config.items.push({
                modname: handler.module,
                icon: M.util.image_url('icon', 'mod_' + handler.module),
                message: handler.message
            });
        });

        // Build the template and add it to the dialogue.
        bodyContent = this.getDialogueTemplate(config);
        dialogue.set('bodyContent', bodyContent);

        var listener = dialogue.getButton('upload').on('click', function() {
            var selection = dialogue.bodyNode.one('input[name="handler"]:checked');
            if (selection) {
                this.processQueue.add({
                    fn: this.uploadFile,
                    context: this,
                    args: [
                        file,
                        section,
                        selection.get('value')
                    ]
                });

                // No need to restart the queue - that happens when the dialogue is closed.
                dialogue.hide();
            } else {
            }
        }, this);
        dialogue.eventListeners.push(listener);


        dialogue.show();
    },

    getDialogue: function() {
        if (!this.uploadDialog) {
            this.uploadDialog = new M.core.dialogue({
                visible: false,
                centered: true,
                modal: true,
                draggable: true
            });

            this.uploadDialog.addButton({
                name: 'upload',
                label: M.util.get_string('upload', 'core'),
                isDefault: true
            });

            this.uploadDialog.addButton({
                name: 'cancel',
                label: M.util.get_string('cancel', 'core'),
                action: function() {
                    this.hide();
                }
            });

            // When the dialogue resolves, restart the queue.
            this.uploadDialog.on('visibleChange', function(e) {
                if (e.prevVal && !e.newVal) {
                    new Y.EventHandle(this.uploadDialog.eventListeners).detach();
                    this.uploadDialog.eventListeners = null;
                    this.processQueue.run();
                    this.dialogueQueue.run();
                }
            }, this);

        }
        this.uploadDialog.eventListeners = [];
        return this.uploadDialog;
    },

    getDialogueTemplate: function(config) {
        if (!this.bodyContent) {
            this.bodyContent = Y.Handlebars.compile(
                    "<div class='option'>" +
                    "{{#items}}" +
                    "<label>" +
                    "<input type='radio' name='handler' value={{modname}}>" +
                    "<span class='modicon'><img class='icon' src={{icon}}></span>" +
                    "<span class='typename'>{{message}}</span>" +
                    "</label>" +
                    "{{/items}}" +
                    "</div>"
            );
        }

        return this.bodyContent(config);
    },

    /**
     * Add a new dummy item to the list of mods, to be replaced by a real item and link
     * once the AJAX upload call has completed.
     *
     * @method addProgressBar
     * @param {String} name the label to show in the element
     * @param {Node} section the DOM element reperesenting the course section
     * @return {Node} element containing the new item
     */
    addProgressBar: function(name, section) {
        var courseModule = Y.Node.create(
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
            namespan = courseModule.one('.instancename'),
            sectionModuleList = this.getSectionModuleList(section);

        namespan.set('innerHTML', name);

        // Leave the 'preview element' at the bottom.
        sectionModuleList.appendChild(courseModule);

        return courseModule;
    },

    /**
     * Find the element that contains all of the course module instances in this section.
     *
     * @method getSectionModuleList
     * @param {Node} section the DOM element representing the section
     * @return {Node} The module instance container
     */
    getSectionModuleList: function(section) {
        // Find the 'ul' containing the list of mods.
        var sectionModuleList = section.one(SELECTORS.section_mod);
        return sectionModuleList;
    },


    /**
     * Call the AJAX course editing initialisation to add the editing tools
     * to the newly-created resource link
     *
     * @param {Number} cmid the course module ID
     */
    setupJSForCourseModule: function(cmid) {
        M.course.coursebase.invoke_function('setup_for_resource', '#module-' + cmid);
        var node = Y.one('#module-' + cmid);
        if (node && M.core.actionmenu && M.core.actionmenu.newDOMNode) {
            M.core.actionmenu.newDOMNode(node);
        }
    },

    /**
     * Handle upload and creation of a new item.
     *
     * TODO Move handle_item and uploadItem to a new submodule which is only loaded if
     * and when used? Or not worth the overhead...
     *
     * @method handle_item
     * @param {Object} type the details of the type of content
     * @param {Object} contents the contents to be uploaded
     * @param {Object} section the DOM element for the section being uploaded to
     * @return void
     * @TODO rewrite
     */
    handle_item: function(type, contents, section) {
        if (type.handlers.length === 0) {
            // Nothing to handle this - should not have got here
            return;
        }

        // Add the progress placeholder to the display.
        var placeholder = this.addProgressBar('', section);


        // TODO Rewrite me
        if (type.handlers.length === 1 && type.handlers[0].noname) {
            // Only one handler and it doesn't need a name (i.e. a label).
            this.hideDropTarget();
            this.uploadItem('', type.type, contents, section, type.handlers[0].module, placeholder);
            return;
        }

        // FIXME WTF
        this.uploaddialog = true;

        var timestamp = new Date().getTime();
        var uploadid = Math.round(Math.random()*100000)+'-'+timestamp;
        var nameid = 'dndupload_handler_name'+uploadid;
        var content = '';
        if (type.handlers.length > 1) {
            content += '<p>'+type.handlermessage+'</p>';
            content += '<div id="dndupload_handlers'+uploadid+'">';
            var sel = type.handlers[0].module;
            for (var i=0; i<type.handlers.length; i++) {
                var id = 'dndupload_handler'+uploadid+type.handlers[i].module;
                var checked = (type.handlers[i].module === sel) ? 'checked="checked" ' : '';
                content += '<input type="radio" name="handler" value="'+i+'" id="'+id+'" '+checked+'/>';
                content += ' <label for="'+id+'">';
                content += type.handlers[i].message;
                content += '</label><br/>';
            }
            content += '</div>';
        }
        var disabled = (type.handlers[0].noname) ? ' disabled = "disabled" ' : '';
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
        panel.after("visibleChange", function() {
            this.hideDropTarget(section);
            if (!panel.get('visible')) {
                panel.destroy(true);
            }
        }, this);

        var namefield = Y.one('#'+nameid);
        var submit = function(e) {
            e.preventDefault();
            var name = Y.Lang.trim(namefield.get('value'));
            var module = false;
            var noname = false;
            if (type.handlers.length > 1) {
                // Find out which module was selected
                var div = Y.one('#dndupload_handlers'+uploadid);
                div.all('input').each(function(input) {
                    if (input.get('checked')) {
                        var idx = input.get('value');
                        module = type.handlers[idx].module;
                        noname = type.handlers[idx].noname;
                    }
                });
                if (!module) {
                    return;
                }
            } else {
                module = type.handlers[0].module;
                noname = type.handlers[0].noname;
            }
            if (name === '' && !noname) {
                return;
            }
            if (noname) {
                name = '';
            }
            panel.hide();
            // Do the upload
            self.uploadItem(name, type.type, contents, section, module, placeholder);
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
                // TODO check context
                this.processQueue.run();
            },
            section: Y.WidgetStdMod.FOOTER
        });
        var submitbutton = panel.getButton('submit').button;
        namefield.on('key', submit, 'enter'); // Submit the form if 'enter' pressed
        namefield.after('keyup', function() {
            if (Y.Lang.trim(namefield.get('value')) === '') {
                submitbutton.disable();
            } else {
                submitbutton.enable();
            }
        });

        // Enable / disable the 'name' box, depending on the handler selected.
        var index;
        for (index = 0; index < type.handlers.length; index++) {
            if (type.handlers[index].noname) {
                Y.one('#dndupload_handler'+uploadid+type.handlers[index].module).on('click', function () {
                    namefield.set('disabled', 'disabled');
                    submitbutton.enable();
                });
            } else {
                Y.one('#dndupload_handler'+uploadid+type.handlers[index].module).on('click', function () {
                    namefield.removeAttribute('disabled');
                    namefield.focus();
                    if (Y.Lang.trim(namefield.get('value')) === '') {
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
     * @method uploadItem
     * @param name the display name for the resource / activity to create
     * @param type the details of the data type found in the drop event
     * @param contents the actual data that was dropped
     * @param section the DOM element representing the selected course section
     * @param module the module chosen to handle this upload
     * @return void;
     */
    uploadItem: function(name, type, contents, section, module, placeholder) {
        // Ensure that the drop target is hidden.
        this.hideDropTarget(section);

        if (!this.processQueue.isRunning()) {
            this.processQueue.run();
        }

        // Add the progress placeholder to the display.
        if (!placeholder) {
            placeholder = this.addProgressBar(file.name, section);
        }
        var progress = placeholder.one('.dndupload-progress-inner');

        // The upload options we'll use in a moment.
        var uploadOptions = {
            data: {
                sesskey: M.cfg.sesskey,
                course: this.get('courseid'),
                // TODO change to use moodle-course-utils-section.getId()
                section: this.get_section_id(section),
                module: module,
                type: type,
                contents: contents,
                displayname: name
            },
            on: {
                complete: function(tid, response) {
                    this.handleUploadResponse(response, placeholder);
                },
                progress: function(tid, e) {
                    progress.setStyle('width', e.percentLoaded + '%');
                }
            },
            context: this
        };

        Y.io(this.get('uploadURL'), uploadOptions);
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
        "moodle-core-util-mask",
        "promise",
        "async-queue",
        "handlebars"
    ]
});

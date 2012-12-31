YUI.add('moodle-course-dndupload', function(Y, NAME) {
    /**
     * Provides the moodle course drag and drop upload class
     *
     * @module course-dndupload
     */

    /**
     * Provides the Course drag and drop upload functionality
     *
     * @class course-dndupload
     * @constructor
     */
    var DNDUPLOAD = function() {
        DNDUPLOAD.superclass.constructor.apply(this, arguments);
    },
    CSS = {
        // TODO This needs to move to coursebase and be overridable somehow
        sectiontype : 'li',
        sectionclasses : [
            'section',
            'main'
        ]
    };

    Y.extend(DNDUPLOAD, Y.Base, {
        /**
         * The section selector string used to identify and locate sections
         *
         * @private
         * @property sectionselector
         * @type string
         * @default null
         */
        sectionselector : null,

        /**
         * A reference to the status node.
         * This node is used initially to inform users that Drag and Drop upload is available
         * to them.
         *
         * @private
         * @property string
         * @type Node
         * @default null
         */
        statusnode : null,

        /**
         * Nasty hack to distinguish between dragenter(first entry),
         * dragenter+dragleave(moving between child elements) and dragleave (leaving element)
         *
         * @private
         * @property entercount
         * @type Integer
         * @default 0
         */
        entercount: 0,

        /**
         * A reference to the page body since we use this a lot
         *
         * @private
         * @property body
         * @type Node
         * @default null
         */
        body: null,

        /**
         * A reference to the preview element
         *
         * @private
         * @property preview_element
         * @type Node
         * @default null
         */
        preview_element: null,

        /**
         * A reference to the preview element's span which contains the text we update
         *
         * @private
         * @property preview_element_span
         * @type Node
         * @default null
         */
        preview_element_span: null,

        initializer : function() {
            document.dnd = this;
            var sectiontest;

            this.body = Y.one('body');

            if (!this.browser_supported()) {
                // Browser does not support the required functionality
                return;
            }

            // Check whether there are any sections available
            this.sectionselector = M.course.format.get_sectionnode() + '.' + M.course.format.get_sectionclass();
            sectiontest = Y.one(this.sectionselector);
            if (!sectiontest) {
                return;
            }

            // We have at least one section available, setup listeners
            this.body.delegate('dragenter', this.drag_enter, this.sectionselector, this);
            this.body.delegate('dragleave', this.drag_leave, this.sectionselector, this);
            this.body.delegate('dragover',  this.drag_over,  this.sectionselector, this);
            this.body.delegate('drop',      this.drop,       this.sectionselector, this);

            // Add the information message if necessary
            if (this.get('showstatus')) {
                this.add_status_message();
            }
        },

        /**
         * Check whether the current browser has the required functionality.
         *
         * @method browser_supported
         * @return {boolean} Whether the browser is supported or not
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
         * Add an element to tell the user that drag and drop upload is available (or to
         * explain why it is not available).
         *
         * @method add_status_message
         * @return {undefined} Nothing is returned
         */
        add_status_message: function() {
            var contentdiv,
            messagetitle,
            pagecontents,
            fadeanim;

            // Ensure that we can actually add the status message
            pagecontents = Y.one('#page');
            if (pagecontents) {
                return false;
            }

            // Create the status message
            this.statusnode = Y.Node.create('<div class="dndupload_status_message" />')
                .setStyle('opacity', '0.0');

            // Set the initial status message
            messagetitle = 'dndworking';
            if (this.get('handlefile')) {
                messagetitle += 'file';
            }
            if (this.get('handletext')) {
                messagetitle += 'text';
            }
            if (this.get('handlelink')) {
                messagetitle += 'link';
            }

            this.statusnode.setContent(M.util.get_string(messagetitle, 'moodle'));

            // Add the status message to the page
            pagecontents.insertBefore(this.statusnode, pagecontents.firstChild);

            // Setup the animation to fade from 0.0 opacity to 1.0 opacity
            fadeanim = new Y.Anim({
                node: this.statusnode,
                from: {
                    opacity: 0.0,
                    top: '-30px'
                },
                to: {
                    opacity: 1.0,
                    top: '0px'
                },
                duration: 0.5
            });

            // We need the animation to reverse after a short period
            fadeanim.once('end', function(e) {
                this.set('reverse', 1);
                Y.later(3000, this, 'run', null, false);
            });

            // Now it's set up, run the animation
            fadeanim.run();
        },

        /**
         * Handle a dragenter event: add a suitable 'add here' message when a drag event
         * occurs, containing a registered data type.
         *
         * @method drag_enter
         * @param {Event} e The event defining the dragenter
         * @return {boolean} Always returns false to ensure that further event processing
         * does not occur
         */
        drag_enter: function(e) {
            var type, section;

            e.preventDefault();

            type = this.check_drag(e);
            if (!type) {
                // Return early if the drag didn't match
                return false;
            }

            // Get the section value for the current section
            section = M.course.coursebase.get_section(e.currentTarget);
            if (!section) {
                return false;
            }

            // TODO What does this bit do!?
            if (this.currentsection && this.currentsection !== section) {
                this.currentsection = section;
                this.entercount = 1;
            } else {
                this.entercount++;
                if (this.entercount > 2) {
                    this.entercount = 2;
                    return false;
                }
            }

            // TODO what does this do?
            this.show_preview_element(section, type);

            return false;
        },

        /**
         * Handle a dragleave event: remove the 'add here' message (if present)
         *
         * @method drag_leave
         * @param {event} e event data
         */
        drag_leave: function(e) {
            // Prevent any further actions
            e.preventDefault();

            // This event type does not support drag and drop upload
            if (!this.check_drag(e)) {
                return;
            }

            this.entercount--;
            if (this.entercount == 1) {
                return;
            }
            this.entercount = 0;


            this.currentsection = null;

            // Stop previewing the element now
            this.hide_preview_element();

            return;
        },

        /**
         * Handle a dragover event: just prevent the browser default (necessary to allow drag
         * and drop handling to work)
         *
         * @method drag_over
         * @param {Event} e event data
         */
        drag_over: function(e) {
            this.check_drag(e);
            return false;
        },

        /**
         * Handle a drop event: hide the 'add here' message, check the attached data type and
         * start the upload process
         *
         * @method drop
         * @param {event} e event data
         */
        drop: function(e) {
            var type,
            files,
            i,
            contents;
            type = this.check_drag(e);
            if (!type) {
                return false;
            }

            this.hide_preview_element();

            // Work out the number of the section we are on (from its id)
            // TODO fix this
            var section = M.course.coursebase.get_section(e.currentTarget);
            var sectionnumber = M.course.coursebase.get_section_number(section);

            // Process the file or the included data
            if (type.type === 'Files') {
                files = e._event.dataTransfer.files;
                for (i = 0; i < files.length; i++) {
                    f = files[i];
                    this.handle_file(f, section, sectionnumber);
                }
            } else {
                contents = e._event.dataTransfer.getData(type.realtype);
                if (contents) {
                    this.handle_item(type, contents, section, sectionnumber);
                }
            }

            return false;
        },

        /**
         * Check if the given event includes data of the given type.
         *
         * @method types_includes
         * @param {Event} e the event details
         * @param {String} type the data type to check for
         * @return {boolean} Whether the data type was found in the event data
         */
        types_includes: function(e, type) {
            var i,
            types = e._event.dataTransfer.types;
            for (i = 0; i < types.length; i++) {
                if (types[i] === type) {
                    return true;
                }
            }
            return false;
        },

        /**
         * Look through the event data, checking it against the registered data types
         * (in order of priority) and return details of the first matching data type.
         *
         * The type is an object containing:
         *     realtype: the type as given by the browser
         *     addmessage: the message to show to the user during dragging
         *     namemessage: the message for requesting a name for the resource from the user
         *     type: the identifier of the type (may match several 'realtype's)
         *
         * @method drag_type
         * @param {Event} e the event details
         * @return {boolean|Object} If no matching type was found return false, otherwise
         * an object containing the details of the registered upload type.
         */
        drag_type: function(e) {
            var types, i, dttypes, j;
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
                        return false; // No available file handlers - ignore this drag.
                    }
                    return {
                        realtype: 'Files',
                        addmessage: M.util.get_string('addfilehere', 'moodle'),
                        namemessage: null, // Should not be asked for anyway
                        type: 'Files'
                    };
                }
            }

            // Check each of the registered types.
            types = this.get('handlers').types;
            for (i = 0; i < types.length; i++) {
                // Check each of the different identifiers for this type
                dttypes = types[i].datatransfertypes;
                for (j = 0; j < dttypes.length; j++) {
                    if (this.types_includes(e, dttypes[j])) {
                        return {
                            realtype: dttypes[j],
                            addmessage: types[i].addmessage,
                            namemessage: types[i].namemessage,
                            type: types[i].identifier,
                            handlers: types[i].handlers
                        };
                    }
                }
            }
            // No types we can handle
            return false;
        },

        /**
         * Check the content of the drag/drop includes a type we can handle.
         * If so, notify the browser that we want to handle it
         *
         * @method check_drag
         * @param {Event} e The event handler to check
         * @return {String|boolean} type of the event or false
         */
        check_drag: function(e) {
            var type = this.drag_type(e);
            if (type) {
                // Notify browser that we will handle this drag/drop
                e.stopPropagation();
                e.preventDefault();
            }
            return type;
        },

        /**
         * Hide the dndupload-preview element if it has been created
         *
         * @method hide_preview_element
         */
        hide_preview_element: function() {
            if (!this.preview_element) {
                return false;
            }
            this.preview_element.addClass('dndupload-hidden');
        },

        /**
         * Unhide the preview element for the given section and set it to display the
         * correct message.
         *
         * If a preview element does not yet exist, then one is automatically created.
         *
         * @method show_preview_element
         * @param section the YUI node representing the selected course section
         * @param type the details of the data type detected in the drag (including the message to display)
         */
        show_preview_element: function(section, type) {
            var modulelist;
            this.hide_preview_element();

            if (!this.preview_element) {
                // Create the preview element once
                this.preview_element = Y.Node.create('<li class="dndupload-preview dndupload-hidden">' + 
                            '<div class="mod-indent">' + 
                                '<img src="' + M.util.image_url('t/addfile') + '" class="icon" /> ' +
                                '<span class="instancename">' + M.util.get_string('addfilehere', 'moodle') + '</span>' +
                            '</div>' +
                        '</li>');
                this.preview_element_span = this.preview_element.one('span');
            }

            // Set the new span content message
            this.preview_element_span.setContent(type.addmessage);
            
            // Unhide the element
            this.preview_element.removeClass('dndupload-hidden');

            // Ensure that it is visible within the correct section
            modulelist = M.course.coursebase.get_module_list(section);
            modulelist.appendChild(this.preview_element);
        },

        /**
         * Find the registered handler for the given file type. If there is more than one,
         * ask the user which one to use. Then upload the file to the server.
         *
         * @method handle_file
         * @param {Object} file the details of the file, taken from the FileList in the drop event
         * @param {Node} section the Node representing the selected course section
         * @param {integer} sectionnumber the number of the selected course section
         */
        handle_file: function(file, section, sectionnumber) {
            var handlers = [],
            filehandlers = this.get('handlers').filehandlers,
            extension = '',
            dotpos = file.name.lastIndexOf('.'),
            i;

            if (dotpos !== -1) {
                // Determine the file extension
                extension = file.name.substr(dotpos + 1, file.name.length);
            }

            for (i = 0; i < filehandlers.length; i++) {
                // Build a list of appropriate handlers for this file type
                if (filehandlers[i].extension === '*' || filehandlers[i].extension === extension) {
                    handlers.push(filehandlers[i]);
                }
            }

            if (handlers.length === 0) {
                // No associated file handlers present so exit here.
                return;
            }

            if (handlers.length === 1) {
                // Only one file handler here - use it.
                this.upload_file(file, section, sectionnumber, handlers[0].module);
                return;
            }

            // There is more than one handler available, offer the user the options.
            this.file_handler_dialog(handlers, extension, file, section, sectionnumber);
        },

        /**
         * Perform a file upload for the specified file. This consists of:
         *
         * - showing the dummy element;
         * - using an AJAX call to send the data to the server;
         * - updating the progress bar for the file; then
         * - replacing the dummy element with the real information once the AJAX call completes.
         *
         * @method upload_file
         * @param {Object} file the details of the file, taken from the FileList in the drop event
         * @param {Node} section the Node representing the selected course section
         * @param {integer} sectionnumber the number of the selected course section
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
                // TODO switch to M.core.exception
                alert("'"+file.name+"' "+M.util.get_string('filetoolarge', 'moodle'));
                return;
            }

            // Add the file to the display
            //var resel = this.add_resource_element(file.name, section);
            
            var formData = new FormData();
            formData.append('repo_upload_file', file);
            formData.append('sesskey', M.cfg.sesskey);
            formData.append('course', this.get('courseid'));
            formData.append('section', sectionnumber);
            formData.append('module', module);
            formData.append('type', 'Files');

            Y.log(formData);

            eformData = {
                'repo_upload_file': file,
                'sesskey': M.cfg.sesskey,
                'course': this.get('courseid'),
                'section': sectionnumber,
                'module': module,
                'type': 'Files'
            };
            Y.log(eformData);

            config = {
                method: 'POST',
                data: eformData,
                on: {
                    progress: function(e) {
                        Y.log("Got some progress");
                        if (e.lengthComputable) {
                            var percentage = Math.round((e.loaded * 100) / e.total);
                            //resel.progress.style.width = percentage + '%';
                            Y.log("Now at " + percentage + '%');
                        }
                    },
                    complete: function(e) {
                        Y.log("We have completion");
                    }
                },
                context: this
            };
            Y.io(this.get('uri'), config);
            return;

            // Wait for the AJAX call to complete, then update the
            // dummy element with the returned details
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var result = JSON.parse(xhr.responseText);
                        if (result) {
                            if (result.error === 0) {
                                // All OK - update the dummy element
                                resel.icon.src = result.icon;
                                resel.a.href = result.link;
                                resel.namespan.innerHTML = result.name;

                                if (result.groupingname) {
                                    resel.groupingspan.innerHTML = '(' + result.groupingname + ')';
                                } else {
                                    resel.div.removeChild(resel.groupingspan);
                                }

                                resel.div.removeChild(resel.progressouter);
                                resel.li.id = result.elementid;
                                resel.indentdiv.innerHTML += result.commands;
                                if (result.onclick) {
                                    resel.a.onclick = result.onclick;
                                }
                                if (self.Y.UA.gecko > 0) {
                                    // Fix a Firefox bug which makes sites with a '~' in their wwwroot
                                    // log the user out when clicking on the link (before refreshing the page).
                                    resel.div.innerHTML = unescape(resel.div.innerHTML);
                                }
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
            //var formData = new FormData();
            //formData.append('repo_upload_file', file);
            //formData.append('sesskey', M.cfg.sesskey);
            //formData.append('course', this.courseid);
            //formData.append('section', sectionnumber);
            //formData.append('module', module);
            //formData.append('type', 'Files');

            // Send the AJAX call
            //xhr.open("POST", this.url, true);
            //xhr.send(formData);
        },

        TODO : function() {
        }


    },
    {
        NAME : DNDUPLOAD,
        ATTRS : {
            /**
             * The URI to use for upload requests
             *
             * @optional
             * @attribute uri
             * @default M.cfg.wwwroot + '/course/dndupload.php'
             */
            uri : {
                'value' : M.cfg.wwwroot + '/course/dndupload.php'
            },

            /**
             * The course ID of the course currently being edited
             *
             * @required
             * @attribute courseid
             * @writeOnce
             * @default null
             */
            courseid : {
                'value' : null
            },

            /**
             * The maximum size of files allowed in this form
             *
             * @required
             * @attribute maxbytes
             * @writeOnce
             * @default 0
             */
            maxbytes : {
                'value' : 0
            },

            /**
             * The handlers available to this form
             *
             * @required
             * @attribute handlers
             * @writeOnce
             * @default null
             */
            handlers : {
                'value' : null
            },

            /**
             * Whether this form handles file uploads
             *
             * @required
             * @attribute handlefile
             * @writeOnce
             * @default false
             */
            handlefile : {
                'value' : false
            },

            /**
             * Whether this form handles upload of text
             *
             * @required
             * @attribute handletext
             * @writeOnce
             * @default false
             */
            handletext : {
                'value' : false
            },

            /**
             * Whether this form handles link uploads
             *
             * @required
             * @attribute handlelink
             * @writeOnce
             * @default false
             */
            handlelink : {
                'value' : false
            }
        }
    });

    M.course = M.course || {};
    M.course.init_dndupload = function(params) {
        return new DNDUPLOAD(params);
    };
}, '@VERSION@', {requires:["node", "event", "json", "core_filepicker", "moodle-core-dialogue", "moodle-course-coursebase", "io-form"]});

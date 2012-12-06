if (typeof _yuitest_coverage == "undefined"){
    _yuitest_coverage = {};
    _yuitest_coverline = function(src, line){
        var coverage = _yuitest_coverage[src];
        if (!coverage.lines[line]){
            coverage.calledLines++;
        }
        coverage.lines[line]++;
    };
    _yuitest_coverfunc = function(src, name, line){
        var coverage = _yuitest_coverage[src],
            funcId = name + ":" + line;
        if (!coverage.functions[funcId]){
            coverage.calledFunctions++;
        }
        coverage.functions[funcId]++;
    };
}
_yuitest_coverage["build/moodle-course-toolboxes/moodle-course-toolboxes.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-course-toolboxes/moodle-course-toolboxes.js",
    code: []
};
_yuitest_coverage["build/moodle-course-toolboxes/moodle-course-toolboxes.js"].code=["YUI.add('moodle-course-toolboxes', function (Y, NAME) {","","    WAITICON = {'pix':\"i/loading_small\",'component':'moodle'};","    // The CSS selectors we use","    var CSS = {","        ACTIVITYLI : 'li.activity',","        COMMANDSPAN : 'span.commands',","        SPINNERCOMMANDSPAN : 'span.commands',","        CONTENTAFTERLINK : 'div.contentafterlink',","        DELETE : 'a.editing_delete',","        DIMCLASS : 'dimmed',","        DIMMEDTEXT : 'dimmed_text',","        EDITTITLE : 'a.editing_title',","        EDITTITLECLASS : 'edittitle',","        GENERICICONCLASS : 'iconsmall',","        GROUPSNONE : 'a.editing_groupsnone',","        GROUPSSEPARATE : 'a.editing_groupsseparate',","        GROUPSVISIBLE : 'a.editing_groupsvisible',","        HASLABEL : 'label',","        HIDE : 'a.editing_hide',","        HIGHLIGHT : 'a.editing_highlight',","        INSTANCENAME : 'span.instancename',","        LIGHTBOX : 'lightbox',","        MODINDENTCOUNT : 'mod-indent-',","        MODINDENTDIV : 'div.mod-indent',","        MODINDENTHUGE : 'mod-indent-huge',","        MODULEIDPREFIX : 'module-',","        MOVELEFT : 'a.editing_moveleft',","        MOVELEFTCLASS : 'editing_moveleft',","        MOVERIGHT : 'a.editing_moveright',","        PAGECONTENT : 'div#page-content',","        RIGHTSIDE : '.right',","        SECTIONHIDDENCLASS : 'hidden',","        SECTIONIDPREFIX : 'section-',","        SECTIONLI : 'li.section',","        SHOW : 'a.editing_show',","        SHOWHIDE : 'a.editing_showhide',","        CONDITIONALHIDDEN : 'conditionalhidden',","        AVAILABILITYINFODIV : 'div.availabilityinfo',","        SHOWCLASS : 'editing_show',","        ACCESSHIDECLASS : 'accesshide'","    };","","    /**","     * The toolbox classes","     *","     * TOOLBOX is a generic class which should never be directly instantiated","     * RESOURCETOOLBOX is a class extending TOOLBOX containing code specific to resources","     * SECTIONTOOLBOX is a class extending TOOLBOX containing code specific to sections","     */","    var TOOLBOX = function() {","        TOOLBOX.superclass.constructor.apply(this, arguments);","    }","","    Y.extend(TOOLBOX, Y.Base, {","        /**","         * Toggle the visibility and availability for the specified","         * resource show/hide button","         */","        toggle_hide_resource_ui : function(button) {","            var element = button.ancestor(CSS.ACTIVITYLI);","            var hideicon = button.one('img');","","            var dimarea;","            var toggle_class;","            if (this.is_label(element)) {","                toggle_class = CSS.DIMMEDTEXT;","                dimarea = element.one(CSS.MODINDENTDIV + ' div');","            } else {","                toggle_class = CSS.DIMCLASS;","                dimarea = element.one('a');","            }","","            var status = '';","            var value;","            if (button.hasClass(CSS.SHOWCLASS)) {","                status = 'hide';","                value = 1;","            } else {","                status = 'show';","                value = 0;","            }","            // Update button info.","            var newstring = M.util.get_string(status, 'moodle');","            hideicon.setAttrs({","                'alt' : newstring,","                'src'   : M.util.image_url('t/' + status)","            });","            button.set('title', newstring);","            button.set('className', 'editing_'+status);","","            // If activity is conditionally hidden, then don't toggle.","            if (!dimarea.hasClass(CSS.CONDITIONALHIDDEN)) {","                // Change the UI.","                dimarea.toggleClass(toggle_class);","                // We need to toggle dimming on the description too.","                element.all(CSS.CONTENTAFTERLINK).toggleClass(CSS.DIMMEDTEXT);","            }","            // Toggle availablity info for conditional activities.","            var availabilityinfo = element.one(CSS.AVAILABILITYINFODIV);","","            if (availabilityinfo) {","                availabilityinfo.toggleClass(CSS.ACCESSHIDECLASS);","            }","            return value;","        },","        /**","         * Send a request using the REST API","         *","         * @param data The data to submit","         * @param statusspinner (optional) A statusspinner which may contain a section loader","         * @param optionalconfig (optional) Any additional configuration to submit","         * @return response responseText field from responce","         */","        send_request : function(data, statusspinner, optionalconfig) {","            // Default data structure","            if (!data) {","                data = {};","            }","            // Handle any variables which we must pass back through to","            var pageparams = this.get('config').pageparams;","            for (varname in pageparams) {","                data[varname] = pageparams[varname];","            }","","            data.sesskey = M.cfg.sesskey;","            data.courseId = this.get('courseid');","","            var uri = M.cfg.wwwroot + this.get('ajaxurl');","","            // Define the configuration to send with the request","            var responsetext = [];","            var config = {","                method: 'POST',","                data: data,","                on: {","                    success: function(tid, response) {","                        try {","                            responsetext = Y.JSON.parse(response.responseText);","                            if (responsetext.error) {","                                new M.core.ajaxException(responsetext);","                            }","                        } catch (e) {}","                        if (statusspinner) {","                            window.setTimeout(function(e) {","                                statusspinner.hide();","                            }, 400);","                        }","                    },","                    failure : function(tid, response) {","                        if (statusspinner) {","                            statusspinner.hide();","                        }","                        new M.core.ajaxException(response);","                    }","                },","                context: this,","                sync: true","            }","","            // Apply optional config","            if (optionalconfig) {","                for (varname in optionalconfig) {","                    config[varname] = optionalconfig[varname];","                }","            }","","            if (statusspinner) {","                statusspinner.show();","            }","","            // Send the request","            Y.io(uri, config);","            return responsetext;","        },","        is_label : function(target) {","            return target.hasClass(CSS.HASLABEL);","        },","        /**","         * Return the module ID for the specified element","         *","         * @param element The <li> element to determine a module-id number for","         * @return string The module ID","         */","        get_element_id : function(element) {","            return element.get('id').replace(CSS.MODULEIDPREFIX, '');","        },","        /**","         * Return the module ID for the specified element","         *","         * @param element The <li> element to determine a module-id number for","         * @return string The module ID","         */","        get_section_id : function(section) {","            return section.get('id').replace(CSS.SECTIONIDPREFIX, '');","        }","    },","    {","        NAME : 'course-toolbox',","        ATTRS : {","            // The ID of the current course","            courseid : {","                'value' : 0","            },","            ajaxurl : {","                'value' : 0","            },","            config : {","                'value' : 0","            }","        }","    }","    );","","","    var RESOURCETOOLBOX = function() {","        RESOURCETOOLBOX.superclass.constructor.apply(this, arguments);","    }","","    Y.extend(RESOURCETOOLBOX, TOOLBOX, {","        // Variables","        GROUPS_NONE     : 0,","        GROUPS_SEPARATE : 1,","        GROUPS_VISIBLE  : 2,","","        /**","         * Initialize the resource toolbox","         *","         * Updates all span.commands with relevant handlers and other required changes","         */","        initializer : function(config) {","            this.setup_for_resource();","            M.course.coursebase.register_module(this);","","            var prefix = CSS.ACTIVITYLI + ' ' + CSS.COMMANDSPAN + ' ';","            Y.delegate('click', this.edit_resource_title, CSS.PAGECONTENT, prefix + CSS.EDITTITLE, this);","            Y.delegate('click', this.move_left, CSS.PAGECONTENT, prefix + CSS.MOVELEFT, this);","            Y.delegate('click', this.move_right, CSS.PAGECONTENT, prefix + CSS.MOVERIGHT, this);","            Y.delegate('click', this.delete_resource, CSS.PAGECONTENT, prefix + CSS.DELETE, this);","            Y.delegate('click', this.toggle_hide_resource, CSS.PAGECONTENT, prefix + CSS.HIDE, this);","            Y.delegate('click', this.toggle_hide_resource, CSS.PAGECONTENT, prefix + CSS.SHOW, this);","            Y.delegate('click', this.toggle_groupmode, CSS.PAGECONTENT, prefix + CSS.GROUPSNONE, this);","            Y.delegate('click', this.toggle_groupmode, CSS.PAGECONTENT, prefix + CSS.GROUPSSEPARATE, this);","            Y.delegate('click', this.toggle_groupmode, CSS.PAGECONTENT, prefix + CSS.GROUPSVISIBLE, this);","        },","","        /**","         * Update any span.commands within the scope of the specified","         * selector with AJAX equivelants","         *","         * @param baseselector The selector to limit scope to","         * @return void","         */","        setup_for_resource : function(baseselector) {","            if (!baseselector) {","                var baseselector = CSS.PAGECONTENT + ' ' + CSS.ACTIVITYLI;","            }","","            Y.all(baseselector).each(this._setup_for_resource, this);","        },","        _setup_for_resource : function(toolboxtarget) {","            toolboxtarget = Y.one(toolboxtarget);","            // \"Disable\" show/hide icons (change cursor to not look clickable) if section is hidden","            var showhide = toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.HIDE);","            showhide.concat(toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.SHOW));","            showhide.each(function(node) {","                var section = node.ancestor(CSS.SECTIONLI);","                if (section && section.hasClass(CSS.SECTIONHIDDENCLASS)) {","                    node.setStyle('cursor', 'auto');","                }","            });","","            // Set groupmode attribute for use by this.toggle_groupmode()","            var groups;","            groups = toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.GROUPSNONE);","            groups.setAttribute('groupmode', this.GROUPS_NONE);","","            groups = toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.GROUPSSEPARATE);","            groups.setAttribute('groupmode', this.GROUPS_SEPARATE);","","            groups = toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.GROUPSVISIBLE);","            groups.setAttribute('groupmode', this.GROUPS_VISIBLE);","        },","        move_left : function(e) {","            this.move_leftright(e, -1);","        },","        move_right : function(e) {","            this.move_leftright(e, 1);","        },","        move_leftright : function(e, direction) {","            // Prevent the default button action","            e.preventDefault();","","            // Get the element we're working on","            var element = e.target.ancestor(CSS.ACTIVITYLI);","","            // And we need to determine the current and new indent level","            var indentdiv = element.one(CSS.MODINDENTDIV);","            var indent = indentdiv.getAttribute('class').match(/mod-indent-(\\d{1,})/);","","            if (indent) {","                var oldindent = parseInt(indent[1]);","                var newindent = Math.max(0, (oldindent + parseInt(direction)));","                indentdiv.removeClass(indent[0]);","            } else {","                var oldindent = 0;","                var newindent = 1;","            }","","            // Perform the move","            indentdiv.addClass(CSS.MODINDENTCOUNT + newindent);","            var data = {","                'class' : 'resource',","                'field' : 'indent',","                'value' : newindent,","                'id'    : this.get_element_id(element)","            };","            var spinner = M.util.add_spinner(Y, element.one(CSS.SPINNERCOMMANDSPAN));","            this.send_request(data, spinner);","","            // Handle removal/addition of the moveleft button","            if (newindent == 0) {","                element.one(CSS.MOVELEFT).remove();","            } else if (newindent == 1 && oldindent == 0) {","                this.add_moveleft(element);","            }","","            // Handle massive indentation to match non-ajax display","            var hashugeclass = indentdiv.hasClass(CSS.MODINDENTHUGE);","            if (newindent > 15 && !hashugeclass) {","                indentdiv.addClass(CSS.MODINDENTHUGE);","            } else if (newindent <= 15 && hashugeclass) {","                indentdiv.removeClass(CSS.MODINDENTHUGE);","            }","        },","        delete_resource : function(e) {","            // Prevent the default button action","            e.preventDefault();","","            // Get the element we're working on","            var element   = e.target.ancestor(CSS.ACTIVITYLI);","","            var confirmstring = '';","            if (this.is_label(element)) {","                // Labels are slightly different to other activities","                var plugindata = {","                    type : M.util.get_string('pluginname', 'label')","                }","                confirmstring = M.util.get_string('deletechecktype', 'moodle', plugindata)","            } else {","                var plugindata = {","                    type : M.util.get_string('pluginname', element.getAttribute('class').match(/modtype_([^\\s]*)/)[1]),","                    name : element.one(CSS.INSTANCENAME).get('firstChild').get('data')","                }","                confirmstring = M.util.get_string('deletechecktypename', 'moodle', plugindata);","            }","","            // Confirm element removal","            if (!confirm(confirmstring)) {","                return false;","            }","","            // Actually remove the element","            element.remove();","            var data = {","                'class' : 'resource',","                'action' : 'DELETE',","                'id'    : this.get_element_id(element)","            };","            this.send_request(data);","        },","        toggle_hide_resource : function(e) {","            // Prevent the default button action","            e.preventDefault();","","            // Return early if the current section is hidden","            var section = e.target.ancestor(M.course.format.get_section_selector(Y));","            if (section && section.hasClass(CSS.SECTIONHIDDENCLASS)) {","                return;","            }","","            // Get the element we're working on","            var element = e.target.ancestor(CSS.ACTIVITYLI);","","            var button = e.target.ancestor('a', true);","","            var value = this.toggle_hide_resource_ui(button);","","            // Send the request","            var data = {","                'class' : 'resource',","                'field' : 'visible',","                'value' : value,","                'id'    : this.get_element_id(element)","            };","            var spinner = M.util.add_spinner(Y, element.one(CSS.SPINNERCOMMANDSPAN));","            this.send_request(data, spinner);","            return false; // Need to return false to stop the delegate for the new state firing","        },","        toggle_groupmode : function(e) {","            // Prevent the default button action","            e.preventDefault();","","            // Get the element we're working on","            var element = e.target.ancestor(CSS.ACTIVITYLI);","","            var button = e.target.ancestor('a', true);","            var icon = button.one('img');","","            // Current Mode","            var groupmode = button.getAttribute('groupmode');","            groupmode++;","            if (groupmode > 2) {","                groupmode = 0;","            }","            button.setAttribute('groupmode', groupmode);","","            var newtitle = '';","            var iconsrc = '';","            switch (groupmode) {","                case this.GROUPS_NONE:","                    newtitle = 'groupsnone';","                    iconsrc = M.util.image_url('t/groupn');","                    break;","                case this.GROUPS_SEPARATE:","                    newtitle = 'groupsseparate';","                    iconsrc = M.util.image_url('t/groups');","                    break;","                case this.GROUPS_VISIBLE:","                    newtitle = 'groupsvisible';","                    iconsrc = M.util.image_url('t/groupv');","                    break;","            }","            newtitle = M.util.get_string('clicktochangeinbrackets', 'moodle',","                    M.util.get_string(newtitle, 'moodle'));","","            // Change the UI","            icon.setAttrs({","                'alt' : newtitle,","                'src' : iconsrc","            });","            button.setAttribute('title', newtitle);","","            // And send the request","            var data = {","                'class' : 'resource',","                'field' : 'groupmode',","                'value' : groupmode,","                'id'    : this.get_element_id(element)","            };","            var spinner = M.util.add_spinner(Y, element.one(CSS.SPINNERCOMMANDSPAN));","            this.send_request(data, spinner);","            return false; // Need to return false to stop the delegate for the new state firing","        },","        /**","         * Add the moveleft button","         * This is required after moving left from an initial position of 0","         *","         * @param target The encapsulating <li> element","         */","        add_moveleft : function(target) {","            var left_string = M.util.get_string('moveleft', 'moodle');","            var moveimage = 't/left'; // ltr mode","            if ( Y.one(document.body).hasClass('dir-rtl') ) {","                moveimage = 't/right';","            } else {","                moveimage = 't/left';","            }","            var newicon = Y.Node.create('<img />')","                .addClass(CSS.GENERICICONCLASS)","                .setAttrs({","                    'src'   : M.util.image_url(moveimage, 'moodle'),","                    'alt'   : left_string","                });","            var moveright = target.one(CSS.MOVERIGHT);","            var newlink = moveright.getAttribute('href').replace('indent=1', 'indent=-1');","            var anchor = new Y.Node.create('<a />')","                .setStyle('cursor', 'pointer')","                .addClass(CSS.MOVELEFTCLASS)","                .setAttribute('href', newlink)","                .setAttribute('title', left_string);","            anchor.appendChild(newicon);","            moveright.insert(anchor, 'before');","        },","        /**","         * Edit the title for the resource","         */","        edit_resource_title : function(e) {","            // Get the element we're working on","            var element = e.target.ancestor(CSS.ACTIVITYLI);","            var elementdiv = element.one('div');","            var instancename  = element.one(CSS.INSTANCENAME);","            var currenttitle = instancename.get('firstChild');","            var oldtitle = currenttitle.get('data');","            var titletext = oldtitle;","            var editbutton = element.one('a.' + CSS.EDITTITLECLASS + ' img');","","            // Handle events for edit_resource_title","            var listenevents = [];","            var thisevent;","","            // Grab the anchor so that we can swap it with the edit form","            var anchor = instancename.ancestor('a');","","            var data = {","                'class'   : 'resource',","                'field'   : 'gettitle',","                'id'      : this.get_element_id(element)","            };","","            // Try to retrieve the existing string from the server","            var response = this.send_request(data, editbutton);","            if (response.instancename) {","                titletext = response.instancename;","            }","","            // Create the editor and submit button","            var editor = Y.Node.create('<input />')","                .setAttrs({","                    'name'  : 'title',","                    'value' : titletext,","                    'autocomplete' : 'off'","                })","                .addClass('titleeditor');","            var editform = Y.Node.create('<form />')","                .addClass('activityinstance')","                .setAttribute('action', '#');","            var editinstructions = Y.Node.create('<span />')","                .addClass('editinstructions')","                .set('innerHTML', M.util.get_string('edittitleinstructions', 'moodle'));","            var activityicon = element.one('img.activityicon').cloneNode();","","            // Clear the existing content and put the editor in","            currenttitle.set('data', '');","            editform.appendChild(activityicon);","            editform.appendChild(editor);","            anchor.replace(editform);","            elementdiv.appendChild(editinstructions);","            e.preventDefault();","","            // Focus and select the editor text","            editor.focus().select();","","            // Handle removal of the editor","            var clear_edittitle = function() {","                // Detach all listen events to prevent duplicate triggers","                var thisevent;","                while (thisevent = listenevents.shift()) {","                    thisevent.detach();","                }","","                if (editinstructions) {","                    // Convert back to anchor and remove instructions","                    editform.replace(anchor);","                    editinstructions.remove();","                    editinstructions = null;","                }","            }","","            // Handle cancellation of the editor","            var cancel_edittitle = function(e) {","                clear_edittitle();","","                // Set the title and anchor back to their previous settings","                currenttitle.set('data', oldtitle);","            };","","            // Cancel the edit if we lose focus or the escape key is pressed","            thisevent = editor.on('blur', cancel_edittitle);","            listenevents.push(thisevent);","            thisevent = Y.one('document').on('keyup', function(e) {","                if (e.keyCode == 27) {","                    cancel_edittitle(e);","                }","            });","            listenevents.push(thisevent);","","            // Handle form submission","            thisevent = editform.on('submit', function(e) {","                // We don't actually want to submit anything","                e.preventDefault();","","                // Clear the edit title boxes","                clear_edittitle();","","                // We only accept strings which have valid content","                var newtitle = Y.Lang.trim(editor.get('value'));","                if (newtitle != null && newtitle != \"\" && newtitle != titletext) {","                    var data = {","                        'class'   : 'resource',","                        'field'   : 'updatetitle',","                        'title'   : newtitle,","                        'id'      : this.get_element_id(element)","                    };","                    var response = this.send_request(data, editbutton);","                    if (response.instancename) {","                        currenttitle.set('data', response.instancename);","                    }","                } else {","                    // Invalid content. Set the title back to it's original contents","                    currenttitle.set('data', oldtitle);","                }","            }, this);","            listenevents.push(thisevent);","        }","    }, {","        NAME : 'course-resource-toolbox',","        ATTRS : {","            courseid : {","                'value' : 0","            },","            format : {","                'value' : 'topics'","            }","        }","    });","","    var SECTIONTOOLBOX = function() {","        SECTIONTOOLBOX.superclass.constructor.apply(this, arguments);","    }","","    Y.extend(SECTIONTOOLBOX, TOOLBOX, {","        /**","         * Initialize the toolboxes module","         *","         * Updates all span.commands with relevant handlers and other required changes","         */","        initializer : function(config) {","            this.setup_for_section();","            M.course.coursebase.register_module(this);","","            // Section Highlighting","            Y.delegate('click', this.toggle_highlight, CSS.PAGECONTENT, CSS.SECTIONLI + ' ' + CSS.HIGHLIGHT, this);","            // Section Visibility","            Y.delegate('click', this.toggle_hide_section, CSS.PAGECONTENT, CSS.SECTIONLI + ' ' + CSS.SHOWHIDE, this);","        },","        /**","         * Update any section areas within the scope of the specified","         * selector with AJAX equivelants","         *","         * @param baseselector The selector to limit scope to","         * @return void","         */","        setup_for_section : function(baseselector) {","            // Left here for potential future use - not currently needed due to YUI delegation in initializer()","            /*if (!baseselector) {","                var baseselector = CSS.PAGECONTENT;","            }","","            Y.all(baseselector).each(this._setup_for_section, this);*/","        },","        _setup_for_section : function(toolboxtarget) {","            // Left here for potential future use - not currently needed due to YUI delegation in initializer()","        },","        toggle_hide_section : function(e) {","            // Prevent the default button action","            e.preventDefault();","","            // Get the section we're working on","            var section = e.target.ancestor(M.course.format.get_section_selector(Y));","            var button = e.target.ancestor('a', true);","            var hideicon = button.one('img');","","            // The value to submit","            var value;","            // The status text for strings and images","            var status;","","            if (!section.hasClass(CSS.SECTIONHIDDENCLASS)) {","                section.addClass(CSS.SECTIONHIDDENCLASS);","                value = 0;","                status = 'show';","","            } else {","                section.removeClass(CSS.SECTIONHIDDENCLASS);","                value = 1;","                status = 'hide';","            }","","            var newstring = M.util.get_string(status + 'fromothers', 'format_' + this.get('format'));","            hideicon.setAttrs({","                'alt' : newstring,","                'src'   : M.util.image_url('i/' + status)","            });","            button.set('title', newstring);","","            // Change the highlight status","            var data = {","                'class' : 'section',","                'field' : 'visible',","                'id'    : this.get_section_id(section.ancestor(M.course.format.get_section_wrapper(Y), true)),","                'value' : value","            };","","            var lightbox = M.util.add_lightbox(Y, section);","            lightbox.show();","","            var response = this.send_request(data, lightbox);","","            var activities = section.all(CSS.ACTIVITYLI);","            activities.each(function(node) {","                if (node.one(CSS.SHOW)) {","                    var button = node.one(CSS.SHOW);","                } else {","                    var button = node.one(CSS.HIDE);","                }","                var activityid = this.get_element_id(node);","","                if (Y.Array.indexOf(response.resourcestotoggle, activityid) != -1) {","                    this.toggle_hide_resource_ui(button);","                }","","                if (value == 0) {","                    button.setStyle('cursor', 'auto');","                } else {","                    button.setStyle('cursor', 'pointer');","                }","            }, this);","        },","        toggle_highlight : function(e) {","            // Prevent the default button action","            e.preventDefault();","","            // Get the section we're working on","            var section = e.target.ancestor(M.course.format.get_section_selector(Y));","            var button = e.target.ancestor('a', true);","            var buttonicon = button.one('img');","","            // Determine whether the marker is currently set","            var togglestatus = section.hasClass('current');","            var value = 0;","","            // Set the current highlighted item text","            var old_string = M.util.get_string('markthistopic', 'moodle');","            Y.one(CSS.PAGECONTENT)","                .all(M.course.format.get_section_selector(Y) + '.current ' + CSS.HIGHLIGHT)","                .set('title', old_string);","            Y.one(CSS.PAGECONTENT)","                .all(M.course.format.get_section_selector(Y) + '.current ' + CSS.HIGHLIGHT + ' img')","                .set('alt', old_string)","                .set('src', M.util.image_url('i/marker'));","","            // Remove the highlighting from all sections","            var allsections = Y.one(CSS.PAGECONTENT).all(M.course.format.get_section_selector(Y))","                .removeClass('current');","","            // Then add it if required to the selected section","            if (!togglestatus) {","                section.addClass('current');","                value = this.get_section_id(section.ancestor(M.course.format.get_section_wrapper(Y), true));","                var new_string = M.util.get_string('markedthistopic', 'moodle');","                button","                    .set('title', new_string);","                buttonicon","                    .set('alt', new_string)","                    .set('src', M.util.image_url('i/marked'));","            }","","            // Change the highlight status","            var data = {","                'class' : 'course',","                'field' : 'marker',","                'value' : value","            };","            var lightbox = M.util.add_lightbox(Y, section);","            lightbox.show();","            this.send_request(data, lightbox);","        }","    }, {","        NAME : 'course-section-toolbox',","        ATTRS : {","            courseid : {","                'value' : 0","            },","            format : {","                'value' : 'topics'","            }","        }","    });","","    M.course = M.course || {};","","    M.course.init_resource_toolbox = function(config) {","        return new RESOURCETOOLBOX(config);","    };","","    M.course.init_section_toolbox = function(config) {","        return new SECTIONTOOLBOX(config);","    };","","","}, '@VERSION@', {\"requires\": [\"base\", \"node\", \"io\", \"moodle-course-coursebase\"]});"];
_yuitest_coverage["build/moodle-course-toolboxes/moodle-course-toolboxes.js"].lines = {"1":0,"3":0,"5":0,"51":0,"52":0,"55":0,"61":0,"62":0,"64":0,"65":0,"66":0,"67":0,"68":0,"70":0,"71":0,"74":0,"75":0,"76":0,"77":0,"78":0,"80":0,"81":0,"84":0,"85":0,"89":0,"90":0,"93":0,"95":0,"97":0,"100":0,"102":0,"103":0,"105":0,"117":0,"118":0,"121":0,"122":0,"123":0,"126":0,"127":0,"129":0,"132":0,"133":0,"138":0,"139":0,"140":0,"141":0,"144":0,"145":0,"146":0,"151":0,"152":0,"154":0,"162":0,"163":0,"164":0,"168":0,"169":0,"173":0,"174":0,"177":0,"186":0,"195":0,"216":0,"217":0,"220":0,"232":0,"233":0,"235":0,"236":0,"237":0,"238":0,"239":0,"240":0,"241":0,"242":0,"243":0,"244":0,"255":0,"256":0,"259":0,"262":0,"264":0,"265":0,"266":0,"267":0,"268":0,"269":0,"274":0,"275":0,"276":0,"278":0,"279":0,"281":0,"282":0,"285":0,"288":0,"292":0,"295":0,"298":0,"299":0,"301":0,"302":0,"303":0,"304":0,"306":0,"307":0,"311":0,"312":0,"318":0,"319":0,"322":0,"323":0,"324":0,"325":0,"329":0,"330":0,"331":0,"332":0,"333":0,"338":0,"341":0,"343":0,"344":0,"346":0,"349":0,"351":0,"355":0,"359":0,"360":0,"364":0,"365":0,"370":0,"374":0,"377":0,"378":0,"379":0,"383":0,"385":0,"387":0,"390":0,"396":0,"397":0,"398":0,"402":0,"405":0,"407":0,"408":0,"411":0,"412":0,"413":0,"414":0,"416":0,"418":0,"419":0,"420":0,"422":0,"423":0,"424":0,"426":0,"427":0,"428":0,"430":0,"431":0,"432":0,"434":0,"438":0,"442":0,"445":0,"451":0,"452":0,"453":0,"462":0,"463":0,"464":0,"465":0,"467":0,"469":0,"475":0,"476":0,"477":0,"482":0,"483":0,"490":0,"491":0,"492":0,"493":0,"494":0,"495":0,"496":0,"499":0,"500":0,"503":0,"505":0,"512":0,"513":0,"514":0,"518":0,"525":0,"528":0,"531":0,"534":0,"535":0,"536":0,"537":0,"538":0,"539":0,"542":0,"545":0,"547":0,"548":0,"549":0,"552":0,"554":0,"555":0,"556":0,"561":0,"562":0,"565":0,"569":0,"570":0,"571":0,"572":0,"573":0,"576":0,"579":0,"581":0,"584":0,"587":0,"588":0,"589":0,"595":0,"596":0,"597":0,"601":0,"604":0,"618":0,"619":0,"622":0,"629":0,"630":0,"633":0,"635":0,"657":0,"660":0,"661":0,"662":0,"665":0,"667":0,"669":0,"670":0,"671":0,"672":0,"675":0,"676":0,"677":0,"680":0,"681":0,"685":0,"688":0,"695":0,"696":0,"698":0,"700":0,"701":0,"702":0,"703":0,"705":0,"707":0,"709":0,"710":0,"713":0,"714":0,"716":0,"722":0,"725":0,"726":0,"727":0,"730":0,"731":0,"734":0,"735":0,"738":0,"744":0,"748":0,"749":0,"750":0,"751":0,"752":0,"754":0,"760":0,"765":0,"766":0,"767":0,"781":0,"783":0,"784":0,"787":0,"788":0};
_yuitest_coverage["build/moodle-course-toolboxes/moodle-course-toolboxes.js"].functions = {"TOOLBOX:51":0,"toggle_hide_resource_ui:60":0,"(anonymous 2):145":0,"success:137":0,"failure:150":0,"send_request:115":0,"is_label:176":0,"get_element_id:185":0,"get_section_id:194":0,"RESOURCETOOLBOX:216":0,"initializer:231":0,"setup_for_resource:254":0,"(anonymous 3):266":0,"_setup_for_resource:261":0,"move_left:284":0,"move_right:287":0,"move_leftright:290":0,"delete_resource:336":0,"toggle_hide_resource:372":0,"toggle_groupmode:400":0,"add_moveleft:461":0,"clear_edittitle:545":0,"cancel_edittitle:561":0,"(anonymous 4):571":0,"(anonymous 5):579":0,"edit_resource_title:488":0,"SECTIONTOOLBOX:618":0,"initializer:628":0,"(anonymous 6):701":0,"toggle_hide_section:655":0,"toggle_highlight:720":0,"init_resource_toolbox:783":0,"init_section_toolbox:787":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-toolboxes/moodle-course-toolboxes.js"].coveredLines = 299;
_yuitest_coverage["build/moodle-course-toolboxes/moodle-course-toolboxes.js"].coveredFunctions = 34;
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 1);
YUI.add('moodle-course-toolboxes', function (Y, NAME) {

    _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 3);
WAITICON = {'pix':"i/loading_small",'component':'moodle'};
    // The CSS selectors we use
    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 5);
var CSS = {
        ACTIVITYLI : 'li.activity',
        COMMANDSPAN : 'span.commands',
        SPINNERCOMMANDSPAN : 'span.commands',
        CONTENTAFTERLINK : 'div.contentafterlink',
        DELETE : 'a.editing_delete',
        DIMCLASS : 'dimmed',
        DIMMEDTEXT : 'dimmed_text',
        EDITTITLE : 'a.editing_title',
        EDITTITLECLASS : 'edittitle',
        GENERICICONCLASS : 'iconsmall',
        GROUPSNONE : 'a.editing_groupsnone',
        GROUPSSEPARATE : 'a.editing_groupsseparate',
        GROUPSVISIBLE : 'a.editing_groupsvisible',
        HASLABEL : 'label',
        HIDE : 'a.editing_hide',
        HIGHLIGHT : 'a.editing_highlight',
        INSTANCENAME : 'span.instancename',
        LIGHTBOX : 'lightbox',
        MODINDENTCOUNT : 'mod-indent-',
        MODINDENTDIV : 'div.mod-indent',
        MODINDENTHUGE : 'mod-indent-huge',
        MODULEIDPREFIX : 'module-',
        MOVELEFT : 'a.editing_moveleft',
        MOVELEFTCLASS : 'editing_moveleft',
        MOVERIGHT : 'a.editing_moveright',
        PAGECONTENT : 'div#page-content',
        RIGHTSIDE : '.right',
        SECTIONHIDDENCLASS : 'hidden',
        SECTIONIDPREFIX : 'section-',
        SECTIONLI : 'li.section',
        SHOW : 'a.editing_show',
        SHOWHIDE : 'a.editing_showhide',
        CONDITIONALHIDDEN : 'conditionalhidden',
        AVAILABILITYINFODIV : 'div.availabilityinfo',
        SHOWCLASS : 'editing_show',
        ACCESSHIDECLASS : 'accesshide'
    };

    /**
     * The toolbox classes
     *
     * TOOLBOX is a generic class which should never be directly instantiated
     * RESOURCETOOLBOX is a class extending TOOLBOX containing code specific to resources
     * SECTIONTOOLBOX is a class extending TOOLBOX containing code specific to sections
     */
    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 51);
var TOOLBOX = function() {
        _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "TOOLBOX", 51);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 52);
TOOLBOX.superclass.constructor.apply(this, arguments);
    }

    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 55);
Y.extend(TOOLBOX, Y.Base, {
        /**
         * Toggle the visibility and availability for the specified
         * resource show/hide button
         */
        toggle_hide_resource_ui : function(button) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "toggle_hide_resource_ui", 60);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 61);
var element = button.ancestor(CSS.ACTIVITYLI);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 62);
var hideicon = button.one('img');

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 64);
var dimarea;
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 65);
var toggle_class;
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 66);
if (this.is_label(element)) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 67);
toggle_class = CSS.DIMMEDTEXT;
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 68);
dimarea = element.one(CSS.MODINDENTDIV + ' div');
            } else {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 70);
toggle_class = CSS.DIMCLASS;
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 71);
dimarea = element.one('a');
            }

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 74);
var status = '';
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 75);
var value;
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 76);
if (button.hasClass(CSS.SHOWCLASS)) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 77);
status = 'hide';
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 78);
value = 1;
            } else {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 80);
status = 'show';
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 81);
value = 0;
            }
            // Update button info.
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 84);
var newstring = M.util.get_string(status, 'moodle');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 85);
hideicon.setAttrs({
                'alt' : newstring,
                'src'   : M.util.image_url('t/' + status)
            });
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 89);
button.set('title', newstring);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 90);
button.set('className', 'editing_'+status);

            // If activity is conditionally hidden, then don't toggle.
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 93);
if (!dimarea.hasClass(CSS.CONDITIONALHIDDEN)) {
                // Change the UI.
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 95);
dimarea.toggleClass(toggle_class);
                // We need to toggle dimming on the description too.
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 97);
element.all(CSS.CONTENTAFTERLINK).toggleClass(CSS.DIMMEDTEXT);
            }
            // Toggle availablity info for conditional activities.
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 100);
var availabilityinfo = element.one(CSS.AVAILABILITYINFODIV);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 102);
if (availabilityinfo) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 103);
availabilityinfo.toggleClass(CSS.ACCESSHIDECLASS);
            }
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 105);
return value;
        },
        /**
         * Send a request using the REST API
         *
         * @param data The data to submit
         * @param statusspinner (optional) A statusspinner which may contain a section loader
         * @param optionalconfig (optional) Any additional configuration to submit
         * @return response responseText field from responce
         */
        send_request : function(data, statusspinner, optionalconfig) {
            // Default data structure
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "send_request", 115);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 117);
if (!data) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 118);
data = {};
            }
            // Handle any variables which we must pass back through to
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 121);
var pageparams = this.get('config').pageparams;
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 122);
for (varname in pageparams) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 123);
data[varname] = pageparams[varname];
            }

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 126);
data.sesskey = M.cfg.sesskey;
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 127);
data.courseId = this.get('courseid');

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 129);
var uri = M.cfg.wwwroot + this.get('ajaxurl');

            // Define the configuration to send with the request
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 132);
var responsetext = [];
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 133);
var config = {
                method: 'POST',
                data: data,
                on: {
                    success: function(tid, response) {
                        _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "success", 137);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 138);
try {
                            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 139);
responsetext = Y.JSON.parse(response.responseText);
                            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 140);
if (responsetext.error) {
                                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 141);
new M.core.ajaxException(responsetext);
                            }
                        } catch (e) {}
                        _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 144);
if (statusspinner) {
                            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 145);
window.setTimeout(function(e) {
                                _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "(anonymous 2)", 145);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 146);
statusspinner.hide();
                            }, 400);
                        }
                    },
                    failure : function(tid, response) {
                        _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "failure", 150);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 151);
if (statusspinner) {
                            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 152);
statusspinner.hide();
                        }
                        _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 154);
new M.core.ajaxException(response);
                    }
                },
                context: this,
                sync: true
            }

            // Apply optional config
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 162);
if (optionalconfig) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 163);
for (varname in optionalconfig) {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 164);
config[varname] = optionalconfig[varname];
                }
            }

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 168);
if (statusspinner) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 169);
statusspinner.show();
            }

            // Send the request
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 173);
Y.io(uri, config);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 174);
return responsetext;
        },
        is_label : function(target) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "is_label", 176);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 177);
return target.hasClass(CSS.HASLABEL);
        },
        /**
         * Return the module ID for the specified element
         *
         * @param element The <li> element to determine a module-id number for
         * @return string The module ID
         */
        get_element_id : function(element) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "get_element_id", 185);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 186);
return element.get('id').replace(CSS.MODULEIDPREFIX, '');
        },
        /**
         * Return the module ID for the specified element
         *
         * @param element The <li> element to determine a module-id number for
         * @return string The module ID
         */
        get_section_id : function(section) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "get_section_id", 194);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 195);
return section.get('id').replace(CSS.SECTIONIDPREFIX, '');
        }
    },
    {
        NAME : 'course-toolbox',
        ATTRS : {
            // The ID of the current course
            courseid : {
                'value' : 0
            },
            ajaxurl : {
                'value' : 0
            },
            config : {
                'value' : 0
            }
        }
    }
    );


    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 216);
var RESOURCETOOLBOX = function() {
        _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "RESOURCETOOLBOX", 216);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 217);
RESOURCETOOLBOX.superclass.constructor.apply(this, arguments);
    }

    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 220);
Y.extend(RESOURCETOOLBOX, TOOLBOX, {
        // Variables
        GROUPS_NONE     : 0,
        GROUPS_SEPARATE : 1,
        GROUPS_VISIBLE  : 2,

        /**
         * Initialize the resource toolbox
         *
         * Updates all span.commands with relevant handlers and other required changes
         */
        initializer : function(config) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "initializer", 231);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 232);
this.setup_for_resource();
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 233);
M.course.coursebase.register_module(this);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 235);
var prefix = CSS.ACTIVITYLI + ' ' + CSS.COMMANDSPAN + ' ';
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 236);
Y.delegate('click', this.edit_resource_title, CSS.PAGECONTENT, prefix + CSS.EDITTITLE, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 237);
Y.delegate('click', this.move_left, CSS.PAGECONTENT, prefix + CSS.MOVELEFT, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 238);
Y.delegate('click', this.move_right, CSS.PAGECONTENT, prefix + CSS.MOVERIGHT, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 239);
Y.delegate('click', this.delete_resource, CSS.PAGECONTENT, prefix + CSS.DELETE, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 240);
Y.delegate('click', this.toggle_hide_resource, CSS.PAGECONTENT, prefix + CSS.HIDE, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 241);
Y.delegate('click', this.toggle_hide_resource, CSS.PAGECONTENT, prefix + CSS.SHOW, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 242);
Y.delegate('click', this.toggle_groupmode, CSS.PAGECONTENT, prefix + CSS.GROUPSNONE, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 243);
Y.delegate('click', this.toggle_groupmode, CSS.PAGECONTENT, prefix + CSS.GROUPSSEPARATE, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 244);
Y.delegate('click', this.toggle_groupmode, CSS.PAGECONTENT, prefix + CSS.GROUPSVISIBLE, this);
        },

        /**
         * Update any span.commands within the scope of the specified
         * selector with AJAX equivelants
         *
         * @param baseselector The selector to limit scope to
         * @return void
         */
        setup_for_resource : function(baseselector) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "setup_for_resource", 254);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 255);
if (!baseselector) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 256);
var baseselector = CSS.PAGECONTENT + ' ' + CSS.ACTIVITYLI;
            }

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 259);
Y.all(baseselector).each(this._setup_for_resource, this);
        },
        _setup_for_resource : function(toolboxtarget) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "_setup_for_resource", 261);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 262);
toolboxtarget = Y.one(toolboxtarget);
            // "Disable" show/hide icons (change cursor to not look clickable) if section is hidden
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 264);
var showhide = toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.HIDE);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 265);
showhide.concat(toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.SHOW));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 266);
showhide.each(function(node) {
                _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "(anonymous 3)", 266);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 267);
var section = node.ancestor(CSS.SECTIONLI);
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 268);
if (section && section.hasClass(CSS.SECTIONHIDDENCLASS)) {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 269);
node.setStyle('cursor', 'auto');
                }
            });

            // Set groupmode attribute for use by this.toggle_groupmode()
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 274);
var groups;
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 275);
groups = toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.GROUPSNONE);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 276);
groups.setAttribute('groupmode', this.GROUPS_NONE);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 278);
groups = toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.GROUPSSEPARATE);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 279);
groups.setAttribute('groupmode', this.GROUPS_SEPARATE);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 281);
groups = toolboxtarget.all(CSS.COMMANDSPAN + ' ' + CSS.GROUPSVISIBLE);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 282);
groups.setAttribute('groupmode', this.GROUPS_VISIBLE);
        },
        move_left : function(e) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "move_left", 284);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 285);
this.move_leftright(e, -1);
        },
        move_right : function(e) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "move_right", 287);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 288);
this.move_leftright(e, 1);
        },
        move_leftright : function(e, direction) {
            // Prevent the default button action
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "move_leftright", 290);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 292);
e.preventDefault();

            // Get the element we're working on
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 295);
var element = e.target.ancestor(CSS.ACTIVITYLI);

            // And we need to determine the current and new indent level
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 298);
var indentdiv = element.one(CSS.MODINDENTDIV);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 299);
var indent = indentdiv.getAttribute('class').match(/mod-indent-(\d{1,})/);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 301);
if (indent) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 302);
var oldindent = parseInt(indent[1]);
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 303);
var newindent = Math.max(0, (oldindent + parseInt(direction)));
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 304);
indentdiv.removeClass(indent[0]);
            } else {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 306);
var oldindent = 0;
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 307);
var newindent = 1;
            }

            // Perform the move
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 311);
indentdiv.addClass(CSS.MODINDENTCOUNT + newindent);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 312);
var data = {
                'class' : 'resource',
                'field' : 'indent',
                'value' : newindent,
                'id'    : this.get_element_id(element)
            };
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 318);
var spinner = M.util.add_spinner(Y, element.one(CSS.SPINNERCOMMANDSPAN));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 319);
this.send_request(data, spinner);

            // Handle removal/addition of the moveleft button
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 322);
if (newindent == 0) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 323);
element.one(CSS.MOVELEFT).remove();
            } else {_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 324);
if (newindent == 1 && oldindent == 0) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 325);
this.add_moveleft(element);
            }}

            // Handle massive indentation to match non-ajax display
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 329);
var hashugeclass = indentdiv.hasClass(CSS.MODINDENTHUGE);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 330);
if (newindent > 15 && !hashugeclass) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 331);
indentdiv.addClass(CSS.MODINDENTHUGE);
            } else {_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 332);
if (newindent <= 15 && hashugeclass) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 333);
indentdiv.removeClass(CSS.MODINDENTHUGE);
            }}
        },
        delete_resource : function(e) {
            // Prevent the default button action
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "delete_resource", 336);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 338);
e.preventDefault();

            // Get the element we're working on
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 341);
var element   = e.target.ancestor(CSS.ACTIVITYLI);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 343);
var confirmstring = '';
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 344);
if (this.is_label(element)) {
                // Labels are slightly different to other activities
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 346);
var plugindata = {
                    type : M.util.get_string('pluginname', 'label')
                }
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 349);
confirmstring = M.util.get_string('deletechecktype', 'moodle', plugindata)
            } else {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 351);
var plugindata = {
                    type : M.util.get_string('pluginname', element.getAttribute('class').match(/modtype_([^\s]*)/)[1]),
                    name : element.one(CSS.INSTANCENAME).get('firstChild').get('data')
                }
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 355);
confirmstring = M.util.get_string('deletechecktypename', 'moodle', plugindata);
            }

            // Confirm element removal
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 359);
if (!confirm(confirmstring)) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 360);
return false;
            }

            // Actually remove the element
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 364);
element.remove();
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 365);
var data = {
                'class' : 'resource',
                'action' : 'DELETE',
                'id'    : this.get_element_id(element)
            };
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 370);
this.send_request(data);
        },
        toggle_hide_resource : function(e) {
            // Prevent the default button action
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "toggle_hide_resource", 372);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 374);
e.preventDefault();

            // Return early if the current section is hidden
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 377);
var section = e.target.ancestor(M.course.format.get_section_selector(Y));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 378);
if (section && section.hasClass(CSS.SECTIONHIDDENCLASS)) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 379);
return;
            }

            // Get the element we're working on
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 383);
var element = e.target.ancestor(CSS.ACTIVITYLI);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 385);
var button = e.target.ancestor('a', true);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 387);
var value = this.toggle_hide_resource_ui(button);

            // Send the request
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 390);
var data = {
                'class' : 'resource',
                'field' : 'visible',
                'value' : value,
                'id'    : this.get_element_id(element)
            };
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 396);
var spinner = M.util.add_spinner(Y, element.one(CSS.SPINNERCOMMANDSPAN));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 397);
this.send_request(data, spinner);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 398);
return false; // Need to return false to stop the delegate for the new state firing
        },
        toggle_groupmode : function(e) {
            // Prevent the default button action
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "toggle_groupmode", 400);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 402);
e.preventDefault();

            // Get the element we're working on
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 405);
var element = e.target.ancestor(CSS.ACTIVITYLI);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 407);
var button = e.target.ancestor('a', true);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 408);
var icon = button.one('img');

            // Current Mode
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 411);
var groupmode = button.getAttribute('groupmode');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 412);
groupmode++;
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 413);
if (groupmode > 2) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 414);
groupmode = 0;
            }
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 416);
button.setAttribute('groupmode', groupmode);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 418);
var newtitle = '';
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 419);
var iconsrc = '';
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 420);
switch (groupmode) {
                case this.GROUPS_NONE:
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 422);
newtitle = 'groupsnone';
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 423);
iconsrc = M.util.image_url('t/groupn');
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 424);
break;
                case this.GROUPS_SEPARATE:
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 426);
newtitle = 'groupsseparate';
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 427);
iconsrc = M.util.image_url('t/groups');
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 428);
break;
                case this.GROUPS_VISIBLE:
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 430);
newtitle = 'groupsvisible';
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 431);
iconsrc = M.util.image_url('t/groupv');
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 432);
break;
            }
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 434);
newtitle = M.util.get_string('clicktochangeinbrackets', 'moodle',
                    M.util.get_string(newtitle, 'moodle'));

            // Change the UI
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 438);
icon.setAttrs({
                'alt' : newtitle,
                'src' : iconsrc
            });
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 442);
button.setAttribute('title', newtitle);

            // And send the request
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 445);
var data = {
                'class' : 'resource',
                'field' : 'groupmode',
                'value' : groupmode,
                'id'    : this.get_element_id(element)
            };
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 451);
var spinner = M.util.add_spinner(Y, element.one(CSS.SPINNERCOMMANDSPAN));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 452);
this.send_request(data, spinner);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 453);
return false; // Need to return false to stop the delegate for the new state firing
        },
        /**
         * Add the moveleft button
         * This is required after moving left from an initial position of 0
         *
         * @param target The encapsulating <li> element
         */
        add_moveleft : function(target) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "add_moveleft", 461);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 462);
var left_string = M.util.get_string('moveleft', 'moodle');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 463);
var moveimage = 't/left'; // ltr mode
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 464);
if ( Y.one(document.body).hasClass('dir-rtl') ) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 465);
moveimage = 't/right';
            } else {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 467);
moveimage = 't/left';
            }
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 469);
var newicon = Y.Node.create('<img />')
                .addClass(CSS.GENERICICONCLASS)
                .setAttrs({
                    'src'   : M.util.image_url(moveimage, 'moodle'),
                    'alt'   : left_string
                });
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 475);
var moveright = target.one(CSS.MOVERIGHT);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 476);
var newlink = moveright.getAttribute('href').replace('indent=1', 'indent=-1');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 477);
var anchor = new Y.Node.create('<a />')
                .setStyle('cursor', 'pointer')
                .addClass(CSS.MOVELEFTCLASS)
                .setAttribute('href', newlink)
                .setAttribute('title', left_string);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 482);
anchor.appendChild(newicon);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 483);
moveright.insert(anchor, 'before');
        },
        /**
         * Edit the title for the resource
         */
        edit_resource_title : function(e) {
            // Get the element we're working on
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "edit_resource_title", 488);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 490);
var element = e.target.ancestor(CSS.ACTIVITYLI);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 491);
var elementdiv = element.one('div');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 492);
var instancename  = element.one(CSS.INSTANCENAME);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 493);
var currenttitle = instancename.get('firstChild');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 494);
var oldtitle = currenttitle.get('data');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 495);
var titletext = oldtitle;
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 496);
var editbutton = element.one('a.' + CSS.EDITTITLECLASS + ' img');

            // Handle events for edit_resource_title
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 499);
var listenevents = [];
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 500);
var thisevent;

            // Grab the anchor so that we can swap it with the edit form
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 503);
var anchor = instancename.ancestor('a');

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 505);
var data = {
                'class'   : 'resource',
                'field'   : 'gettitle',
                'id'      : this.get_element_id(element)
            };

            // Try to retrieve the existing string from the server
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 512);
var response = this.send_request(data, editbutton);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 513);
if (response.instancename) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 514);
titletext = response.instancename;
            }

            // Create the editor and submit button
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 518);
var editor = Y.Node.create('<input />')
                .setAttrs({
                    'name'  : 'title',
                    'value' : titletext,
                    'autocomplete' : 'off'
                })
                .addClass('titleeditor');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 525);
var editform = Y.Node.create('<form />')
                .addClass('activityinstance')
                .setAttribute('action', '#');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 528);
var editinstructions = Y.Node.create('<span />')
                .addClass('editinstructions')
                .set('innerHTML', M.util.get_string('edittitleinstructions', 'moodle'));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 531);
var activityicon = element.one('img.activityicon').cloneNode();

            // Clear the existing content and put the editor in
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 534);
currenttitle.set('data', '');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 535);
editform.appendChild(activityicon);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 536);
editform.appendChild(editor);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 537);
anchor.replace(editform);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 538);
elementdiv.appendChild(editinstructions);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 539);
e.preventDefault();

            // Focus and select the editor text
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 542);
editor.focus().select();

            // Handle removal of the editor
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 545);
var clear_edittitle = function() {
                // Detach all listen events to prevent duplicate triggers
                _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "clear_edittitle", 545);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 547);
var thisevent;
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 548);
while (thisevent = listenevents.shift()) {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 549);
thisevent.detach();
                }

                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 552);
if (editinstructions) {
                    // Convert back to anchor and remove instructions
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 554);
editform.replace(anchor);
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 555);
editinstructions.remove();
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 556);
editinstructions = null;
                }
            }

            // Handle cancellation of the editor
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 561);
var cancel_edittitle = function(e) {
                _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "cancel_edittitle", 561);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 562);
clear_edittitle();

                // Set the title and anchor back to their previous settings
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 565);
currenttitle.set('data', oldtitle);
            };

            // Cancel the edit if we lose focus or the escape key is pressed
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 569);
thisevent = editor.on('blur', cancel_edittitle);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 570);
listenevents.push(thisevent);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 571);
thisevent = Y.one('document').on('keyup', function(e) {
                _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "(anonymous 4)", 571);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 572);
if (e.keyCode == 27) {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 573);
cancel_edittitle(e);
                }
            });
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 576);
listenevents.push(thisevent);

            // Handle form submission
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 579);
thisevent = editform.on('submit', function(e) {
                // We don't actually want to submit anything
                _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "(anonymous 5)", 579);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 581);
e.preventDefault();

                // Clear the edit title boxes
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 584);
clear_edittitle();

                // We only accept strings which have valid content
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 587);
var newtitle = Y.Lang.trim(editor.get('value'));
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 588);
if (newtitle != null && newtitle != "" && newtitle != titletext) {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 589);
var data = {
                        'class'   : 'resource',
                        'field'   : 'updatetitle',
                        'title'   : newtitle,
                        'id'      : this.get_element_id(element)
                    };
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 595);
var response = this.send_request(data, editbutton);
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 596);
if (response.instancename) {
                        _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 597);
currenttitle.set('data', response.instancename);
                    }
                } else {
                    // Invalid content. Set the title back to it's original contents
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 601);
currenttitle.set('data', oldtitle);
                }
            }, this);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 604);
listenevents.push(thisevent);
        }
    }, {
        NAME : 'course-resource-toolbox',
        ATTRS : {
            courseid : {
                'value' : 0
            },
            format : {
                'value' : 'topics'
            }
        }
    });

    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 618);
var SECTIONTOOLBOX = function() {
        _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "SECTIONTOOLBOX", 618);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 619);
SECTIONTOOLBOX.superclass.constructor.apply(this, arguments);
    }

    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 622);
Y.extend(SECTIONTOOLBOX, TOOLBOX, {
        /**
         * Initialize the toolboxes module
         *
         * Updates all span.commands with relevant handlers and other required changes
         */
        initializer : function(config) {
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "initializer", 628);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 629);
this.setup_for_section();
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 630);
M.course.coursebase.register_module(this);

            // Section Highlighting
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 633);
Y.delegate('click', this.toggle_highlight, CSS.PAGECONTENT, CSS.SECTIONLI + ' ' + CSS.HIGHLIGHT, this);
            // Section Visibility
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 635);
Y.delegate('click', this.toggle_hide_section, CSS.PAGECONTENT, CSS.SECTIONLI + ' ' + CSS.SHOWHIDE, this);
        },
        /**
         * Update any section areas within the scope of the specified
         * selector with AJAX equivelants
         *
         * @param baseselector The selector to limit scope to
         * @return void
         */
        setup_for_section : function(baseselector) {
            // Left here for potential future use - not currently needed due to YUI delegation in initializer()
            /*if (!baseselector) {
                var baseselector = CSS.PAGECONTENT;
            }

            Y.all(baseselector).each(this._setup_for_section, this);*/
        },
        _setup_for_section : function(toolboxtarget) {
            // Left here for potential future use - not currently needed due to YUI delegation in initializer()
        },
        toggle_hide_section : function(e) {
            // Prevent the default button action
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "toggle_hide_section", 655);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 657);
e.preventDefault();

            // Get the section we're working on
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 660);
var section = e.target.ancestor(M.course.format.get_section_selector(Y));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 661);
var button = e.target.ancestor('a', true);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 662);
var hideicon = button.one('img');

            // The value to submit
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 665);
var value;
            // The status text for strings and images
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 667);
var status;

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 669);
if (!section.hasClass(CSS.SECTIONHIDDENCLASS)) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 670);
section.addClass(CSS.SECTIONHIDDENCLASS);
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 671);
value = 0;
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 672);
status = 'show';

            } else {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 675);
section.removeClass(CSS.SECTIONHIDDENCLASS);
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 676);
value = 1;
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 677);
status = 'hide';
            }

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 680);
var newstring = M.util.get_string(status + 'fromothers', 'format_' + this.get('format'));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 681);
hideicon.setAttrs({
                'alt' : newstring,
                'src'   : M.util.image_url('i/' + status)
            });
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 685);
button.set('title', newstring);

            // Change the highlight status
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 688);
var data = {
                'class' : 'section',
                'field' : 'visible',
                'id'    : this.get_section_id(section.ancestor(M.course.format.get_section_wrapper(Y), true)),
                'value' : value
            };

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 695);
var lightbox = M.util.add_lightbox(Y, section);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 696);
lightbox.show();

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 698);
var response = this.send_request(data, lightbox);

            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 700);
var activities = section.all(CSS.ACTIVITYLI);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 701);
activities.each(function(node) {
                _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "(anonymous 6)", 701);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 702);
if (node.one(CSS.SHOW)) {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 703);
var button = node.one(CSS.SHOW);
                } else {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 705);
var button = node.one(CSS.HIDE);
                }
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 707);
var activityid = this.get_element_id(node);

                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 709);
if (Y.Array.indexOf(response.resourcestotoggle, activityid) != -1) {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 710);
this.toggle_hide_resource_ui(button);
                }

                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 713);
if (value == 0) {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 714);
button.setStyle('cursor', 'auto');
                } else {
                    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 716);
button.setStyle('cursor', 'pointer');
                }
            }, this);
        },
        toggle_highlight : function(e) {
            // Prevent the default button action
            _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "toggle_highlight", 720);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 722);
e.preventDefault();

            // Get the section we're working on
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 725);
var section = e.target.ancestor(M.course.format.get_section_selector(Y));
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 726);
var button = e.target.ancestor('a', true);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 727);
var buttonicon = button.one('img');

            // Determine whether the marker is currently set
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 730);
var togglestatus = section.hasClass('current');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 731);
var value = 0;

            // Set the current highlighted item text
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 734);
var old_string = M.util.get_string('markthistopic', 'moodle');
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 735);
Y.one(CSS.PAGECONTENT)
                .all(M.course.format.get_section_selector(Y) + '.current ' + CSS.HIGHLIGHT)
                .set('title', old_string);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 738);
Y.one(CSS.PAGECONTENT)
                .all(M.course.format.get_section_selector(Y) + '.current ' + CSS.HIGHLIGHT + ' img')
                .set('alt', old_string)
                .set('src', M.util.image_url('i/marker'));

            // Remove the highlighting from all sections
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 744);
var allsections = Y.one(CSS.PAGECONTENT).all(M.course.format.get_section_selector(Y))
                .removeClass('current');

            // Then add it if required to the selected section
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 748);
if (!togglestatus) {
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 749);
section.addClass('current');
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 750);
value = this.get_section_id(section.ancestor(M.course.format.get_section_wrapper(Y), true));
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 751);
var new_string = M.util.get_string('markedthistopic', 'moodle');
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 752);
button
                    .set('title', new_string);
                _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 754);
buttonicon
                    .set('alt', new_string)
                    .set('src', M.util.image_url('i/marked'));
            }

            // Change the highlight status
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 760);
var data = {
                'class' : 'course',
                'field' : 'marker',
                'value' : value
            };
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 765);
var lightbox = M.util.add_lightbox(Y, section);
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 766);
lightbox.show();
            _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 767);
this.send_request(data, lightbox);
        }
    }, {
        NAME : 'course-section-toolbox',
        ATTRS : {
            courseid : {
                'value' : 0
            },
            format : {
                'value' : 'topics'
            }
        }
    });

    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 781);
M.course = M.course || {};

    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 783);
M.course.init_resource_toolbox = function(config) {
        _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "init_resource_toolbox", 783);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 784);
return new RESOURCETOOLBOX(config);
    };

    _yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 787);
M.course.init_section_toolbox = function(config) {
        _yuitest_coverfunc("build/moodle-course-toolboxes/moodle-course-toolboxes.js", "init_section_toolbox", 787);
_yuitest_coverline("build/moodle-course-toolboxes/moodle-course-toolboxes.js", 788);
return new SECTIONTOOLBOX(config);
    };


}, '@VERSION@', {"requires": ["base", "node", "io", "moodle-course-coursebase"]});

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
_yuitest_coverage["build/moodle-course-dragdrop/moodle-course-dragdrop.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-course-dragdrop/moodle-course-dragdrop.js",
    code: []
};
_yuitest_coverage["build/moodle-course-dragdrop/moodle-course-dragdrop.js"].code=["YUI.add('moodle-course-dragdrop', function (Y, NAME) {","","    var CSS = {","        ACTIVITY : 'activity',","        COMMANDSPAN : 'span.commands',","        CONTENT : 'content',","        COURSECONTENT : 'course-content',","        EDITINGMOVE : 'editing_move',","        ICONCLASS : 'iconsmall',","        JUMPMENU : 'jumpmenu',","        LEFT : 'left',","        LIGHTBOX : 'lightbox',","        MOVEDOWN : 'movedown',","        MOVEUP : 'moveup',","        PAGECONTENT : 'page-content',","        RIGHT : 'right',","        SECTION : 'section',","        SECTIONADDMENUS : 'section_add_menus',","        SECTIONHANDLE : 'section-handle',","        SUMMARY : 'summary'","    };","","    var DRAGSECTION = function() {","        DRAGSECTION.superclass.constructor.apply(this, arguments);","    };","    Y.extend(DRAGSECTION, M.core.dragdrop, {","        sectionlistselector : null,","","        initializer : function(params) {","            // Set group for parent class","            this.groups = ['section'];","            this.samenodeclass = M.course.format.get_sectionwrapperclass();","            this.parentnodeclass = M.course.format.get_containerclass();","","            // Check if we are in single section mode","            if (Y.Node.one('.'+CSS.JUMPMENU)) {","                return false;","            }","            // Initialise sections dragging","            this.sectionlistselector = M.course.format.get_section_wrapper(Y);","            if (this.sectionlistselector) {","                this.sectionlistselector = '.'+CSS.COURSECONTENT+' '+this.sectionlistselector;","                this.setup_for_section(this.sectionlistselector);","","                // Make each li element in the lists of sections draggable","                var nodeselector = this.sectionlistselector.slice(CSS.COURSECONTENT.length+2);","                var del = new Y.DD.Delegate({","                    container: '.'+CSS.COURSECONTENT,","                    nodes: nodeselector,","                    target: true,","                    handles: ['.'+CSS.LEFT],","                    dragConfig: {groups: this.groups}","                });","                del.dd.plug(Y.Plugin.DDProxy, {","                    // Don't move the node at the end of the drag","                    moveOnEnd: false","                });","                del.dd.plug(Y.Plugin.DDConstrained, {","                    // Keep it inside the .course-content","                    constrain: '#'+CSS.PAGECONTENT,","                    stickY: true","                });","                del.dd.plug(Y.Plugin.DDWinScroll);","            }","        },","","         /**","         * Apply dragdrop features to the specified selector or node that refers to section(s)","         *","         * @param baseselector The CSS selector or node to limit scope to","         * @return void","         */","        setup_for_section : function(baseselector) {","            Y.Node.all(baseselector).each(function(sectionnode) {","                // Determine the section ID","                var sectionid = this.get_section_id(sectionnode);","","                // We skip the top section as it is not draggable","                if (sectionid > 0) {","                    // Remove move icons","                    var movedown = sectionnode.one('.'+CSS.RIGHT+' a.'+CSS.MOVEDOWN);","                    var moveup = sectionnode.one('.'+CSS.RIGHT+' a.'+CSS.MOVEUP);","","                    // Add dragger icon","                    var title = M.util.get_string('movesection', 'moodle', sectionid);","                    var cssleft = sectionnode.one('.'+CSS.LEFT);","","                    if ((movedown || moveup) && cssleft) {","                        cssleft.setStyle('cursor', 'move');","                        cssleft.appendChild(this.get_drag_handle(title, CSS.SECTIONHANDLE, 'icon', true));","","                        if (moveup) {","                            moveup.remove();","                        }","                        if (movedown) {","                            movedown.remove();","                        }","                    }","                }","            }, this);","        },","","        get_section_id : function(node) {","            return Number(node.get('id').replace(/section-/i, ''));","        },","","        /*","         * Drag-dropping related functions","         */","        drag_start : function(e) {","            // Get our drag object","            var drag = e.target;","            // Creat a dummy structure of the outer elemnents for clean styles application","            var containernode = Y.Node.create('<'+M.course.format.get_containernode()+'></'+M.course.format.get_containernode()+'>');","            containernode.addClass(M.course.format.get_containerclass());","            var sectionnode = Y.Node.create('<'+ M.course.format.get_sectionwrappernode()+'></'+ M.course.format.get_sectionwrappernode()+'>');","            sectionnode.addClass( M.course.format.get_sectionwrapperclass());","            sectionnode.setStyle('margin', 0);","            sectionnode.setContent(drag.get('node').get('innerHTML'));","            containernode.appendChild(sectionnode);","            drag.get('dragNode').setContent(containernode);","            drag.get('dragNode').addClass(CSS.COURSECONTENT);","        },","","        drag_dropmiss : function(e) {","            // Missed the target, but we assume the user intended to drop it","            // on the last last ghost node location, e.drag and e.drop should be","            // prepared by global_drag_dropmiss parent so simulate drop_hit(e).","            this.drop_hit(e);","        },","","        drop_hit : function(e) {","            var drag = e.drag;","            // Get a reference to our drag node","            var dragnode = drag.get('node');","            var dropnode = e.drop.get('node');","            // Prepare some variables","            var dragnodeid = Number(this.get_section_id(dragnode));","            var dropnodeid = Number(this.get_section_id(dropnode));","","            var loopstart = dragnodeid;","            var loopend = dropnodeid;","","            if (this.goingup) {","                loopstart = dropnodeid;","                loopend = dragnodeid;","            }","","            // Get the list of nodes","            drag.get('dragNode').removeClass(CSS.COURSECONTENT);","            var sectionlist = Y.Node.all(this.sectionlistselector);","","            // Add lightbox if it not there","            var lightbox = M.util.add_lightbox(Y, dragnode);","","            var params = {};","","            // Handle any variables which we must pass back through to","            var pageparams = this.get('config').pageparams;","            for (varname in pageparams) {","                params[varname] = pageparams[varname];","            }","","            // Prepare request parameters","            params.sesskey = M.cfg.sesskey;","            params.courseId = this.get('courseid');","            params['class'] = 'section';","            params.field = 'move';","            params.id = dragnodeid;","            params.value = dropnodeid;","","            // Do AJAX request","            var uri = M.cfg.wwwroot + this.get('ajaxurl');","","            Y.io(uri, {","                method: 'POST',","                data: params,","                on: {","                    start : function(tid) {","                        lightbox.show();","                    },","                    success: function(tid, response) {","                        // Update section titles, we can't simply swap them as","                        // they might have custom title","                        try {","                            var responsetext = Y.JSON.parse(response.responseText);","                            if (responsetext.error) {","                                new M.core.ajaxException(responsetext);","                            }","                            M.course.format.process_sections(Y, sectionlist, responsetext, loopstart, loopend);","                        } catch (e) {}","","                        // Classic bubble sort algorithm is applied to the section","                        // nodes between original drag node location and the new one.","                        do {","                            var swapped = false;","                            for (var i = loopstart; i <= loopend; i++) {","                                if (this.get_section_id(sectionlist.item(i-1)) > this.get_section_id(sectionlist.item(i))) {","                                    // Swap section id","                                    var sectionid = sectionlist.item(i-1).get('id');","                                    sectionlist.item(i-1).set('id', sectionlist.item(i).get('id'));","                                    sectionlist.item(i).set('id', sectionid);","                                    // See what format needs to swap","                                    M.course.format.swap_sections(Y, i-1, i);","                                    // Update flag","                                    swapped = true;","                                }","                            }","                            loopend = loopend - 1;","                        } while (swapped);","","                        // Finally, hide the lightbox","                        window.setTimeout(function(e) {","                            lightbox.hide();","                        }, 250);","                    },","                    failure: function(tid, response) {","                        this.ajax_failure(response);","                        lightbox.hide();","                    }","                },","                context:this","            });","        }","","    }, {","        NAME : 'course-dragdrop-section',","        ATTRS : {","            courseid : {","                value : null","            },","            ajaxurl : {","                'value' : 0","            },","            config : {","                'value' : 0","            }","        }","    });","","    var DRAGRESOURCE = function() {","        DRAGRESOURCE.superclass.constructor.apply(this, arguments);","    };","    Y.extend(DRAGRESOURCE, M.core.dragdrop, {","        initializer : function(params) {","            // Set group for parent class","            this.groups = ['resource'];","            this.samenodeclass = CSS.ACTIVITY;","            this.parentnodeclass = CSS.SECTION;","            this.resourcedraghandle = this.get_drag_handle(M.str.moodle.move, CSS.EDITINGMOVE, CSS.ICONCLASS);","","            // Go through all sections","            var sectionlistselector = M.course.format.get_section_selector(Y);","            if (sectionlistselector) {","                sectionlistselector = '.'+CSS.COURSECONTENT+' '+sectionlistselector;","                this.setup_for_section(sectionlistselector);","","                // Initialise drag & drop for all resources/activities","                var nodeselector = sectionlistselector.slice(CSS.COURSECONTENT.length+2)+' li.'+CSS.ACTIVITY;","                var del = new Y.DD.Delegate({","                    container: '.'+CSS.COURSECONTENT,","                    nodes: nodeselector,","                    target: true,","                    handles: ['.' + CSS.EDITINGMOVE],","                    dragConfig: {groups: this.groups}","                });","                del.dd.plug(Y.Plugin.DDProxy, {","                    // Don't move the node at the end of the drag","                    moveOnEnd: false,","                    cloneNode: true","                });","                del.dd.plug(Y.Plugin.DDConstrained, {","                    // Keep it inside the .course-content","                    constrain: '#'+CSS.PAGECONTENT","                });","                del.dd.plug(Y.Plugin.DDWinScroll);","","                M.course.coursebase.register_module(this);","                M.course.dragres = this;","            }","        },","","         /**","         * Apply dragdrop features to the specified selector or node that refers to section(s)","         *","         * @param baseselector The CSS selector or node to limit scope to","         * @return void","         */","        setup_for_section : function(baseselector) {","            Y.Node.all(baseselector).each(function(sectionnode) {","                var resources = sectionnode.one('.'+CSS.CONTENT+' ul.'+CSS.SECTION);","                // See if resources ul exists, if not create one","                if (!resources) {","                    var resources = Y.Node.create('<ul></ul>');","                    resources.addClass(CSS.SECTION);","                    sectionnode.one('.'+CSS.CONTENT+' div.'+CSS.SUMMARY).insert(resources, 'after');","                }","                // Define empty ul as droptarget, so that item could be moved to empty list","                var tar = new Y.DD.Drop({","                    node: resources,","                    groups: this.groups,","                    padding: '20 0 20 0'","                });","","                // Initialise each resource/activity in this section","                this.setup_for_resource('#'+sectionnode.get('id')+' li.'+CSS.ACTIVITY);","            }, this);","        },","        /**","         * Apply dragdrop features to the specified selector or node that refers to resource(s)","         *","         * @param baseselector The CSS selector or node to limit scope to","         * @return void","         */","        setup_for_resource : function(baseselector) {","            Y.Node.all(baseselector).each(function(resourcesnode) {","                // Replace move icons","                var move = resourcesnode.one('a.'+CSS.EDITINGMOVE);","                if (move) {","                    move.replace(this.resourcedraghandle.cloneNode(true));","                }","            }, this);","        },","","        get_section_id : function(node) {","            return Number(node.get('id').replace(/section-/i, ''));","        },","","        get_resource_id : function(node) {","            return Number(node.get('id').replace(/module-/i, ''));","        },","","        drag_start : function(e) {","            // Get our drag object","            var drag = e.target;","            drag.get('dragNode').setContent(drag.get('node').get('innerHTML'));","            drag.get('dragNode').all('img.iconsmall').setStyle('vertical-align', 'baseline');","        },","","        drag_dropmiss : function(e) {","            // Missed the target, but we assume the user intended to drop it","            // on the last last ghost node location, e.drag and e.drop should be","            // prepared by global_drag_dropmiss parent so simulate drop_hit(e).","            this.drop_hit(e);","        },","","        drop_hit : function(e) {","            var drag = e.drag;","            // Get a reference to our drag node","            var dragnode = drag.get('node');","            var dropnode = e.drop.get('node');","","            // Add spinner if it not there","            var spinner = M.util.add_spinner(Y, dragnode.one(CSS.COMMANDSPAN));","","            var params = {};","","            // Handle any variables which we must pass back through to","            var pageparams = this.get('config').pageparams;","            for (varname in pageparams) {","                params[varname] = pageparams[varname];","            }","","            // Prepare request parameters","            params.sesskey = M.cfg.sesskey;","            params.courseId = this.get('courseid');","            params['class'] = 'resource';","            params.field = 'move';","            params.id = Number(this.get_resource_id(dragnode));","            params.sectionId = this.get_section_id(dropnode.ancestor(M.course.format.get_section_wrapper(Y), true));","","            if (dragnode.next()) {","                params.beforeId = Number(this.get_resource_id(dragnode.next()));","            }","","            // Do AJAX request","            var uri = M.cfg.wwwroot + this.get('ajaxurl');","","            Y.io(uri, {","                method: 'POST',","                data: params,","                on: {","                    start : function(tid) {","                        this.lock_drag_handle(drag, CSS.EDITINGMOVE);","                        spinner.show();","                    },","                    success: function(tid, response) {","                        this.unlock_drag_handle(drag, CSS.EDITINGMOVE);","                        window.setTimeout(function(e) {","                            spinner.hide();","                        }, 250);","                    },","                    failure: function(tid, response) {","                        this.ajax_failure(response);","                        this.unlock_drag_handle(drag, CSS.SECTIONHANDLE);","                        spinner.hide();","                        // TODO: revert nodes location","                    }","                },","                context:this","            });","        }","    }, {","        NAME : 'course-dragdrop-resource',","        ATTRS : {","            courseid : {","                value : null","            },","            ajaxurl : {","                'value' : 0","            },","            config : {","                'value' : 0","            }","        }","    });","","    M.course = M.course || {};","    M.course.init_resource_dragdrop = function(params) {","        new DRAGRESOURCE(params);","    }","    M.course.init_section_dragdrop = function(params) {","        new DRAGSECTION(params);","    }","","","}, '@VERSION@', {","    \"requires\": [","        \"base\",","        \"node\",","        \"io\",","        \"dom\",","        \"dd\",","        \"dd-scroll\",","        \"moodle-core-dragdrop\",","        \"moodle-core-notification\",","        \"moodle-course-coursebase\"","    ]","});"];
_yuitest_coverage["build/moodle-course-dragdrop/moodle-course-dragdrop.js"].lines = {"1":0,"3":0,"23":0,"24":0,"26":0,"31":0,"32":0,"33":0,"36":0,"37":0,"40":0,"41":0,"42":0,"43":0,"46":0,"47":0,"54":0,"58":0,"63":0,"74":0,"76":0,"79":0,"81":0,"82":0,"85":0,"86":0,"88":0,"89":0,"90":0,"92":0,"93":0,"95":0,"96":0,"104":0,"112":0,"114":0,"115":0,"116":0,"117":0,"118":0,"119":0,"120":0,"121":0,"122":0,"129":0,"133":0,"135":0,"136":0,"138":0,"139":0,"141":0,"142":0,"144":0,"145":0,"146":0,"150":0,"151":0,"154":0,"156":0,"159":0,"160":0,"161":0,"165":0,"166":0,"167":0,"168":0,"169":0,"170":0,"173":0,"175":0,"180":0,"185":0,"186":0,"187":0,"188":0,"190":0,"195":0,"196":0,"197":0,"198":0,"200":0,"201":0,"202":0,"204":0,"206":0,"209":0,"213":0,"214":0,"218":0,"219":0,"241":0,"242":0,"244":0,"247":0,"248":0,"249":0,"250":0,"253":0,"254":0,"255":0,"256":0,"259":0,"260":0,"267":0,"272":0,"276":0,"278":0,"279":0,"290":0,"291":0,"293":0,"294":0,"295":0,"296":0,"299":0,"306":0,"316":0,"318":0,"319":0,"320":0,"326":0,"330":0,"335":0,"336":0,"337":0,"344":0,"348":0,"350":0,"351":0,"354":0,"356":0,"359":0,"360":0,"361":0,"365":0,"366":0,"367":0,"368":0,"369":0,"370":0,"372":0,"373":0,"377":0,"379":0,"384":0,"385":0,"388":0,"389":0,"390":0,"394":0,"395":0,"396":0,"418":0,"419":0,"420":0,"422":0,"423":0};
_yuitest_coverage["build/moodle-course-dragdrop/moodle-course-dragdrop.js"].functions = {"DRAGSECTION:23":0,"initializer:29":0,"(anonymous 2):74":0,"setup_for_section:73":0,"get_section_id:103":0,"drag_start:110":0,"drag_dropmiss:125":0,"start:179":0,"(anonymous 3):213":0,"success:182":0,"failure:217":0,"drop_hit:132":0,"DRAGRESOURCE:241":0,"initializer:245":0,"(anonymous 4):290":0,"setup_for_section:289":0,"(anonymous 5):316":0,"setup_for_resource:315":0,"get_section_id:325":0,"get_resource_id:329":0,"drag_start:333":0,"drag_dropmiss:340":0,"start:383":0,"(anonymous 6):389":0,"success:387":0,"failure:393":0,"drop_hit:347":0,"init_resource_dragdrop:419":0,"init_section_dragdrop:422":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-dragdrop/moodle-course-dragdrop.js"].coveredLines = 157;
_yuitest_coverage["build/moodle-course-dragdrop/moodle-course-dragdrop.js"].coveredFunctions = 30;
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 1);
YUI.add('moodle-course-dragdrop', function (Y, NAME) {

    _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 3);
var CSS = {
        ACTIVITY : 'activity',
        COMMANDSPAN : 'span.commands',
        CONTENT : 'content',
        COURSECONTENT : 'course-content',
        EDITINGMOVE : 'editing_move',
        ICONCLASS : 'iconsmall',
        JUMPMENU : 'jumpmenu',
        LEFT : 'left',
        LIGHTBOX : 'lightbox',
        MOVEDOWN : 'movedown',
        MOVEUP : 'moveup',
        PAGECONTENT : 'page-content',
        RIGHT : 'right',
        SECTION : 'section',
        SECTIONADDMENUS : 'section_add_menus',
        SECTIONHANDLE : 'section-handle',
        SUMMARY : 'summary'
    };

    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 23);
var DRAGSECTION = function() {
        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "DRAGSECTION", 23);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 24);
DRAGSECTION.superclass.constructor.apply(this, arguments);
    };
    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 26);
Y.extend(DRAGSECTION, M.core.dragdrop, {
        sectionlistselector : null,

        initializer : function(params) {
            // Set group for parent class
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "initializer", 29);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 31);
this.groups = ['section'];
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 32);
this.samenodeclass = M.course.format.get_sectionwrapperclass();
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 33);
this.parentnodeclass = M.course.format.get_containerclass();

            // Check if we are in single section mode
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 36);
if (Y.Node.one('.'+CSS.JUMPMENU)) {
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 37);
return false;
            }
            // Initialise sections dragging
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 40);
this.sectionlistselector = M.course.format.get_section_wrapper(Y);
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 41);
if (this.sectionlistselector) {
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 42);
this.sectionlistselector = '.'+CSS.COURSECONTENT+' '+this.sectionlistselector;
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 43);
this.setup_for_section(this.sectionlistselector);

                // Make each li element in the lists of sections draggable
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 46);
var nodeselector = this.sectionlistselector.slice(CSS.COURSECONTENT.length+2);
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 47);
var del = new Y.DD.Delegate({
                    container: '.'+CSS.COURSECONTENT,
                    nodes: nodeselector,
                    target: true,
                    handles: ['.'+CSS.LEFT],
                    dragConfig: {groups: this.groups}
                });
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 54);
del.dd.plug(Y.Plugin.DDProxy, {
                    // Don't move the node at the end of the drag
                    moveOnEnd: false
                });
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 58);
del.dd.plug(Y.Plugin.DDConstrained, {
                    // Keep it inside the .course-content
                    constrain: '#'+CSS.PAGECONTENT,
                    stickY: true
                });
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 63);
del.dd.plug(Y.Plugin.DDWinScroll);
            }
        },

         /**
         * Apply dragdrop features to the specified selector or node that refers to section(s)
         *
         * @param baseselector The CSS selector or node to limit scope to
         * @return void
         */
        setup_for_section : function(baseselector) {
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "setup_for_section", 73);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 74);
Y.Node.all(baseselector).each(function(sectionnode) {
                // Determine the section ID
                _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "(anonymous 2)", 74);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 76);
var sectionid = this.get_section_id(sectionnode);

                // We skip the top section as it is not draggable
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 79);
if (sectionid > 0) {
                    // Remove move icons
                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 81);
var movedown = sectionnode.one('.'+CSS.RIGHT+' a.'+CSS.MOVEDOWN);
                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 82);
var moveup = sectionnode.one('.'+CSS.RIGHT+' a.'+CSS.MOVEUP);

                    // Add dragger icon
                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 85);
var title = M.util.get_string('movesection', 'moodle', sectionid);
                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 86);
var cssleft = sectionnode.one('.'+CSS.LEFT);

                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 88);
if ((movedown || moveup) && cssleft) {
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 89);
cssleft.setStyle('cursor', 'move');
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 90);
cssleft.appendChild(this.get_drag_handle(title, CSS.SECTIONHANDLE, 'icon', true));

                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 92);
if (moveup) {
                            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 93);
moveup.remove();
                        }
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 95);
if (movedown) {
                            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 96);
movedown.remove();
                        }
                    }
                }
            }, this);
        },

        get_section_id : function(node) {
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "get_section_id", 103);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 104);
return Number(node.get('id').replace(/section-/i, ''));
        },

        /*
         * Drag-dropping related functions
         */
        drag_start : function(e) {
            // Get our drag object
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "drag_start", 110);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 112);
var drag = e.target;
            // Creat a dummy structure of the outer elemnents for clean styles application
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 114);
var containernode = Y.Node.create('<'+M.course.format.get_containernode()+'></'+M.course.format.get_containernode()+'>');
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 115);
containernode.addClass(M.course.format.get_containerclass());
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 116);
var sectionnode = Y.Node.create('<'+ M.course.format.get_sectionwrappernode()+'></'+ M.course.format.get_sectionwrappernode()+'>');
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 117);
sectionnode.addClass( M.course.format.get_sectionwrapperclass());
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 118);
sectionnode.setStyle('margin', 0);
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 119);
sectionnode.setContent(drag.get('node').get('innerHTML'));
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 120);
containernode.appendChild(sectionnode);
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 121);
drag.get('dragNode').setContent(containernode);
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 122);
drag.get('dragNode').addClass(CSS.COURSECONTENT);
        },

        drag_dropmiss : function(e) {
            // Missed the target, but we assume the user intended to drop it
            // on the last last ghost node location, e.drag and e.drop should be
            // prepared by global_drag_dropmiss parent so simulate drop_hit(e).
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "drag_dropmiss", 125);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 129);
this.drop_hit(e);
        },

        drop_hit : function(e) {
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "drop_hit", 132);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 133);
var drag = e.drag;
            // Get a reference to our drag node
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 135);
var dragnode = drag.get('node');
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 136);
var dropnode = e.drop.get('node');
            // Prepare some variables
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 138);
var dragnodeid = Number(this.get_section_id(dragnode));
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 139);
var dropnodeid = Number(this.get_section_id(dropnode));

            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 141);
var loopstart = dragnodeid;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 142);
var loopend = dropnodeid;

            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 144);
if (this.goingup) {
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 145);
loopstart = dropnodeid;
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 146);
loopend = dragnodeid;
            }

            // Get the list of nodes
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 150);
drag.get('dragNode').removeClass(CSS.COURSECONTENT);
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 151);
var sectionlist = Y.Node.all(this.sectionlistselector);

            // Add lightbox if it not there
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 154);
var lightbox = M.util.add_lightbox(Y, dragnode);

            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 156);
var params = {};

            // Handle any variables which we must pass back through to
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 159);
var pageparams = this.get('config').pageparams;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 160);
for (varname in pageparams) {
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 161);
params[varname] = pageparams[varname];
            }

            // Prepare request parameters
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 165);
params.sesskey = M.cfg.sesskey;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 166);
params.courseId = this.get('courseid');
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 167);
params['class'] = 'section';
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 168);
params.field = 'move';
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 169);
params.id = dragnodeid;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 170);
params.value = dropnodeid;

            // Do AJAX request
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 173);
var uri = M.cfg.wwwroot + this.get('ajaxurl');

            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 175);
Y.io(uri, {
                method: 'POST',
                data: params,
                on: {
                    start : function(tid) {
                        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "start", 179);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 180);
lightbox.show();
                    },
                    success: function(tid, response) {
                        // Update section titles, we can't simply swap them as
                        // they might have custom title
                        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "success", 182);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 185);
try {
                            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 186);
var responsetext = Y.JSON.parse(response.responseText);
                            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 187);
if (responsetext.error) {
                                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 188);
new M.core.ajaxException(responsetext);
                            }
                            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 190);
M.course.format.process_sections(Y, sectionlist, responsetext, loopstart, loopend);
                        } catch (e) {}

                        // Classic bubble sort algorithm is applied to the section
                        // nodes between original drag node location and the new one.
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 195);
do {
                            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 196);
var swapped = false;
                            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 197);
for (var i = loopstart; i <= loopend; i++) {
                                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 198);
if (this.get_section_id(sectionlist.item(i-1)) > this.get_section_id(sectionlist.item(i))) {
                                    // Swap section id
                                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 200);
var sectionid = sectionlist.item(i-1).get('id');
                                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 201);
sectionlist.item(i-1).set('id', sectionlist.item(i).get('id'));
                                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 202);
sectionlist.item(i).set('id', sectionid);
                                    // See what format needs to swap
                                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 204);
M.course.format.swap_sections(Y, i-1, i);
                                    // Update flag
                                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 206);
swapped = true;
                                }
                            }
                            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 209);
loopend = loopend - 1;
                        }while (swapped);

                        // Finally, hide the lightbox
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 213);
window.setTimeout(function(e) {
                            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "(anonymous 3)", 213);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 214);
lightbox.hide();
                        }, 250);
                    },
                    failure: function(tid, response) {
                        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "failure", 217);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 218);
this.ajax_failure(response);
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 219);
lightbox.hide();
                    }
                },
                context:this
            });
        }

    }, {
        NAME : 'course-dragdrop-section',
        ATTRS : {
            courseid : {
                value : null
            },
            ajaxurl : {
                'value' : 0
            },
            config : {
                'value' : 0
            }
        }
    });

    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 241);
var DRAGRESOURCE = function() {
        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "DRAGRESOURCE", 241);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 242);
DRAGRESOURCE.superclass.constructor.apply(this, arguments);
    };
    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 244);
Y.extend(DRAGRESOURCE, M.core.dragdrop, {
        initializer : function(params) {
            // Set group for parent class
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "initializer", 245);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 247);
this.groups = ['resource'];
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 248);
this.samenodeclass = CSS.ACTIVITY;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 249);
this.parentnodeclass = CSS.SECTION;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 250);
this.resourcedraghandle = this.get_drag_handle(M.str.moodle.move, CSS.EDITINGMOVE, CSS.ICONCLASS);

            // Go through all sections
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 253);
var sectionlistselector = M.course.format.get_section_selector(Y);
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 254);
if (sectionlistselector) {
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 255);
sectionlistselector = '.'+CSS.COURSECONTENT+' '+sectionlistselector;
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 256);
this.setup_for_section(sectionlistselector);

                // Initialise drag & drop for all resources/activities
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 259);
var nodeselector = sectionlistselector.slice(CSS.COURSECONTENT.length+2)+' li.'+CSS.ACTIVITY;
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 260);
var del = new Y.DD.Delegate({
                    container: '.'+CSS.COURSECONTENT,
                    nodes: nodeselector,
                    target: true,
                    handles: ['.' + CSS.EDITINGMOVE],
                    dragConfig: {groups: this.groups}
                });
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 267);
del.dd.plug(Y.Plugin.DDProxy, {
                    // Don't move the node at the end of the drag
                    moveOnEnd: false,
                    cloneNode: true
                });
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 272);
del.dd.plug(Y.Plugin.DDConstrained, {
                    // Keep it inside the .course-content
                    constrain: '#'+CSS.PAGECONTENT
                });
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 276);
del.dd.plug(Y.Plugin.DDWinScroll);

                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 278);
M.course.coursebase.register_module(this);
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 279);
M.course.dragres = this;
            }
        },

         /**
         * Apply dragdrop features to the specified selector or node that refers to section(s)
         *
         * @param baseselector The CSS selector or node to limit scope to
         * @return void
         */
        setup_for_section : function(baseselector) {
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "setup_for_section", 289);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 290);
Y.Node.all(baseselector).each(function(sectionnode) {
                _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "(anonymous 4)", 290);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 291);
var resources = sectionnode.one('.'+CSS.CONTENT+' ul.'+CSS.SECTION);
                // See if resources ul exists, if not create one
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 293);
if (!resources) {
                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 294);
var resources = Y.Node.create('<ul></ul>');
                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 295);
resources.addClass(CSS.SECTION);
                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 296);
sectionnode.one('.'+CSS.CONTENT+' div.'+CSS.SUMMARY).insert(resources, 'after');
                }
                // Define empty ul as droptarget, so that item could be moved to empty list
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 299);
var tar = new Y.DD.Drop({
                    node: resources,
                    groups: this.groups,
                    padding: '20 0 20 0'
                });

                // Initialise each resource/activity in this section
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 306);
this.setup_for_resource('#'+sectionnode.get('id')+' li.'+CSS.ACTIVITY);
            }, this);
        },
        /**
         * Apply dragdrop features to the specified selector or node that refers to resource(s)
         *
         * @param baseselector The CSS selector or node to limit scope to
         * @return void
         */
        setup_for_resource : function(baseselector) {
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "setup_for_resource", 315);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 316);
Y.Node.all(baseselector).each(function(resourcesnode) {
                // Replace move icons
                _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "(anonymous 5)", 316);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 318);
var move = resourcesnode.one('a.'+CSS.EDITINGMOVE);
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 319);
if (move) {
                    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 320);
move.replace(this.resourcedraghandle.cloneNode(true));
                }
            }, this);
        },

        get_section_id : function(node) {
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "get_section_id", 325);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 326);
return Number(node.get('id').replace(/section-/i, ''));
        },

        get_resource_id : function(node) {
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "get_resource_id", 329);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 330);
return Number(node.get('id').replace(/module-/i, ''));
        },

        drag_start : function(e) {
            // Get our drag object
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "drag_start", 333);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 335);
var drag = e.target;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 336);
drag.get('dragNode').setContent(drag.get('node').get('innerHTML'));
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 337);
drag.get('dragNode').all('img.iconsmall').setStyle('vertical-align', 'baseline');
        },

        drag_dropmiss : function(e) {
            // Missed the target, but we assume the user intended to drop it
            // on the last last ghost node location, e.drag and e.drop should be
            // prepared by global_drag_dropmiss parent so simulate drop_hit(e).
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "drag_dropmiss", 340);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 344);
this.drop_hit(e);
        },

        drop_hit : function(e) {
            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "drop_hit", 347);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 348);
var drag = e.drag;
            // Get a reference to our drag node
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 350);
var dragnode = drag.get('node');
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 351);
var dropnode = e.drop.get('node');

            // Add spinner if it not there
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 354);
var spinner = M.util.add_spinner(Y, dragnode.one(CSS.COMMANDSPAN));

            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 356);
var params = {};

            // Handle any variables which we must pass back through to
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 359);
var pageparams = this.get('config').pageparams;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 360);
for (varname in pageparams) {
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 361);
params[varname] = pageparams[varname];
            }

            // Prepare request parameters
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 365);
params.sesskey = M.cfg.sesskey;
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 366);
params.courseId = this.get('courseid');
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 367);
params['class'] = 'resource';
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 368);
params.field = 'move';
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 369);
params.id = Number(this.get_resource_id(dragnode));
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 370);
params.sectionId = this.get_section_id(dropnode.ancestor(M.course.format.get_section_wrapper(Y), true));

            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 372);
if (dragnode.next()) {
                _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 373);
params.beforeId = Number(this.get_resource_id(dragnode.next()));
            }

            // Do AJAX request
            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 377);
var uri = M.cfg.wwwroot + this.get('ajaxurl');

            _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 379);
Y.io(uri, {
                method: 'POST',
                data: params,
                on: {
                    start : function(tid) {
                        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "start", 383);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 384);
this.lock_drag_handle(drag, CSS.EDITINGMOVE);
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 385);
spinner.show();
                    },
                    success: function(tid, response) {
                        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "success", 387);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 388);
this.unlock_drag_handle(drag, CSS.EDITINGMOVE);
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 389);
window.setTimeout(function(e) {
                            _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "(anonymous 6)", 389);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 390);
spinner.hide();
                        }, 250);
                    },
                    failure: function(tid, response) {
                        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "failure", 393);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 394);
this.ajax_failure(response);
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 395);
this.unlock_drag_handle(drag, CSS.SECTIONHANDLE);
                        _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 396);
spinner.hide();
                        // TODO: revert nodes location
                    }
                },
                context:this
            });
        }
    }, {
        NAME : 'course-dragdrop-resource',
        ATTRS : {
            courseid : {
                value : null
            },
            ajaxurl : {
                'value' : 0
            },
            config : {
                'value' : 0
            }
        }
    });

    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 418);
M.course = M.course || {};
    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 419);
M.course.init_resource_dragdrop = function(params) {
        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "init_resource_dragdrop", 419);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 420);
new DRAGRESOURCE(params);
    }
    _yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 422);
M.course.init_section_dragdrop = function(params) {
        _yuitest_coverfunc("build/moodle-course-dragdrop/moodle-course-dragdrop.js", "init_section_dragdrop", 422);
_yuitest_coverline("build/moodle-course-dragdrop/moodle-course-dragdrop.js", 423);
new DRAGSECTION(params);
    }


}, '@VERSION@', {
    "requires": [
        "base",
        "node",
        "io",
        "dom",
        "dd",
        "dd-scroll",
        "moodle-core-dragdrop",
        "moodle-core-notification",
        "moodle-course-coursebase"
    ]
});

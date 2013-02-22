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
_yuitest_coverage["build/moodle-core-dragdrop/moodle-core-dragdrop.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-core-dragdrop/moodle-core-dragdrop.js",
    code: []
};
_yuitest_coverage["build/moodle-core-dragdrop/moodle-core-dragdrop.js"].code=["YUI.add('moodle-core-dragdrop', function (Y, NAME) {","","var MOVEICON = {","    pix: \"i/move_2d\",","    largepix: \"i/dragdrop\",","    component: 'moodle'","};","","/*","* General DRAGDROP class, this should not be used directly,","* it is supposed to be extended by your class","*/","var DRAGDROP = function() {","    DRAGDROP.superclass.constructor.apply(this, arguments);","};","","Y.extend(DRAGDROP, Y.Base, {","    goingup : null,","    lasty   : null,","    samenodeclass : null,","    parentnodeclass : null,","    groups : [],","    lastdroptarget : null,","    initializer : function(params) {","        // Listen for all drag:start events","        Y.DD.DDM.on('drag:start', this.global_drag_start, this);","        // Listen for all drag:end events","        Y.DD.DDM.on('drag:end', this.global_drag_end, this);","        // Listen for all drag:drag events","        Y.DD.DDM.on('drag:drag', this.global_drag_drag, this);","        // Listen for all drop:over events","        Y.DD.DDM.on('drop:over', this.global_drop_over, this);","        // Listen for all drop:hit events","        Y.DD.DDM.on('drop:hit', this.global_drop_hit, this);","        // Listen for all drop:miss events","        Y.DD.DDM.on('drag:dropmiss', this.global_drag_dropmiss, this);","    },","","    get_drag_handle: function(title, classname, iconclass, large) {","        var iconname = MOVEICON.pix;","        if (large) {","            iconname = MOVEICON.largepix;","        }","        var dragicon = Y.Node.create('<img />')","            .setStyle('cursor', 'move')","            .setAttrs({","                'src' : M.util.image_url(iconname, MOVEICON.component),","                'alt' : title","            });","        if (iconclass) {","            dragicon.addClass(iconclass);","        }","","        var dragelement = Y.Node.create('<span></span>')","            .addClass(classname)","            .setAttribute('title', title)","        dragelement.appendChild(dragicon);","        return dragelement;","    },","","    lock_drag_handle: function(drag, classname) {","        // Disable dragging","        drag.removeHandle('.'+classname);","    },","","    unlock_drag_handle: function(drag, classname) {","        // Enable dragging","        drag.addHandle('.'+classname);","    },","","    ajax_failure: function(response) {","        var e = {","            name : response.status+' '+response.statusText,","            message : response.responseText","        };","        return new M.core.exception(e);","    },","","    in_group: function(target) {","        var ret = false;","        Y.each(this.groups, function(v, k) {","            if (target._groups[v]) {","                ret = true;","            }","        }, this);","        return ret;","    },","    /*","      * Drag-dropping related functions","      */","    global_drag_start : function(e) {","        // Get our drag object","        var drag = e.target;","        // Check that drag object belongs to correct group","        if (!this.in_group(drag)) {","            return;","        }","        // Set some general styles here","        drag.get('node').setStyle('opacity', '.25');","        drag.get('dragNode').setStyles({","            opacity: '.75',","            borderColor: drag.get('node').getStyle('borderColor'),","            backgroundColor: drag.get('node').getStyle('backgroundColor')","        });","        drag.get('dragNode').empty();","        this.drag_start(e);","    },","","    global_drag_end : function(e) {","        var drag = e.target;","        // Check that drag object belongs to correct group","        if (!this.in_group(drag)) {","            return;","        }","        //Put our general styles back","        drag.get('node').setStyles({","            visibility: '',","            opacity: '1'","        });","        this.drag_end(e);","    },","","    global_drag_drag : function(e) {","        var drag = e.target;","        // Check that drag object belongs to correct group","        if (!this.in_group(drag)) {","            return;","        }","        //Get the last y point","        var y = drag.lastXY[1];","        //is it greater than the lasty var?","        if (y < this.lasty) {","            //We are going up","            this.goingup = true;","        } else {","            //We are going down.","            this.goingup = false;","        }","        //Cache for next check","        this.lasty = y;","        this.drag_drag(e);","    },","","    global_drop_over : function(e) {","        // Check that drop object belong to correct group","        if (!e.drop || !e.drop.inGroup(this.groups)) {","            return;","        }","        //Get a reference to our drag and drop nodes","        var drag = e.drag.get('node');","        var drop = e.drop.get('node');","        // Save last drop target for the case of missed target processing","        this.lastdroptarget = e.drop;","        //Are we dropping on the same node?","        if (drop.hasClass(this.samenodeclass)) {","            //Are we not going up?","            if (!this.goingup) {","                drop = drop.next('.'+this.samenodeclass);","            }","            //Add the node","            e.drop.get('node').ancestor().insertBefore(drag, drop);","        } else if (drop.hasClass(this.parentnodeclass) && !drop.contains(drag)) {","            // We are dropping on parent node and it is empty","            if (this.goingup) {","                drop.append(drag);","            } else {","                drop.prepend(drag);","            }","        }","        this.drop_over(e);","    },","","    global_drag_dropmiss : function(e) {","        // drag:dropmiss does not have e.drag and e.drop properties","        // we substitute them for the ease of use. For e.drop we use,","        // this.lastdroptarget (ghost node we use for indicating where to drop)","        e.drag = e.target;","        e.drop = this.lastdroptarget;","        // Check that drag object belongs to correct group","        if (!this.in_group(e.drag)) {","            return;","        }","        // Check that drop object belong to correct group","        if (!e.drop || !e.drop.inGroup(this.groups)) {","            return;","        }","        this.drag_dropmiss(e);","    },","","    global_drop_hit : function(e) {","        // Check that drop object belong to correct group","        if (!e.drop || !e.drop.inGroup(this.groups)) {","            return;","        }","        this.drop_hit(e);","    },","","    /*","      * Abstract functions definitions","      */","    drag_start : function(e) {},","    drag_end : function(e) {},","    drag_drag : function(e) {},","    drag_dropmiss : function(e) {},","    drop_over : function(e) {},","    drop_hit : function(e) {}","}, {","    NAME : 'dragdrop',","    ATTRS : {}","});","","","}, '@VERSION@', {\"requires\": [\"base\", \"node\", \"io\", \"dom\", \"dd\", \"moodle-core-notification\"]});"];
_yuitest_coverage["build/moodle-core-dragdrop/moodle-core-dragdrop.js"].lines = {"1":0,"3":0,"13":0,"14":0,"17":0,"26":0,"28":0,"30":0,"32":0,"34":0,"36":0,"40":0,"41":0,"42":0,"44":0,"50":0,"51":0,"54":0,"57":0,"58":0,"63":0,"68":0,"72":0,"76":0,"80":0,"81":0,"82":0,"83":0,"86":0,"93":0,"95":0,"96":0,"99":0,"100":0,"105":0,"106":0,"110":0,"112":0,"113":0,"116":0,"120":0,"124":0,"126":0,"127":0,"130":0,"132":0,"134":0,"137":0,"140":0,"141":0,"146":0,"147":0,"150":0,"151":0,"153":0,"155":0,"157":0,"158":0,"161":0,"162":0,"164":0,"165":0,"167":0,"170":0,"177":0,"178":0,"180":0,"181":0,"184":0,"185":0,"187":0,"192":0,"193":0,"195":0};
_yuitest_coverage["build/moodle-core-dragdrop/moodle-core-dragdrop.js"].functions = {"DRAGDROP:13":0,"initializer:24":0,"get_drag_handle:39":0,"lock_drag_handle:61":0,"unlock_drag_handle:66":0,"ajax_failure:71":0,"(anonymous 2):81":0,"in_group:79":0,"global_drag_start:91":0,"global_drag_end:109":0,"global_drag_drag:123":0,"global_drop_over:144":0,"global_drag_dropmiss:173":0,"global_drop_hit:190":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-core-dragdrop/moodle-core-dragdrop.js"].coveredLines = 74;
_yuitest_coverage["build/moodle-core-dragdrop/moodle-core-dragdrop.js"].coveredFunctions = 15;
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 1);
YUI.add('moodle-core-dragdrop', function (Y, NAME) {

_yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 3);
var MOVEICON = {
    pix: "i/move_2d",
    largepix: "i/dragdrop",
    component: 'moodle'
};

/*
* General DRAGDROP class, this should not be used directly,
* it is supposed to be extended by your class
*/
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 13);
var DRAGDROP = function() {
    _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "DRAGDROP", 13);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 14);
DRAGDROP.superclass.constructor.apply(this, arguments);
};

_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 17);
Y.extend(DRAGDROP, Y.Base, {
    goingup : null,
    lasty   : null,
    samenodeclass : null,
    parentnodeclass : null,
    groups : [],
    lastdroptarget : null,
    initializer : function(params) {
        // Listen for all drag:start events
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "initializer", 24);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 26);
Y.DD.DDM.on('drag:start', this.global_drag_start, this);
        // Listen for all drag:end events
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 28);
Y.DD.DDM.on('drag:end', this.global_drag_end, this);
        // Listen for all drag:drag events
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 30);
Y.DD.DDM.on('drag:drag', this.global_drag_drag, this);
        // Listen for all drop:over events
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 32);
Y.DD.DDM.on('drop:over', this.global_drop_over, this);
        // Listen for all drop:hit events
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 34);
Y.DD.DDM.on('drop:hit', this.global_drop_hit, this);
        // Listen for all drop:miss events
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 36);
Y.DD.DDM.on('drag:dropmiss', this.global_drag_dropmiss, this);
    },

    get_drag_handle: function(title, classname, iconclass, large) {
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "get_drag_handle", 39);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 40);
var iconname = MOVEICON.pix;
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 41);
if (large) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 42);
iconname = MOVEICON.largepix;
        }
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 44);
var dragicon = Y.Node.create('<img />')
            .setStyle('cursor', 'move')
            .setAttrs({
                'src' : M.util.image_url(iconname, MOVEICON.component),
                'alt' : title
            });
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 50);
if (iconclass) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 51);
dragicon.addClass(iconclass);
        }

        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 54);
var dragelement = Y.Node.create('<span></span>')
            .addClass(classname)
            .setAttribute('title', title)
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 57);
dragelement.appendChild(dragicon);
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 58);
return dragelement;
    },

    lock_drag_handle: function(drag, classname) {
        // Disable dragging
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "lock_drag_handle", 61);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 63);
drag.removeHandle('.'+classname);
    },

    unlock_drag_handle: function(drag, classname) {
        // Enable dragging
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "unlock_drag_handle", 66);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 68);
drag.addHandle('.'+classname);
    },

    ajax_failure: function(response) {
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "ajax_failure", 71);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 72);
var e = {
            name : response.status+' '+response.statusText,
            message : response.responseText
        };
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 76);
return new M.core.exception(e);
    },

    in_group: function(target) {
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "in_group", 79);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 80);
var ret = false;
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 81);
Y.each(this.groups, function(v, k) {
            _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "(anonymous 2)", 81);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 82);
if (target._groups[v]) {
                _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 83);
ret = true;
            }
        }, this);
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 86);
return ret;
    },
    /*
      * Drag-dropping related functions
      */
    global_drag_start : function(e) {
        // Get our drag object
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "global_drag_start", 91);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 93);
var drag = e.target;
        // Check that drag object belongs to correct group
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 95);
if (!this.in_group(drag)) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 96);
return;
        }
        // Set some general styles here
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 99);
drag.get('node').setStyle('opacity', '.25');
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 100);
drag.get('dragNode').setStyles({
            opacity: '.75',
            borderColor: drag.get('node').getStyle('borderColor'),
            backgroundColor: drag.get('node').getStyle('backgroundColor')
        });
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 105);
drag.get('dragNode').empty();
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 106);
this.drag_start(e);
    },

    global_drag_end : function(e) {
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "global_drag_end", 109);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 110);
var drag = e.target;
        // Check that drag object belongs to correct group
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 112);
if (!this.in_group(drag)) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 113);
return;
        }
        //Put our general styles back
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 116);
drag.get('node').setStyles({
            visibility: '',
            opacity: '1'
        });
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 120);
this.drag_end(e);
    },

    global_drag_drag : function(e) {
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "global_drag_drag", 123);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 124);
var drag = e.target;
        // Check that drag object belongs to correct group
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 126);
if (!this.in_group(drag)) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 127);
return;
        }
        //Get the last y point
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 130);
var y = drag.lastXY[1];
        //is it greater than the lasty var?
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 132);
if (y < this.lasty) {
            //We are going up
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 134);
this.goingup = true;
        } else {
            //We are going down.
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 137);
this.goingup = false;
        }
        //Cache for next check
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 140);
this.lasty = y;
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 141);
this.drag_drag(e);
    },

    global_drop_over : function(e) {
        // Check that drop object belong to correct group
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "global_drop_over", 144);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 146);
if (!e.drop || !e.drop.inGroup(this.groups)) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 147);
return;
        }
        //Get a reference to our drag and drop nodes
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 150);
var drag = e.drag.get('node');
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 151);
var drop = e.drop.get('node');
        // Save last drop target for the case of missed target processing
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 153);
this.lastdroptarget = e.drop;
        //Are we dropping on the same node?
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 155);
if (drop.hasClass(this.samenodeclass)) {
            //Are we not going up?
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 157);
if (!this.goingup) {
                _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 158);
drop = drop.next('.'+this.samenodeclass);
            }
            //Add the node
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 161);
e.drop.get('node').ancestor().insertBefore(drag, drop);
        } else {_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 162);
if (drop.hasClass(this.parentnodeclass) && !drop.contains(drag)) {
            // We are dropping on parent node and it is empty
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 164);
if (this.goingup) {
                _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 165);
drop.append(drag);
            } else {
                _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 167);
drop.prepend(drag);
            }
        }}
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 170);
this.drop_over(e);
    },

    global_drag_dropmiss : function(e) {
        // drag:dropmiss does not have e.drag and e.drop properties
        // we substitute them for the ease of use. For e.drop we use,
        // this.lastdroptarget (ghost node we use for indicating where to drop)
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "global_drag_dropmiss", 173);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 177);
e.drag = e.target;
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 178);
e.drop = this.lastdroptarget;
        // Check that drag object belongs to correct group
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 180);
if (!this.in_group(e.drag)) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 181);
return;
        }
        // Check that drop object belong to correct group
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 184);
if (!e.drop || !e.drop.inGroup(this.groups)) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 185);
return;
        }
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 187);
this.drag_dropmiss(e);
    },

    global_drop_hit : function(e) {
        // Check that drop object belong to correct group
        _yuitest_coverfunc("build/moodle-core-dragdrop/moodle-core-dragdrop.js", "global_drop_hit", 190);
_yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 192);
if (!e.drop || !e.drop.inGroup(this.groups)) {
            _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 193);
return;
        }
        _yuitest_coverline("build/moodle-core-dragdrop/moodle-core-dragdrop.js", 195);
this.drop_hit(e);
    },

    /*
      * Abstract functions definitions
      */
    drag_start : function(e) {},
    drag_end : function(e) {},
    drag_drag : function(e) {},
    drag_dropmiss : function(e) {},
    drop_over : function(e) {},
    drop_hit : function(e) {}
}, {
    NAME : 'dragdrop',
    ATTRS : {}
});


}, '@VERSION@', {"requires": ["base", "node", "io", "dom", "dd", "moodle-core-notification"]});

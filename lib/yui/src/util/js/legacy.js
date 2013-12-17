/*global findParentNode, filterByParent, fix_column_width, convert_object_to_string*/
/* jshint undef:false, eqeqeq:false, unused: false */
//=== old legacy JS code, hopefully to be replaced soon by M.xx.yy and YUI3 code ===

function checkall() {
    var inputs = document.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type == 'checkbox') {
            if (inputs[i].disabled || inputs[i].readOnly) {
                continue;
            }
            inputs[i].checked = true;
        }
    }
}

function checknone() {
    var inputs = document.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; i++) {
        if (inputs[i].type == 'checkbox') {
            if (inputs[i].disabled || inputs[i].readOnly) {
                continue;
            }
            inputs[i].checked = false;
        }
    }
}

/**
 * Either check, or uncheck, all checkboxes inside the element with id is
 * @param id the id of the container
 * @param checked the new state, either '' or 'checked'.
 */
function select_all_in_element_with_id(id, checked) {
    var container = document.getElementById(id);
    if (!container) {
        return;
    }
    var inputs = container.getElementsByTagName('input');
    for (var i = 0; i < inputs.length; ++i) {
        if (inputs[i].type == 'checkbox' || inputs[i].type == 'radio') {
            inputs[i].checked = checked;
        }
    }
}

function select_all_in(elTagName, elClass, elId) {
    var inputs = document.getElementsByTagName('input');
    inputs = filterByParent(inputs, function(el) {return findParentNode(el, elTagName, elClass, elId);});
    for(var i = 0; i < inputs.length; ++i) {
        if(inputs[i].type == 'checkbox' || inputs[i].type == 'radio') {
            inputs[i].checked = 'checked';
        }
    }
}

function deselect_all_in(elTagName, elClass, elId) {
    var inputs = document.getElementsByTagName('INPUT');
    inputs = filterByParent(inputs, function(el) {return findParentNode(el, elTagName, elClass, elId);});
    for(var i = 0; i < inputs.length; ++i) {
        if(inputs[i].type == 'checkbox' || inputs[i].type == 'radio') {
            inputs[i].checked = '';
        }
    }
}

function confirm_if(expr, message) {
    if(!expr) {
        return true;
    }
    return confirm(message);
}


/*
    findParentNode (start, elementName, elementClass, elementID)

    Travels up the DOM hierarchy to find a parent element with the
    specified tag name, class, and id. All conditions must be met,
    but any can be ommitted. Returns the BODY element if no match
    found.
*/
function findParentNode(el, elName, elClass, elId) {
    while (el.nodeName.toUpperCase() != 'BODY') {
        if ((!elName || el.nodeName.toUpperCase() == elName) &&
            (!elClass || el.className.indexOf(elClass) != -1) &&
            (!elId || el.id == elId)) {
            break;
        }
        el = el.parentNode;
    }
    return el;
}
/*
    findChildNode (start, elementName, elementClass, elementID)

    Travels down the DOM hierarchy to find all child elements with the
    specified tag name, class, and id. All conditions must be met,
    but any can be ommitted.
    Doesn't examine children of matches.

    @deprecated since Moodle 2.7 - please do not use this function any more.
    @todo MDL-43242 This will be deleted in Moodle 2.9.
    @see Y.all
*/
function findChildNodes(start, tagName, elementClass, elementID, elementName) {
    Y.log("findChildNodes() is deprecated. Please use Y.all instead.",
            "warn", "javascript-static.js");
    var children = [];
    for (var i = 0; i < start.childNodes.length; i++) {
        var classfound = false;
        var child = start.childNodes[i];
        if((child.nodeType == 1) &&//element node type
                  (elementClass && (typeof(child.className)=='string'))) {
            var childClasses = child.className.split(/\s+/);
            for (var childClassIndex in childClasses) {
                if (childClasses[childClassIndex]==elementClass) {
                    classfound = true;
                    break;
                }
            }
        }
        if(child.nodeType == 1) { //element node type
            if  ( (!tagName || child.nodeName == tagName) &&
                (!elementClass || classfound)&&
                (!elementID || child.id == elementID) &&
                (!elementName || child.name == elementName))
            {
                children = children.concat(child);
            } else {
                children = children.concat(findChildNodes(child, tagName, elementClass, elementID, elementName));
            }
        }
    }
    return children;
}

function unmaskPassword(id) {
    var pw = document.getElementById(id);
    var chb = document.getElementById(id+'unmask');
    var newpw;

    // MDL-30438 - The capability to changing the value of input type is not supported by IE8 or lower.
    // Replacing existing child with a new one, removed all yui properties for the node.  Therefore, this
    // functionality won't work in IE8 or lower.
    // This is a temporary fixed to allow other browsers to function properly.
    if (Y.UA.ie === 0 || Y.UA.ie >= 9) {
        if (chb.checked) {
            pw.type = "text";
        } else {
            pw.type = "password";
        }
    } else {  //IE Browser version 8 or lower
        try {
            // first try IE way - it can not set name attribute later
            if (chb.checked) {
              newpw = document.createElement('<input type="text" autocomplete="off" name="'+pw.name+'">');
            } else {
              newpw = document.createElement('<input type="password" autocomplete="off" name="'+pw.name+'">');
            }
            newpw.attributes['class'].nodeValue = pw.attributes['class'].nodeValue;
        } catch (e) {
            var newpw = document.createElement('input');
            newpw.setAttribute('autocomplete', 'off');
            newpw.setAttribute('name', pw.name);
            if (chb.checked) {
              newpw.setAttribute('type', 'text');
            } else {
              newpw.setAttribute('type', 'password');
            }
            newpw.setAttribute('class', pw.getAttribute('class'));
        }
        newpw.id = pw.id;
        newpw.size = pw.size;
        newpw.onblur = pw.onblur;
        newpw.onchange = pw.onchange;
        newpw.value = pw.value;
        pw.parentNode.replaceChild(newpw, pw);
    }
}

function filterByParent(elCollection, parentFinder) {
    var filteredCollection = [];
    for (var i = 0; i < elCollection.length; ++i) {
        var findParent = parentFinder(elCollection[i]);
        if (findParent.nodeName.toUpperCase() != 'BODY') {
            filteredCollection.push(elCollection[i]);
        }
    }
    return filteredCollection;
}

/*
    All this is here just so that IE gets to handle oversized blocks
    in a visually pleasing manner. It does a browser detect. So sue me.
*/

function fix_column_widths() {
    var agt = navigator.userAgent.toLowerCase();
    if ((agt.indexOf("msie") != -1) && (agt.indexOf("opera") == -1)) {
        fix_column_width('left-column');
        fix_column_width('right-column');
    }
}

function fix_column_width(colName) {
    var column = document.getElementById(colName);
    if(column) {
        if(!column.offsetWidth) {
            setTimeout("fix_column_width('" + colName + "')", 20);
            return;
        }

        var width = 0;
        var nodes = column.childNodes;

        for(i = 0; i < nodes.length; ++i) {
            if(nodes[i].className.indexOf("block") != -1 ) {
                if(width < nodes[i].offsetWidth) {
                    width = nodes[i].offsetWidth;
                }
            }
        }

        for(i = 0; i < nodes.length; ++i) {
            if(nodes[i].className.indexOf("block") != -1 ) {
                nodes[i].style.width = width + 'px';
            }
        }
    }
}


/*
   Insert myValue at current cursor position
 */
function insertAtCursor(myField, myValue) {
    // IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    // Mozilla/Netscape support
    else if (myField.selectionStart || myField.selectionStart == '0') {
        var startPos = myField.selectionStart;
        var endPos = myField.selectionEnd;
        myField.value = myField.value.substring(0, startPos)
            + myValue + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }
}


/*
        Call instead of setting window.onload directly or setting body onload=.
        Adds your function to a chain of functions rather than overwriting anything
        that exists.
        @deprecated Since Moodle 2.7. This will be removed in Moodle 2.9.
*/
function addonload(fn) {
    Y.log('addonload has been deprecated since Moodle 2.7 and will be removed in Moodle 2.9',
            'warn', 'javascript-static.js');
    var oldhandler=window.onload;
    window.onload=function() {
        if (oldhandler) {
            oldhandler();
        }
        fn();
    };
}
/**
 * Replacement for getElementsByClassName in browsers that aren't cool enough
 *
 * Relying on the built-in getElementsByClassName is far, far faster than
 * using YUI.
 *
 * Note: the third argument used to be an object with odd behaviour. It now
 * acts like the 'name' in the HTML5 spec, though the old behaviour is still
 * mimicked if you pass an object.
 *
 * @param {Node} oElm The top-level node for searching. To search a whole
 *                    document, use `document`.
 * @param {String} strTagName filter by tag names
 * @param {String} name same as HTML5 spec
 * @deprecated Since Moodle 2.7. This will be removed in Moodle 2.9.
 */
function getElementsByClassName(oElm, strTagName, name) {
    Y.log('getElementsByClassName has been deprecated since Moodle 2.7 and will be removed in Moodle 2.9',
            'warn', 'javascript-static.js');
    var names = [],
        i;
    // for backwards compatibility
    if(typeof name == "object") {
        for(i=0; i<name.length; i++) {
            names.push(names[i]);
        }
        name = names.join('');
    }
    // use native implementation if possible
    if (oElm.getElementsByClassName && Array.filter) {
        if (strTagName == '*') {
            return oElm.getElementsByClassName(name);
        } else {
            return Array.filter(oElm.getElementsByClassName(name), function(el) {
                return el.nodeName.toLowerCase() == strTagName.toLowerCase();
            });
        }
    }
    // native implementation unavailable, fall back to slow method
    var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
    var arrReturnElements = [];
    var arrRegExpClassNames = [];
    names = name.split(' ');
    for(i=0; i<names.length; i++) {
        arrRegExpClassNames.push(new RegExp("(^|\\s)" + names[i].replace(/\-/g, "\\-") + "(\\s|$)"));
    }
    var oElement;
    var bMatchesAll;
    for(var j=0; j<arrElements.length; j++) {
        oElement = arrElements[j];
        bMatchesAll = true;
        for(var k=0; k<arrRegExpClassNames.length; k++) {
            if(!arrRegExpClassNames[k].test(oElement.className)) {
                bMatchesAll = false;
                break;
            }
        }
        if(bMatchesAll) {
            arrReturnElements.push(oElement);
        }
    }
    return (arrReturnElements);
}

/**
 * Increment a file name.
 *
 * @param string file name.
 * @param boolean ignoreextension do not extract the extension prior to appending the
 *                                suffix. Useful when incrementing folder names.
 * @return string the incremented file name.
 */
function increment_filename(filename, ignoreextension) {
    var extension = '';
    var basename = filename;

    // Split the file name into the basename + extension.
    if (!ignoreextension) {
        var dotpos = filename.lastIndexOf('.');
        if (dotpos !== -1) {
            basename = filename.substr(0, dotpos);
            extension = filename.substr(dotpos, filename.length);
        }
    }

    // Look to see if the name already has (NN) at the end of it.
    var number = 0;
    var hasnumber = basename.match(/^(.*) \((\d+)\)$/);
    if (hasnumber !== null) {
        // Note the current number & remove it from the basename.
        number = parseInt(hasnumber[2], 10);
        basename = hasnumber[1];
    }

    number++;
    var newname = basename + ' (' + number + ')' + extension;
    return newname;
}

/**
 * Return whether we are in right to left mode or not.
 *
 * @return boolean
 */
function right_to_left() {
    var body = Y.one('body');
    var rtl = false;
    if (body && body.hasClass('dir-rtl')) {
        rtl = true;
    }
    return rtl;
}

function openpopup(event, args) {

    if (event) {
        if (event.preventDefault) {
            event.preventDefault();
        } else {
            event.returnValue = false;
        }
    }

    // Make sure the name argument is set and valid.
    var nameregex = /[^a-z0-9_]/i;
    if (typeof args.name !== 'string') {
        args.name = '_blank';
    } else if (args.name.match(nameregex)) {
        // Cleans window name because IE does not support funky ones.
        if (M.cfg.developerdebug) {
            alert('DEVELOPER NOTICE: Invalid \'name\' passed to openpopup(): ' + args.name);
        }
        args.name = args.name.replace(nameregex, '_');
    }

    var fullurl = args.url;
    if (!args.url.match(/https?:\/\//)) {
        fullurl = M.cfg.wwwroot + args.url;
    }
    if (args.fullscreen) {
        args.options = args.options.
                replace(/top=\d+/, 'top=0').
                replace(/left=\d+/, 'left=0').
                replace(/width=\d+/, 'width=' + screen.availWidth).
                replace(/height=\d+/, 'height=' + screen.availHeight);
    }
    var windowobj = window.open(fullurl,args.name,args.options);
    if (!windowobj) {
        return true;
    }

    if (args.fullscreen) {
        // In some browser / OS combinations (E.g. Chrome on Windows), the
        // window initially opens slighly too big. The width and heigh options
        // seem to control the area inside the browser window, so what with
        // scroll-bars, etc. the actual window is bigger than the screen.
        // Therefore, we need to fix things up after the window is open.
        var hackcount = 100;
        var get_size_exactly_right = function() {
            windowobj.moveTo(0, 0);
            windowobj.resizeTo(screen.availWidth, screen.availHeight);

            // Unfortunately, it seems that in Chrome on Ubuntu, if you call
            // something like windowobj.resizeTo(1280, 1024) too soon (up to
            // about 50ms) after the window is open, then it actually behaves
            // as if you called windowobj.resizeTo(0, 0). Therefore, we need to
            // check that the resize actually worked, and if not, repeatedly try
            // again after a short delay until it works (but with a limit of
            // hackcount repeats.
            if (hackcount > 0 && (windowobj.innerHeight < 10 || windowobj.innerWidth < 10)) {
                hackcount -= 1;
                setTimeout(get_size_exactly_right, 10);
            }
        };
        setTimeout(get_size_exactly_right, 0);
    }
    windowobj.focus();

    return false;
}

/** Close the current browser window. */
function close_window(e) {
    if (e.preventDefault) {
        e.preventDefault();
    } else {
        e.returnValue = false;
    }
    window.close();
}

/**
 * Used in a couple of modules to hide navigation areas when using AJAX
 * @deprecated since Moodle 2.7. This function will be removed in Moodle 2.9.
 */
function show_item(itemid) {
    Y.log('show_item has been deprecated since Moodle 2.7 and will be removed in Moodle 2.9',
            'warn', 'javascript-static.js');
    var item = Y.one('#' + itemid);
    if (item) {
        item.show();
    }
}

// Deprecated since Moodle 2.7. This function will be removed in Moodle 2.9.
function destroy_item(itemid) {
    Y.log('destroy_item has been deprecated since Moodle 2.7 and will be removed in Moodle 2.9',
            'warn', 'javascript-static.js');
    var item = Y.one('#' + itemid);
    if (item) {
        item.remove(true);
    }
}
/**
 * Tranfer keyboard focus to the HTML element with the given id, if it exists.
 * @param controlid the control id.
 */
function focuscontrol(controlid) {
    var control = document.getElementById(controlid);
    if (control) {
        control.focus();
    }
}

/**
 * Transfers keyboard focus to an HTML element based on the old style style of focus
 * This function should be removed as soon as it is no longer used
 */
function old_onload_focus(formid, controlname) {
    if (document.forms[formid] && document.forms[formid].elements && document.forms[formid].elements[controlname]) {
        document.forms[formid].elements[controlname].focus();
    }
}

function build_querystring(obj) {
    return convert_object_to_string(obj, '&');
}

function build_windowoptionsstring(obj) {
    return convert_object_to_string(obj, ',');
}

function convert_object_to_string(obj, separator) {
    if (typeof obj !== 'object') {
        return null;
    }
    var list = [];
    for(var k in obj) {
        k = encodeURIComponent(k);
        var value = obj[k];
        if(obj[k] instanceof Array) {
            for(var i in value) {
                list.push(k+'[]='+encodeURIComponent(value[i]));
            }
        } else {
            list.push(k+'='+encodeURIComponent(value));
        }
    }
    return list.join(separator);
}

function stripHTML(str) {
    var re = /<\S[^><]*>/g;
    var ret = str.replace(re, "");
    return ret;
}

Number.prototype.fixed=function(n){
    with(Math) {
        return round(Number(this)*pow(10,n))/pow(10,n);
    }
};
function update_progress_bar (id, width, pt, msg, es){
    var percent = pt;
    var status = document.getElementById("status_"+id);
    var percent_indicator = document.getElementById("pt_"+id);
    var progress_bar = document.getElementById("progress_"+id);
    var time_es = document.getElementById("time_"+id);
    status.innerHTML = msg;
    percent_indicator.innerHTML = percent.fixed(2) + '%';
    if(percent == 100) {
        progress_bar.style.background = "green";
        time_es.style.display = "none";
    } else {
        progress_bar.style.background = "#FFCC66";
        if (es == '?'){
            time_es.innerHTML = "";
        }else {
            time_es.innerHTML = es.fixed(2)+" sec";
            time_es.style.display
                = "block";
        }
    }
    progress_bar.style.width = width + "px";

}


// ===== Deprecated core Javascript functions for Moodle ====
//       DO NOT USE!!!!!!!
// Do not put this stuff in separate file because it only adds extra load on servers!

/**
 * Used in a couple of modules to hide navigation areas when using AJAX
 * @deprecated since Moodle 2.7. This function will be removed in Moodle 2.9.
 */
function hide_item(itemid) {
    Y.log('hide_item has been deprecated since Moodle 2.7 and will be removed in Moodle 2.9',
            'warn', 'javascript-static.js');
    var item = Y.one('#' + itemid);
    if (item) {
        item.hide();
    }
}

M.util.help_popups = {
    setup : function(Y) {
        Y.one('body').delegate('click', this.open_popup, 'a.helplinkpopup', this);
    },
    open_popup : function(e) {
        // Prevent the default page action
        e.preventDefault();

        // Grab the anchor that was clicked
        var anchor = e.target.ancestor('a', true);
        var args = {
            'name'          : 'popup',
            'url'           : anchor.getAttribute('href'),
            'options'       : ''
        };
        var options = [
            'height=600',
            'width=800',
            'top=0',
            'left=0',
            'menubar=0',
            'location=0',
            'scrollbars',
            'resizable',
            'toolbar',
            'status',
            'directories=0',
            'fullscreen=0',
            'dependent'
        ];
        args.options = options.join(',');

        openpopup(e, args);
    }
};

/**
 * Custom menu namespace
 */
M.core_custom_menu = {
    /**
     * This method is used to initialise a custom menu given the id that belongs
     * to the custom menu's root node.
     *
     * @param {YUI} Y
     * @param {string} nodeid
     */
    init : function(Y, nodeid) {
        var node = Y.one('#'+nodeid);
        if (node) {
            Y.use('node-menunav', function(Y) {
                // Get the node
                // Remove the javascript-disabled class.... obviously javascript is enabled.
                node.removeClass('javascript-disabled');
                // Initialise the menunav plugin
                node.plug(Y.Plugin.NodeMenuNav);
            });
        }
    }
};

/**
 * Used to store form manipulation methods and enhancments
 */
M.form = M.form || {};

/**
 * Converts a nbsp indented select box into a multi drop down custom control much
 * like the custom menu. It also selectable categories on or off.
 *
 * $form->init_javascript_enhancement('elementname','smartselect', array('selectablecategories'=>true|false, 'mode'=>'compact'|'spanning'));
 *
 * @param {YUI} Y
 * @param {string} id
 * @param {Array} options
 */
M.form.init_smartselect = function(Y, id, options) {
    if (!id.match(/^id_/)) {
        id = 'id_'+id;
    }
    var select = Y.one('select#'+id);
    if (!select) {
        return false;
    }
    Y.use('event-delegate',function(){
        var smartselect = {
            id : id,
            structure : [],
            options : [],
            submenucount : 0,
            currentvalue : null,
            currenttext : null,
            shownevent : null,
            cfg : {
                selectablecategories : true,
                mode : null
            },
            nodes : {
                select : null,
                loading : null,
                menu : null
            },
            init : function(Y, id, args, nodes) {
                var i;
                if (typeof(args)=='object') {
                    for (i in this.cfg) {
                        if (args[i] || args[i]===false) {
                            this.cfg[i] = args[i];
                        }
                    }
                }

                // Display a loading message first up
                this.nodes.select = nodes.select;

                this.currentvalue = this.nodes.select.get('selectedIndex');
                this.currenttext = this.nodes.select.all('option').item(this.currentvalue).get('innerHTML');

                var options = [];
                options[''] = {text:this.currenttext,value:'',depth:0,children:[]};
                this.nodes.select.all('option').each(function(option, index) {
                    var rawtext = option.get('innerHTML');
                    var text = rawtext.replace(/^(&nbsp;)*/, '');
                    var depth;
                    if (rawtext === text) {
                        text = rawtext.replace(/^(\s)*/, '');
                        depth = (rawtext.length - text.length ) + 1;
                    } else {
                        depth = ((rawtext.length - text.length )/12)+1;
                    }
                    option.set('innerHTML', text);
                    options['i'+index] = {text:text,depth:depth,index:index,children:[]};
                }, this);

                this.structure = [];
                var structcount = 0;
                for (i in options) {
                    var o = options[i];
                    if (o.depth === 0) {
                        this.structure.push(o);
                        structcount++;
                    } else {
                        var d = o.depth;
                        var current = this.structure[structcount-1];
                        for (var j = 0; j < o.depth-1;j++) {
                            if (current && current.children) {
                                current = current.children[current.children.length-1];
                            }
                        }
                        if (current && current.children) {
                            current.children.push(o);
                        }
                    }
                }

                this.nodes.menu = Y.Node.create(this.generate_menu_content());
                this.nodes.menu.one('.smartselect_mask').setStyle('opacity', 0.01);
                this.nodes.menu.one('.smartselect_mask').setStyle('width', (this.nodes.select.get('offsetWidth')+5)+'px');
                this.nodes.menu.one('.smartselect_mask').setStyle('height', (this.nodes.select.get('offsetHeight'))+'px');

                if (this.cfg.mode === null) {
                    var formwidth = this.nodes.select.ancestor('form').get('offsetWidth');
                    if (formwidth < 400 || this.nodes.menu.get('offsetWidth') < formwidth*2) {
                        this.cfg.mode = 'compact';
                    } else {
                        this.cfg.mode = 'spanning';
                    }
                }

                if (this.cfg.mode == 'compact') {
                    this.nodes.menu.addClass('compactmenu');
                } else {
                    this.nodes.menu.addClass('spanningmenu');
                    this.nodes.menu.delegate('mouseover', this.show_sub_menu, '.smartselect_submenuitem', this);
                }

                Y.one(document.body).append(this.nodes.menu);
                var pos = this.nodes.select.getXY();
                pos[0] += 1;
                this.nodes.menu.setXY(pos);
                this.nodes.menu.on('click', this.handle_click, this);

                Y.one(window).on('resize', function(){
                     var pos = this.nodes.select.getXY();
                    pos[0] += 1;
                    this.nodes.menu.setXY(pos);
                 }, this);
            },
            generate_menu_content : function() {
                var content = '<div id="'+this.id+'_smart_select" class="smartselect">';
                content += this.generate_submenu_content(this.structure[0], true);
                content += '</ul></div>';
                return content;
            },
            generate_submenu_content : function(item, rootelement) {
                this.submenucount++;
                var content = '';
                if (item.children.length > 0) {
                    if (rootelement) {
                        content += '<div class="smartselect_mask" href="#ss_submenu'+this.submenucount+'">&nbsp;</div>';
                        content += '<div id="ss_submenu'+this.submenucount+'" class="smartselect_menu">';
                        content += '<div class="smartselect_menu_content">';
                    } else {
                        content += '<li class="smartselect_submenuitem">';
                        var categoryclass = (this.cfg.selectablecategories)?'selectable':'notselectable';
                        content += '<a class="smartselect_menuitem_label '+categoryclass+'" href="#ss_submenu'+this.submenucount+'" value="'+item.index+'">'+item.text+'</a>';
                        content += '<div id="ss_submenu'+this.submenucount+'" class="smartselect_submenu">';
                        content += '<div class="smartselect_submenu_content">';
                    }
                    content += '<ul>';
                    for (var i in item.children) {
                        content += this.generate_submenu_content(item.children[i],false);
                    }
                    content += '</ul>';
                    content += '</div>';
                    content += '</div>';
                    if (rootelement) {
                        content += '';
                    } else {
                        content += '</li>';
                    }
                } else {
                    content += '<li class="smartselect_menuitem">';
                    content += '<a class="smartselect_menuitem_content selectable" href="#" value="'+item.index+'">'+item.text+'</a>';
                    content += '</li>';
                }
                return content;
            },
            select : function(e) {
                var t = e.target;
                e.halt();
                this.currenttext = t.get('innerHTML');
                this.currentvalue = t.getAttribute('value');
                this.nodes.select.set('selectedIndex', this.currentvalue);
                this.hide_menu();
            },
            handle_click : function(e) {
                var target = e.target;
                if (target.hasClass('smartselect_mask')) {
                    this.show_menu(e);
                } else if (target.hasClass('selectable') || target.hasClass('smartselect_menuitem')) {
                    this.select(e);
                } else if (target.hasClass('smartselect_menuitem_label') || target.hasClass('smartselect_submenuitem')) {
                    this.show_sub_menu(e);
                }
            },
            show_menu : function(e) {
                e.halt();
                var menu = e.target.ancestor().one('.smartselect_menu');
                menu.addClass('visible');
                this.shownevent = Y.one(document.body).on('click', this.hide_menu, this);
            },
            show_sub_menu : function(e) {
                e.halt();
                var target = e.target;
                if (!target.hasClass('smartselect_submenuitem')) {
                    target = target.ancestor('.smartselect_submenuitem');
                }
                if (this.cfg.mode == 'compact' && target.one('.smartselect_submenu').hasClass('visible')) {
                    target.ancestor('ul').all('.smartselect_submenu.visible').removeClass('visible');
                    return;
                }
                target.ancestor('ul').all('.smartselect_submenu.visible').removeClass('visible');
                target.one('.smartselect_submenu').addClass('visible');
            },
            hide_menu : function() {
                this.nodes.menu.all('.visible').removeClass('visible');
                if (this.shownevent) {
                    this.shownevent.detach();
                }
            }
        };
        smartselect.init(Y, id, options, {select:select});
    });
};

/** List of flv players to be loaded */
M.util.video_players = [];
/** List of mp3 players to be loaded */
M.util.audio_players = [];

/**
 * Add video player
 * @param id element id
 * @param fileurl media url
 * @param width
 * @param height
 * @param autosize true means detect size from media
 */
M.util.add_video_player = function (id, fileurl, width, height, autosize) {
    M.util.video_players.push({id: id, fileurl: fileurl, width: width, height: height, autosize: autosize, resized: false});
};

/**
 * Add audio player.
 * @param id
 * @param fileurl
 * @param small
 */
M.util.add_audio_player = function (id, fileurl, small) {
    M.util.audio_players.push({id: id, fileurl: fileurl, small: small});
};

/**
 * Initialise all audio and video player, must be called from page footer.
 */
M.util.load_flowplayer = function() {
    if (M.util.video_players.length === 0 && M.util.audio_players.length === 0) {
        return;
    }
    if (typeof(flowplayer) == 'undefined') {
        var loaded = false;

        var embed_function = function() {
            var src,
                i,
                video;
            if (loaded || typeof(flowplayer) == 'undefined') {
                return;
            }
            loaded = true;

            var controls = {
                    autoHide: true
            };
            /* TODO: add CSS color overrides for the flv flow player */

            for (i=0; i<M.util.video_players.length; i++) {
                video = M.util.video_players[i];
                if (video.width > 0 && video.height > 0) {
                    src = {src: M.cfg.wwwroot + '/lib/flowplayer/flowplayer-3.2.16.swf', width: video.width, height: video.height};
                } else {
                    src = M.cfg.wwwroot + '/lib/flowplayer/flowplayer-3.2.16.swf';
                }
                flowplayer(video.id, src, {
                    plugins: {controls: controls},
                    clip: {
                        url: video.fileurl, autoPlay: false, autoBuffering: true, scaling: 'fit', mvideo: video,
                        onMetaData: function(clip) {
                            var width,
                                height;
                            if (clip.mvideo.autosize && !clip.mvideo.resized) {
                                clip.mvideo.resized = true;
                                //alert("metadata!!! "+clip.width+' '+clip.height+' '+JSON.stringify(clip.metaData));
                                if (typeof(clip.metaData.width) == 'undefined' || typeof(clip.metaData.height) == 'undefined') {
                                    // bad luck, we have to guess - we may not get metadata at all
                                    width = clip.width;
                                    height = clip.height;
                                } else {
                                    width = clip.metaData.width;
                                    height = clip.metaData.height;
                                }
                                var minwidth = 300; // controls are messed up in smaller objects
                                if (width < minwidth) {
                                    height = (height * minwidth) / width;
                                    width = minwidth;
                                }

                                var object = this._api();
                                object.width = width;
                                object.height = height;
                            }
                        }
                    }
                });
            }
            if (M.util.audio_players.length === 0) {
                return;
            }
            controls = {
                    autoHide: false,
                    fullscreen: false,
                    next: false,
                    previous: false,
                    scrubber: true,
                    play: true,
                    pause: true,
                    volume: true,
                    mute: false,
                    backgroundGradient: [0.5,0,0.3]
                };

            var rule;
            for (var j=0; j < document.styleSheets.length; j++) {

                // To avoid javascript security violation accessing cross domain stylesheets
                var allrules = false;
                try {
                    if (typeof (document.styleSheets[j].rules) != 'undefined') {
                        allrules = document.styleSheets[j].rules;
                    } else if (typeof (document.styleSheets[j].cssRules) != 'undefined') {
                        allrules = document.styleSheets[j].cssRules;
                    } else {
                        // why??
                        continue;
                    }
                } catch (e) {
                    continue;
                }

                // On cross domain style sheets Chrome V8 allows access to rules but returns null
                if (!allrules) {
                    continue;
                }

                for(i=0; i<allrules.length; i++) {
                    rule = '';
                    if (/^\.mp3flowplayer_.*Color$/.test(allrules[i].selectorText)) {
                        if (typeof(allrules[i].cssText) != 'undefined') {
                            rule = allrules[i].cssText;
                        } else if (typeof(allrules[i].style.cssText) != 'undefined') {
                            rule = allrules[i].style.cssText;
                        }
                        if (rule !== '' && /.*color\s*:\s*([^;]+).*/gi.test(rule)) {
                            rule = rule.replace(/.*color\s*:\s*([^;]+).*/gi, '$1');
                            var colprop = allrules[i].selectorText.replace(/^\.mp3flowplayer_/, '');
                            controls[colprop] = rule;
                        }
                    }
                }
                allrules = false;
            }

            for(i=0; i<M.util.audio_players.length; i++) {
                var audio = M.util.audio_players[i];
                if (audio.small) {
                    controls.controlall = false;
                    controls.height = 15;
                    controls.time = false;
                } else {
                    controls.controlall = true;
                    controls.height = 25;
                    controls.time = true;
                }
                flowplayer(audio.id, M.cfg.wwwroot + '/lib/flowplayer/flowplayer-3.2.16.swf', {
                    plugins: {controls: controls, audio: {url: M.cfg.wwwroot + '/lib/flowplayer/flowplayer.audio-3.2.10.swf'}},
                    clip: {url: audio.fileurl, provider: "audio", autoPlay: false}
                });
            }
        };

        var jsurl;

        if (M.cfg.jsrev == -1) {
            jsurl = M.cfg.wwwroot + '/lib/flowplayer/flowplayer-3.2.12.js';
        } else {
            jsurl = M.cfg.wwwroot + '/lib/javascript.php?jsfile=/lib/flowplayer/flowplayer-3.2.12.min.js&rev=' + M.cfg.jsrev;
        }
        var fileref = document.createElement('script');
        fileref.setAttribute('type','text/javascript');
        fileref.setAttribute('src', jsurl);
        fileref.onload = embed_function;
        fileref.onreadystatechange = embed_function;
        document.getElementsByTagName('head')[0].appendChild(fileref);
    }
};

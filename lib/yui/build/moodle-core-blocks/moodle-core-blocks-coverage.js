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
_yuitest_coverage["build/moodle-core-blocks/moodle-core-blocks.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-core-blocks/moodle-core-blocks.js",
    code: []
};
_yuitest_coverage["build/moodle-core-blocks/moodle-core-blocks.js"].code=["YUI.add('moodle-core-blocks', function (Y, NAME) {","","var AJAXURL = '/lib/ajax/blocks.php',","CSS = {","    BLOCK : 'block',","    BLOCKREGION : 'block-region',","    BLOCKADMINBLOCK : 'block_adminblock',","    EDITINGMOVE : 'editing_move',","    HEADER : 'header',","    LIGHTBOX : 'lightbox',","    REGIONCONTENT : 'region-content',","    SKIPBLOCK : 'skip-block',","    SKIPBLOCKTO : 'skip-block-to',","    MYINDEX : 'page-my-index',","    REGIONMAIN : 'region-main'","};","","var DRAGBLOCK = function() {","    DRAGBLOCK.superclass.constructor.apply(this, arguments);","};","Y.extend(DRAGBLOCK, M.core.dragdrop, {","    skipnodetop : null,","    skipnodebottom : null,","    dragsourceregion : null,","    initializer : function() {","        // Set group for parent class","        this.groups = ['block'];","        this.samenodeclass = CSS.BLOCK;","        this.parentnodeclass = CSS.REGIONCONTENT;","","        // Add relevant classes and ID to 'content' block region on My Home page.","        var myhomecontent = Y.Node.all('body#'+CSS.MYINDEX+' #'+CSS.REGIONMAIN+' > .'+CSS.REGIONCONTENT);","        if (myhomecontent.size() > 0) {","            var contentregion = myhomecontent.item(0);","            contentregion.addClass(CSS.BLOCKREGION);","            contentregion.set('id', CSS.REGIONCONTENT);","            contentregion.one('div').addClass(CSS.REGIONCONTENT);","        }","","        // Initialise blocks dragging","        // Find all block regions on the page","        var blockregionlist = Y.Node.all('div.'+CSS.BLOCKREGION);","","        if (blockregionlist.size() === 0) {","            return false;","        }","","        // See if we are missing either of block regions,","        // if yes we need to add an empty one to use as target","        if (blockregionlist.size() !== this.get('regions').length) {","            var blockregion = Y.Node.create('<div></div>')","                .addClass(CSS.BLOCKREGION);","            var regioncontent = Y.Node.create('<div></div>')","                .addClass(CSS.REGIONCONTENT);","            blockregion.appendChild(regioncontent);","            var pre = blockregionlist.filter('#region-pre');","            var post = blockregionlist.filter('#region-post');","","            if (pre.size() === 0 && post.size() === 1) {","                // pre block is missing, instert it before post","                blockregion.setAttrs({id : 'region-pre'});","                post.item(0).insert(blockregion, 'before');","                blockregionlist.unshift(blockregion);","            } else if (post.size() === 0 && pre.size() === 1) {","                // post block is missing, instert it after pre","                blockregion.setAttrs({id : 'region-post'});","                pre.item(0).insert(blockregion, 'after');","                blockregionlist.push(blockregion);","            }","        }","","        blockregionlist.each(function(blockregionnode) {","","            // Setting blockregion as droptarget (the case when it is empty)","            // The region-post (the right one)","            // is very narrow, so add extra padding on the left to drop block on it.","            var tar = new Y.DD.Drop({","                node: blockregionnode.one('div.'+CSS.REGIONCONTENT),","                groups: this.groups,","                padding: '40 240 40 240'","            });","","            // Make each div element in the list of blocks draggable","            var del = new Y.DD.Delegate({","                container: blockregionnode,","                nodes: '.'+CSS.BLOCK,","                target: true,","                handles: ['.'+CSS.HEADER],","                invalid: '.block-hider-hide, .block-hider-show, .moveto',","                dragConfig: {groups: this.groups}","            });","            del.dd.plug(Y.Plugin.DDProxy, {","                // Don't move the node at the end of the drag","                moveOnEnd: false","            });","            del.dd.plug(Y.Plugin.DDWinScroll);","","            var blocklist = blockregionnode.all('.'+CSS.BLOCK);","            blocklist.each(function(blocknode) {","                var move = blocknode.one('a.'+CSS.EDITINGMOVE);","                if (move) {","                    move.remove();","                    blocknode.one('.'+CSS.HEADER).setStyle('cursor', 'move');","                }","            }, this);","        }, this);","    },","","    get_block_id : function(node) {","        return Number(node.get('id').replace(/inst/i, ''));","    },","","    get_block_region : function(node) {","        var region = node.ancestor('div.'+CSS.BLOCKREGION).get('id').replace(/region-/i, '');","        if (Y.Array.indexOf(this.get('regions'), region) === -1) {","            // Must be standard side-X","            return 'side-' + region;","        }","        // Perhaps custom region","        return region;","    },","","    get_region_id : function(node) {","        return node.get('id').replace(/region-/i, '');","    },","","    drag_start : function(e) {","        // Get our drag object","        var drag = e.target;","","        // Store the parent node of original drag node (block)","        // we will need it later for show/hide empty regions","        this.dragsourceregion = drag.get('node').ancestor('div.'+CSS.BLOCKREGION);","","        // Determine skipnodes and store them","        if (drag.get('node').previous() && drag.get('node').previous().hasClass(CSS.SKIPBLOCK)) {","            this.skipnodetop = drag.get('node').previous();","        }","        if (drag.get('node').next() && drag.get('node').next().hasClass(CSS.SKIPBLOCKTO)) {","            this.skipnodebottom = drag.get('node').next();","        }","    },","","    drop_over : function(e) {","        // Get a reference to our drag and drop nodes","        var drag = e.drag.get('node');","        var drop = e.drop.get('node');","","        // We need to fix the case when parent drop over event has determined","        // 'goingup' and appended the drag node after admin-block.","        if (drop.hasClass(this.parentnodeclass) && drop.one('.'+CSS.BLOCKADMINBLOCK) && drop.one('.'+CSS.BLOCKADMINBLOCK).next('.'+CSS.BLOCK)) {","            drop.prepend(drag);","        }","","        // Block is moved within the same region","        // stop here, no need to modify anything.","        if (this.dragsourceregion.contains(drop)) {","            return false;","        }","","        // TODO: Hiding-displaying block region only works for base theme blocks","        // (region-pre, region-post) at the moment. It should be improved","        // to work with custom block regions as well.","","        // TODO: Fix this for the case when user drag block towards empty section,","        // then the section appears, then user chnages his mind and moving back to","        // original section. The opposite section remains opened and empty.","","        var documentbody = Y.one('body');","        // Moving block towards hidden region-content, display it","        var regionname = this.get_region_id(this.dragsourceregion);","        if (documentbody.hasClass('side-'+regionname+'-only')) {","            documentbody.removeClass('side-'+regionname+'-only');","        }","","        // Moving from empty region-content towards the opposite one,","        // hide empty one (only for region-pre, region-post areas at the moment).","        regionname = this.get_region_id(drop.ancestor('div.'+CSS.BLOCKREGION));","        if (this.dragsourceregion.all('.'+CSS.BLOCK).size() === 0 && this.dragsourceregion.get('id').match(/(region-pre|region-post)/i)) {","            if (!documentbody.hasClass('side-'+regionname+'-only')) {","                documentbody.addClass('side-'+regionname+'-only');","            }","        }","    },","","    drop_end : function(e) {","        // clear variables","        this.skipnodetop = null;","        this.skipnodebottom = null;","        this.dragsourceregion = null;","    },","","    drag_dropmiss : function(e) {","        // Missed the target, but we assume the user intended to drop it","        // on the last last ghost node location, e.drag and e.drop should be","        // prepared by global_drag_dropmiss parent so simulate drop_hit(e).","        this.drop_hit(e);","    },","","    drop_hit : function(e) {","        var drag = e.drag;","        // Get a reference to our drag node","        var dragnode = drag.get('node');","        var dropnode = e.drop.get('node');","","        // Amend existing skipnodes","        if (dragnode.previous() && dragnode.previous().hasClass(CSS.SKIPBLOCK)) {","            // the one that belongs to block below move below","            dragnode.insert(dragnode.previous(), 'after');","        }","        // Move original skipnodes","        if (this.skipnodetop) {","            dragnode.insert(this.skipnodetop, 'before');","        }","        if (this.skipnodebottom) {","            dragnode.insert(this.skipnodebottom, 'after');","        }","","        // Add lightbox if it not there","        var lightbox = M.util.add_lightbox(Y, dragnode);","","        // Prepare request parameters","        var params = {","            sesskey : M.cfg.sesskey,","            courseid : this.get('courseid'),","            pagelayout : this.get('pagelayout'),","            pagetype : this.get('pagetype'),","            subpage : this.get('subpage'),","            contextid : this.get('contextid'),","            action : 'move',","            bui_moveid : this.get_block_id(dragnode),","            bui_newregion : this.get_block_region(dropnode)","        };","","        if (this.get('cmid')) {","            params.cmid = this.get('cmid');","        }","","        if (dragnode.next('.'+this.samenodeclass) && !dragnode.next('.'+this.samenodeclass).hasClass(CSS.BLOCKADMINBLOCK)) {","            params.bui_beforeid = this.get_block_id(dragnode.next('.'+this.samenodeclass));","        }","","        // Do AJAX request","        Y.io(M.cfg.wwwroot+AJAXURL, {","            method: 'POST',","            data: params,","            on: {","                start : function(tid) {","                    lightbox.show();","                },","                success: function(tid, response) {","                    window.setTimeout(function(e) {","                        lightbox.hide();","                    }, 250);","                    try {","                        var responsetext = Y.JSON.parse(response.responseText);","                        if (responsetext.error) {","                            new M.core.ajaxException(responsetext);","                        }","                    } catch (e) {}","                },","                failure: function(tid, response) {","                    this.ajax_failure(response);","                    lightbox.hide();","                }","            },","            context:this","        });","    }","}, {","    NAME : 'core-blocks-dragdrop',","    ATTRS : {","        courseid : {","            value : null","        },","        cmid : {","            value : null","        },","        contextid : {","            value : null","        },","        pagelayout : {","            value : null","        },","        pagetype : {","            value : null","        },","        subpage : {","            value : null","        },","        regions : {","            value : null","        }","    }","});","","M.core_blocks = M.core_blocks || {};","M.core_blocks.init_dragdrop = function(params) {","    new DRAGBLOCK(params);","};","","","}, '@VERSION@', {","    \"requires\": [","        \"base\",","        \"node\",","        \"io\",","        \"dom\",","        \"dd\",","        \"dd-scroll\",","        \"moodle-core-dragdrop\",","        \"moodle-core-notification\"","    ]","});"];
_yuitest_coverage["build/moodle-core-blocks/moodle-core-blocks.js"].lines = {"1":0,"3":0,"18":0,"19":0,"21":0,"27":0,"28":0,"29":0,"32":0,"33":0,"34":0,"35":0,"36":0,"37":0,"42":0,"44":0,"45":0,"50":0,"51":0,"53":0,"55":0,"56":0,"57":0,"59":0,"61":0,"62":0,"63":0,"64":0,"66":0,"67":0,"68":0,"72":0,"77":0,"84":0,"92":0,"96":0,"98":0,"99":0,"100":0,"101":0,"102":0,"103":0,"110":0,"114":0,"115":0,"117":0,"120":0,"124":0,"129":0,"133":0,"136":0,"137":0,"139":0,"140":0,"146":0,"147":0,"151":0,"152":0,"157":0,"158":0,"169":0,"171":0,"172":0,"173":0,"178":0,"179":0,"180":0,"181":0,"188":0,"189":0,"190":0,"197":0,"201":0,"203":0,"204":0,"207":0,"209":0,"212":0,"213":0,"215":0,"216":0,"220":0,"223":0,"235":0,"236":0,"239":0,"240":0,"244":0,"249":0,"252":0,"253":0,"255":0,"256":0,"257":0,"258":0,"263":0,"264":0,"297":0,"298":0,"299":0};
_yuitest_coverage["build/moodle-core-blocks/moodle-core-blocks.js"].functions = {"DRAGBLOCK:18":0,"(anonymous 3):99":0,"(anonymous 2):72":0,"initializer:25":0,"get_block_id:109":0,"get_block_region:113":0,"get_region_id:123":0,"drag_start:127":0,"drop_over:144":0,"drop_end:186":0,"drag_dropmiss:193":0,"start:248":0,"(anonymous 4):252":0,"success:251":0,"failure:262":0,"drop_hit:200":0,"init_dragdrop:298":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-core-blocks/moodle-core-blocks.js"].coveredLines = 100;
_yuitest_coverage["build/moodle-core-blocks/moodle-core-blocks.js"].coveredFunctions = 18;
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 1);
YUI.add('moodle-core-blocks', function (Y, NAME) {

_yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 3);
var AJAXURL = '/lib/ajax/blocks.php',
CSS = {
    BLOCK : 'block',
    BLOCKREGION : 'block-region',
    BLOCKADMINBLOCK : 'block_adminblock',
    EDITINGMOVE : 'editing_move',
    HEADER : 'header',
    LIGHTBOX : 'lightbox',
    REGIONCONTENT : 'region-content',
    SKIPBLOCK : 'skip-block',
    SKIPBLOCKTO : 'skip-block-to',
    MYINDEX : 'page-my-index',
    REGIONMAIN : 'region-main'
};

_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 18);
var DRAGBLOCK = function() {
    _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "DRAGBLOCK", 18);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 19);
DRAGBLOCK.superclass.constructor.apply(this, arguments);
};
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 21);
Y.extend(DRAGBLOCK, M.core.dragdrop, {
    skipnodetop : null,
    skipnodebottom : null,
    dragsourceregion : null,
    initializer : function() {
        // Set group for parent class
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "initializer", 25);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 27);
this.groups = ['block'];
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 28);
this.samenodeclass = CSS.BLOCK;
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 29);
this.parentnodeclass = CSS.REGIONCONTENT;

        // Add relevant classes and ID to 'content' block region on My Home page.
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 32);
var myhomecontent = Y.Node.all('body#'+CSS.MYINDEX+' #'+CSS.REGIONMAIN+' > .'+CSS.REGIONCONTENT);
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 33);
if (myhomecontent.size() > 0) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 34);
var contentregion = myhomecontent.item(0);
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 35);
contentregion.addClass(CSS.BLOCKREGION);
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 36);
contentregion.set('id', CSS.REGIONCONTENT);
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 37);
contentregion.one('div').addClass(CSS.REGIONCONTENT);
        }

        // Initialise blocks dragging
        // Find all block regions on the page
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 42);
var blockregionlist = Y.Node.all('div.'+CSS.BLOCKREGION);

        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 44);
if (blockregionlist.size() === 0) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 45);
return false;
        }

        // See if we are missing either of block regions,
        // if yes we need to add an empty one to use as target
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 50);
if (blockregionlist.size() !== this.get('regions').length) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 51);
var blockregion = Y.Node.create('<div></div>')
                .addClass(CSS.BLOCKREGION);
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 53);
var regioncontent = Y.Node.create('<div></div>')
                .addClass(CSS.REGIONCONTENT);
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 55);
blockregion.appendChild(regioncontent);
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 56);
var pre = blockregionlist.filter('#region-pre');
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 57);
var post = blockregionlist.filter('#region-post');

            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 59);
if (pre.size() === 0 && post.size() === 1) {
                // pre block is missing, instert it before post
                _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 61);
blockregion.setAttrs({id : 'region-pre'});
                _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 62);
post.item(0).insert(blockregion, 'before');
                _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 63);
blockregionlist.unshift(blockregion);
            } else {_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 64);
if (post.size() === 0 && pre.size() === 1) {
                // post block is missing, instert it after pre
                _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 66);
blockregion.setAttrs({id : 'region-post'});
                _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 67);
pre.item(0).insert(blockregion, 'after');
                _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 68);
blockregionlist.push(blockregion);
            }}
        }

        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 72);
blockregionlist.each(function(blockregionnode) {

            // Setting blockregion as droptarget (the case when it is empty)
            // The region-post (the right one)
            // is very narrow, so add extra padding on the left to drop block on it.
            _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "(anonymous 2)", 72);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 77);
var tar = new Y.DD.Drop({
                node: blockregionnode.one('div.'+CSS.REGIONCONTENT),
                groups: this.groups,
                padding: '40 240 40 240'
            });

            // Make each div element in the list of blocks draggable
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 84);
var del = new Y.DD.Delegate({
                container: blockregionnode,
                nodes: '.'+CSS.BLOCK,
                target: true,
                handles: ['.'+CSS.HEADER],
                invalid: '.block-hider-hide, .block-hider-show, .moveto',
                dragConfig: {groups: this.groups}
            });
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 92);
del.dd.plug(Y.Plugin.DDProxy, {
                // Don't move the node at the end of the drag
                moveOnEnd: false
            });
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 96);
del.dd.plug(Y.Plugin.DDWinScroll);

            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 98);
var blocklist = blockregionnode.all('.'+CSS.BLOCK);
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 99);
blocklist.each(function(blocknode) {
                _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "(anonymous 3)", 99);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 100);
var move = blocknode.one('a.'+CSS.EDITINGMOVE);
                _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 101);
if (move) {
                    _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 102);
move.remove();
                    _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 103);
blocknode.one('.'+CSS.HEADER).setStyle('cursor', 'move');
                }
            }, this);
        }, this);
    },

    get_block_id : function(node) {
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "get_block_id", 109);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 110);
return Number(node.get('id').replace(/inst/i, ''));
    },

    get_block_region : function(node) {
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "get_block_region", 113);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 114);
var region = node.ancestor('div.'+CSS.BLOCKREGION).get('id').replace(/region-/i, '');
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 115);
if (Y.Array.indexOf(this.get('regions'), region) === -1) {
            // Must be standard side-X
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 117);
return 'side-' + region;
        }
        // Perhaps custom region
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 120);
return region;
    },

    get_region_id : function(node) {
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "get_region_id", 123);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 124);
return node.get('id').replace(/region-/i, '');
    },

    drag_start : function(e) {
        // Get our drag object
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "drag_start", 127);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 129);
var drag = e.target;

        // Store the parent node of original drag node (block)
        // we will need it later for show/hide empty regions
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 133);
this.dragsourceregion = drag.get('node').ancestor('div.'+CSS.BLOCKREGION);

        // Determine skipnodes and store them
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 136);
if (drag.get('node').previous() && drag.get('node').previous().hasClass(CSS.SKIPBLOCK)) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 137);
this.skipnodetop = drag.get('node').previous();
        }
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 139);
if (drag.get('node').next() && drag.get('node').next().hasClass(CSS.SKIPBLOCKTO)) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 140);
this.skipnodebottom = drag.get('node').next();
        }
    },

    drop_over : function(e) {
        // Get a reference to our drag and drop nodes
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "drop_over", 144);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 146);
var drag = e.drag.get('node');
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 147);
var drop = e.drop.get('node');

        // We need to fix the case when parent drop over event has determined
        // 'goingup' and appended the drag node after admin-block.
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 151);
if (drop.hasClass(this.parentnodeclass) && drop.one('.'+CSS.BLOCKADMINBLOCK) && drop.one('.'+CSS.BLOCKADMINBLOCK).next('.'+CSS.BLOCK)) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 152);
drop.prepend(drag);
        }

        // Block is moved within the same region
        // stop here, no need to modify anything.
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 157);
if (this.dragsourceregion.contains(drop)) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 158);
return false;
        }

        // TODO: Hiding-displaying block region only works for base theme blocks
        // (region-pre, region-post) at the moment. It should be improved
        // to work with custom block regions as well.

        // TODO: Fix this for the case when user drag block towards empty section,
        // then the section appears, then user chnages his mind and moving back to
        // original section. The opposite section remains opened and empty.

        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 169);
var documentbody = Y.one('body');
        // Moving block towards hidden region-content, display it
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 171);
var regionname = this.get_region_id(this.dragsourceregion);
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 172);
if (documentbody.hasClass('side-'+regionname+'-only')) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 173);
documentbody.removeClass('side-'+regionname+'-only');
        }

        // Moving from empty region-content towards the opposite one,
        // hide empty one (only for region-pre, region-post areas at the moment).
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 178);
regionname = this.get_region_id(drop.ancestor('div.'+CSS.BLOCKREGION));
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 179);
if (this.dragsourceregion.all('.'+CSS.BLOCK).size() === 0 && this.dragsourceregion.get('id').match(/(region-pre|region-post)/i)) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 180);
if (!documentbody.hasClass('side-'+regionname+'-only')) {
                _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 181);
documentbody.addClass('side-'+regionname+'-only');
            }
        }
    },

    drop_end : function(e) {
        // clear variables
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "drop_end", 186);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 188);
this.skipnodetop = null;
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 189);
this.skipnodebottom = null;
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 190);
this.dragsourceregion = null;
    },

    drag_dropmiss : function(e) {
        // Missed the target, but we assume the user intended to drop it
        // on the last last ghost node location, e.drag and e.drop should be
        // prepared by global_drag_dropmiss parent so simulate drop_hit(e).
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "drag_dropmiss", 193);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 197);
this.drop_hit(e);
    },

    drop_hit : function(e) {
        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "drop_hit", 200);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 201);
var drag = e.drag;
        // Get a reference to our drag node
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 203);
var dragnode = drag.get('node');
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 204);
var dropnode = e.drop.get('node');

        // Amend existing skipnodes
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 207);
if (dragnode.previous() && dragnode.previous().hasClass(CSS.SKIPBLOCK)) {
            // the one that belongs to block below move below
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 209);
dragnode.insert(dragnode.previous(), 'after');
        }
        // Move original skipnodes
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 212);
if (this.skipnodetop) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 213);
dragnode.insert(this.skipnodetop, 'before');
        }
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 215);
if (this.skipnodebottom) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 216);
dragnode.insert(this.skipnodebottom, 'after');
        }

        // Add lightbox if it not there
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 220);
var lightbox = M.util.add_lightbox(Y, dragnode);

        // Prepare request parameters
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 223);
var params = {
            sesskey : M.cfg.sesskey,
            courseid : this.get('courseid'),
            pagelayout : this.get('pagelayout'),
            pagetype : this.get('pagetype'),
            subpage : this.get('subpage'),
            contextid : this.get('contextid'),
            action : 'move',
            bui_moveid : this.get_block_id(dragnode),
            bui_newregion : this.get_block_region(dropnode)
        };

        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 235);
if (this.get('cmid')) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 236);
params.cmid = this.get('cmid');
        }

        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 239);
if (dragnode.next('.'+this.samenodeclass) && !dragnode.next('.'+this.samenodeclass).hasClass(CSS.BLOCKADMINBLOCK)) {
            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 240);
params.bui_beforeid = this.get_block_id(dragnode.next('.'+this.samenodeclass));
        }

        // Do AJAX request
        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 244);
Y.io(M.cfg.wwwroot+AJAXURL, {
            method: 'POST',
            data: params,
            on: {
                start : function(tid) {
                    _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "start", 248);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 249);
lightbox.show();
                },
                success: function(tid, response) {
                    _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "success", 251);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 252);
window.setTimeout(function(e) {
                        _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "(anonymous 4)", 252);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 253);
lightbox.hide();
                    }, 250);
                    _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 255);
try {
                        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 256);
var responsetext = Y.JSON.parse(response.responseText);
                        _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 257);
if (responsetext.error) {
                            _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 258);
new M.core.ajaxException(responsetext);
                        }
                    } catch (e) {}
                },
                failure: function(tid, response) {
                    _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "failure", 262);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 263);
this.ajax_failure(response);
                    _yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 264);
lightbox.hide();
                }
            },
            context:this
        });
    }
}, {
    NAME : 'core-blocks-dragdrop',
    ATTRS : {
        courseid : {
            value : null
        },
        cmid : {
            value : null
        },
        contextid : {
            value : null
        },
        pagelayout : {
            value : null
        },
        pagetype : {
            value : null
        },
        subpage : {
            value : null
        },
        regions : {
            value : null
        }
    }
});

_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 297);
M.core_blocks = M.core_blocks || {};
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 298);
M.core_blocks.init_dragdrop = function(params) {
    _yuitest_coverfunc("build/moodle-core-blocks/moodle-core-blocks.js", "init_dragdrop", 298);
_yuitest_coverline("build/moodle-core-blocks/moodle-core-blocks.js", 299);
new DRAGBLOCK(params);
};


}, '@VERSION@', {
    "requires": [
        "base",
        "node",
        "io",
        "dom",
        "dd",
        "dd-scroll",
        "moodle-core-dragdrop",
        "moodle-core-notification"
    ]
});

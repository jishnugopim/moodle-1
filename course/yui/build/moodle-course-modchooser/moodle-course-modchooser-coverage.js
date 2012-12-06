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
_yuitest_coverage["build/moodle-course-modchooser/moodle-course-modchooser.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-course-modchooser/moodle-course-modchooser.js",
    code: []
};
_yuitest_coverage["build/moodle-course-modchooser/moodle-course-modchooser.js"].code=["YUI.add('moodle-course-modchooser', function (Y, NAME) {","","    var CSS = {","        PAGECONTENT : 'div#page-content',","        SECTION : 'li.section',","        SECTIONMODCHOOSER : 'span.section-modchooser-link',","        SITEMENU : 'div.block_site_main_menu',","        SITETOPIC : 'div.sitetopic'","    };","","    var MODCHOOSERNAME = 'course-modchooser';","","    var MODCHOOSER = function() {","        MODCHOOSER.superclass.constructor.apply(this, arguments);","    }","","    Y.extend(MODCHOOSER, M.core.chooserdialogue, {","        // The current section ID","        sectionid : null,","","        // The hidden element holding the jump param","        jumplink : null,","","        initializer : function(config) {","            var dialogue = Y.one('.chooserdialoguebody');","            var header = Y.one('.choosertitle');","            var params = {};","            this.setup_chooser_dialogue(dialogue, header, params);","","            // Initialize existing sections and register for dynamically created sections","            this.setup_for_section();","            M.course.coursebase.register_module(this);","","            // Catch the page toggle","            Y.all('.block_settings #settingsnav .type_course .modchoosertoggle a').on('click', this.toggle_mod_chooser, this);","        },","        /**","         * Update any section areas within the scope of the specified","         * selector with AJAX equivalents","         *","         * @param baseselector The selector to limit scope to","         * @return void","         */","        setup_for_section : function(baseselector) {","            if (!baseselector) {","                var baseselector = CSS.PAGECONTENT;","            }","","            // Setup for site topics","            Y.one(baseselector).all(CSS.SITETOPIC).each(function(section) {","                this._setup_for_section(section);","            }, this);","","            // Setup for standard course topics","            Y.one(baseselector).all(CSS.SECTION).each(function(section) {","                this._setup_for_section(section);","            }, this);","","            // Setup for the block site menu","            Y.one(baseselector).all(CSS.SITEMENU).each(function(section) {","                this._setup_for_section(section);","            }, this);","        },","        _setup_for_section : function(section, sectionid) {","            var chooserspan = section.one(CSS.SECTIONMODCHOOSER);","            if (!chooserspan) {","                return;","            }","            var chooserlink = Y.Node.create(\"<a href='#' />\");","            chooserspan.get('children').each(function(node) {","                chooserlink.appendChild(node);","            });","            chooserspan.insertBefore(chooserlink);","            chooserlink.on('click', this.display_mod_chooser, this);","        },","        /**","         * Display the module chooser","         *","         * @param e Event Triggering Event","         * @param secitonid integer The ID of the section triggering the dialogue","         * @return void","         */","        display_mod_chooser : function (e) {","            // Set the section for this version of the dialogue","            if (e.target.ancestor(CSS.SITETOPIC)) {","                // The site topic has a sectionid of 1","                this.sectionid = 1;","            } else if (e.target.ancestor(CSS.SECTION)) {","                var section = e.target.ancestor(CSS.SECTION);","                this.sectionid = section.get('id').replace('section-', '');","            } else if (e.target.ancestor(CSS.SITEMENU)) {","                // The block site menu has a sectionid of 0","                this.sectionid = 0;","            }","            this.display_chooser(e);","        },","        toggle_mod_chooser : function(e) {","            // Get the add section link","            var modchooserlinks = Y.all('div.addresourcemodchooser');","","            // Get the dropdowns","            var dropdowns = Y.all('div.addresourcedropdown');","","            if (modchooserlinks.size() == 0) {","                // Continue with non-js action if there are no modchoosers to add","                return;","            }","","            // We need to update the text and link","            var togglelink = Y.one('.block_settings #settingsnav .type_course .modchoosertoggle a');","","            // The actual text is in the last child","            var toggletext = togglelink.get('lastChild');","","            var usemodchooser;","            // Determine whether they're currently hidden","            if (modchooserlinks.item(0).hasClass('visibleifjs')) {","                // The modchooser is currently visible, hide it","                usemodchooser = 0;","                modchooserlinks","                    .removeClass('visibleifjs')","                    .addClass('hiddenifjs');","                dropdowns","                    .addClass('visibleifjs')","                    .removeClass('hiddenifjs');","                toggletext.set('data', M.util.get_string('modchooserenable', 'moodle'));","                togglelink.set('href', togglelink.get('href').replace('off', 'on'));","            } else {","                // The modchooser is currently not visible, show it","                usemodchooser = 1;","                modchooserlinks","                    .addClass('visibleifjs')","                    .removeClass('hiddenifjs');","                dropdowns","                    .removeClass('visibleifjs')","                    .addClass('hiddenifjs');","                toggletext.set('data', M.util.get_string('modchooserdisable', 'moodle'));","                togglelink.set('href', togglelink.get('href').replace('on', 'off'));","            }","","            M.util.set_user_preference('usemodchooser', usemodchooser);","","            // Prevent the page from reloading","            e.preventDefault();","        },","        option_selected : function(thisoption) {","            // Add the sectionid to the URL","            this.jumplink.set('value', thisoption.get('value') + '&section=' + this.sectionid);","        }","    },","    {","        NAME : MODCHOOSERNAME,","        ATTRS : {","        }","    });","    M.course = M.course || {};","    M.course.init_chooser = function(config) {","        return new MODCHOOSER(config);","    }","","","}, '@VERSION@', {\"requires\": [\"base\", \"overlay\", \"moodle-core-chooserdialogue\", \"transition\"]});"];
_yuitest_coverage["build/moodle-course-modchooser/moodle-course-modchooser.js"].lines = {"1":0,"3":0,"11":0,"13":0,"14":0,"17":0,"25":0,"26":0,"27":0,"28":0,"31":0,"32":0,"35":0,"45":0,"46":0,"50":0,"51":0,"55":0,"56":0,"60":0,"61":0,"65":0,"66":0,"67":0,"69":0,"70":0,"71":0,"73":0,"74":0,"85":0,"87":0,"88":0,"89":0,"90":0,"91":0,"93":0,"95":0,"99":0,"102":0,"104":0,"106":0,"110":0,"113":0,"115":0,"117":0,"119":0,"120":0,"123":0,"126":0,"127":0,"130":0,"131":0,"134":0,"137":0,"138":0,"141":0,"144":0,"148":0,"156":0,"157":0,"158":0};
_yuitest_coverage["build/moodle-course-modchooser/moodle-course-modchooser.js"].functions = {"MODCHOOSER:13":0,"initializer:24":0,"(anonymous 2):50":0,"(anonymous 3):55":0,"(anonymous 4):60":0,"setup_for_section:44":0,"(anonymous 5):70":0,"_setup_for_section:64":0,"display_mod_chooser:83":0,"toggle_mod_chooser:97":0,"option_selected:146":0,"init_chooser:157":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-course-modchooser/moodle-course-modchooser.js"].coveredLines = 61;
_yuitest_coverage["build/moodle-course-modchooser/moodle-course-modchooser.js"].coveredFunctions = 13;
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 1);
YUI.add('moodle-course-modchooser', function (Y, NAME) {

    _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 3);
var CSS = {
        PAGECONTENT : 'div#page-content',
        SECTION : 'li.section',
        SECTIONMODCHOOSER : 'span.section-modchooser-link',
        SITEMENU : 'div.block_site_main_menu',
        SITETOPIC : 'div.sitetopic'
    };

    _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 11);
var MODCHOOSERNAME = 'course-modchooser';

    _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 13);
var MODCHOOSER = function() {
        _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "MODCHOOSER", 13);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 14);
MODCHOOSER.superclass.constructor.apply(this, arguments);
    }

    _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 17);
Y.extend(MODCHOOSER, M.core.chooserdialogue, {
        // The current section ID
        sectionid : null,

        // The hidden element holding the jump param
        jumplink : null,

        initializer : function(config) {
            _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "initializer", 24);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 25);
var dialogue = Y.one('.chooserdialoguebody');
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 26);
var header = Y.one('.choosertitle');
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 27);
var params = {};
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 28);
this.setup_chooser_dialogue(dialogue, header, params);

            // Initialize existing sections and register for dynamically created sections
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 31);
this.setup_for_section();
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 32);
M.course.coursebase.register_module(this);

            // Catch the page toggle
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 35);
Y.all('.block_settings #settingsnav .type_course .modchoosertoggle a').on('click', this.toggle_mod_chooser, this);
        },
        /**
         * Update any section areas within the scope of the specified
         * selector with AJAX equivalents
         *
         * @param baseselector The selector to limit scope to
         * @return void
         */
        setup_for_section : function(baseselector) {
            _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "setup_for_section", 44);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 45);
if (!baseselector) {
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 46);
var baseselector = CSS.PAGECONTENT;
            }

            // Setup for site topics
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 50);
Y.one(baseselector).all(CSS.SITETOPIC).each(function(section) {
                _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "(anonymous 2)", 50);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 51);
this._setup_for_section(section);
            }, this);

            // Setup for standard course topics
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 55);
Y.one(baseselector).all(CSS.SECTION).each(function(section) {
                _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "(anonymous 3)", 55);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 56);
this._setup_for_section(section);
            }, this);

            // Setup for the block site menu
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 60);
Y.one(baseselector).all(CSS.SITEMENU).each(function(section) {
                _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "(anonymous 4)", 60);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 61);
this._setup_for_section(section);
            }, this);
        },
        _setup_for_section : function(section, sectionid) {
            _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "_setup_for_section", 64);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 65);
var chooserspan = section.one(CSS.SECTIONMODCHOOSER);
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 66);
if (!chooserspan) {
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 67);
return;
            }
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 69);
var chooserlink = Y.Node.create("<a href='#' />");
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 70);
chooserspan.get('children').each(function(node) {
                _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "(anonymous 5)", 70);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 71);
chooserlink.appendChild(node);
            });
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 73);
chooserspan.insertBefore(chooserlink);
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 74);
chooserlink.on('click', this.display_mod_chooser, this);
        },
        /**
         * Display the module chooser
         *
         * @param e Event Triggering Event
         * @param secitonid integer The ID of the section triggering the dialogue
         * @return void
         */
        display_mod_chooser : function (e) {
            // Set the section for this version of the dialogue
            _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "display_mod_chooser", 83);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 85);
if (e.target.ancestor(CSS.SITETOPIC)) {
                // The site topic has a sectionid of 1
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 87);
this.sectionid = 1;
            } else {_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 88);
if (e.target.ancestor(CSS.SECTION)) {
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 89);
var section = e.target.ancestor(CSS.SECTION);
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 90);
this.sectionid = section.get('id').replace('section-', '');
            } else {_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 91);
if (e.target.ancestor(CSS.SITEMENU)) {
                // The block site menu has a sectionid of 0
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 93);
this.sectionid = 0;
            }}}
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 95);
this.display_chooser(e);
        },
        toggle_mod_chooser : function(e) {
            // Get the add section link
            _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "toggle_mod_chooser", 97);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 99);
var modchooserlinks = Y.all('div.addresourcemodchooser');

            // Get the dropdowns
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 102);
var dropdowns = Y.all('div.addresourcedropdown');

            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 104);
if (modchooserlinks.size() == 0) {
                // Continue with non-js action if there are no modchoosers to add
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 106);
return;
            }

            // We need to update the text and link
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 110);
var togglelink = Y.one('.block_settings #settingsnav .type_course .modchoosertoggle a');

            // The actual text is in the last child
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 113);
var toggletext = togglelink.get('lastChild');

            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 115);
var usemodchooser;
            // Determine whether they're currently hidden
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 117);
if (modchooserlinks.item(0).hasClass('visibleifjs')) {
                // The modchooser is currently visible, hide it
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 119);
usemodchooser = 0;
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 120);
modchooserlinks
                    .removeClass('visibleifjs')
                    .addClass('hiddenifjs');
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 123);
dropdowns
                    .addClass('visibleifjs')
                    .removeClass('hiddenifjs');
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 126);
toggletext.set('data', M.util.get_string('modchooserenable', 'moodle'));
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 127);
togglelink.set('href', togglelink.get('href').replace('off', 'on'));
            } else {
                // The modchooser is currently not visible, show it
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 130);
usemodchooser = 1;
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 131);
modchooserlinks
                    .addClass('visibleifjs')
                    .removeClass('hiddenifjs');
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 134);
dropdowns
                    .removeClass('visibleifjs')
                    .addClass('hiddenifjs');
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 137);
toggletext.set('data', M.util.get_string('modchooserdisable', 'moodle'));
                _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 138);
togglelink.set('href', togglelink.get('href').replace('on', 'off'));
            }

            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 141);
M.util.set_user_preference('usemodchooser', usemodchooser);

            // Prevent the page from reloading
            _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 144);
e.preventDefault();
        },
        option_selected : function(thisoption) {
            // Add the sectionid to the URL
            _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "option_selected", 146);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 148);
this.jumplink.set('value', thisoption.get('value') + '&section=' + this.sectionid);
        }
    },
    {
        NAME : MODCHOOSERNAME,
        ATTRS : {
        }
    });
    _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 156);
M.course = M.course || {};
    _yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 157);
M.course.init_chooser = function(config) {
        _yuitest_coverfunc("build/moodle-course-modchooser/moodle-course-modchooser.js", "init_chooser", 157);
_yuitest_coverline("build/moodle-course-modchooser/moodle-course-modchooser.js", 158);
return new MODCHOOSER(config);
    }


}, '@VERSION@', {"requires": ["base", "overlay", "moodle-core-chooserdialogue", "transition"]});

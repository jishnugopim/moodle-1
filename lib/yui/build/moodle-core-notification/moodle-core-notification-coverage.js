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
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"] = {
    lines: {},
    functions: {},
    coveredLines: 0,
    calledLines: 0,
    coveredFunctions: 0,
    calledFunctions: 0,
    path: "build/moodle-core-notification/moodle-core-notification.js",
    code: []
};
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].code=["YUI.add('moodle-core-notification', function (Y, NAME) {","","/**","  * Provides the base dialogue class.","  *","  * @module moodle-core-dialogue","  */","var DIALOGUE_NAME = 'Moodle dialogue',","    DIALOGUE_PREFIX = 'moodle-dialogue',","    CONFIRM_NAME = 'Moodle confirmation dialogue',","    EXCEPTION_NAME = 'Moodle exception',","    AJAXEXCEPTION_NAME = 'Moodle AJAX exception',","    ALERT_NAME = 'Moodle alert',","    C = Y.Node.create,","    BASE = 'notificationBase',","    COUNT = 0,","    CONFIRMYES = 'yesLabel',","    CONFIRMNO = 'noLabel',","    TITLE = 'title',","    QUESTION = 'question',","    CSS = {","        BASE : 'moodle-dialogue-base',","        WRAP : 'moodle-dialogue-wrap',","        HEADER : 'moodle-dialogue-hd',","        BODY : 'moodle-dialogue-bd',","        CONTENT : 'moodle-dialogue-content',","        FOOTER : 'moodle-dialogue-ft',","        HIDDEN : 'hidden',","        LIGHTBOX : 'moodle-dialogue-lightbox'","    },","    EXCEPTION,","    ALERT,","    CONFIRM,","    AJAXEXCEPTION,","    DIALOGUE;","","/**","  * A base class for a Moodle dialogue.","  *","  * @param {Object} config Object literal specifying dialogue configuration properties.","  * @class M.core.dialogue","  * @constructor","  * @extends Panel","  */","DIALOGUE = function(config) {","    COUNT++;","    var id = 'moodle-dialogue-'+COUNT;","    config.notificationBase =","        new C('<div class=\"'+CSS.BASE+'\">')","              .append(new C('<div id=\"'+id+'\" role=\"dialog\" aria-labelledby=\"'+id+'-header-text\" class=\"'+CSS.WRAP+'\"></div>')","              .append(new C('<div class=\"'+CSS.HEADER+' yui3-widget-hd\"></div>'))","              .append(new C('<div class=\"'+CSS.BODY+' yui3-widget-bd\"></div>'))","              .append(new C('<div class=\"'+CSS.FOOTER+' yui3-widget-ft\"></div>')));","    Y.one(document.body).append(config.notificationBase);","    config.srcNode =    '#'+id;","    config.width =      config.width || '400px';","    config.visible =    config.visible || false;","    config.center =     config.centered || true;","    config.centered =   false;","","    // lightbox param to keep the stable versions API.","    if (config.lightbox !== false) {","        config.modal = true;","    }","    delete config.lightbox;","","    // closeButton param to keep the stable versions API.","    if (config.closeButton === false) {","        config.buttons = null;","    } else {","        config.buttons = [","            {","                section: Y.WidgetStdMod.HEADER,","                classNames: 'closebutton',","                action: function () {","                    this.hide();","                }","            }","        ];","    }","    DIALOGUE.superclass.constructor.apply(this, [config]);","","    if (config.closeButton !== false) {","        // The buttons constructor does not allow custom attributes","        this.get('buttons').header[0].setAttribute('title', this.get('closeButtonTitle'));","    }","};","Y.extend(DIALOGUE, Y.Panel, {","    initializer : function() {","        this.after('visibleChange', this.visibilityChanged, this);","        this.render();","        this.show();","    },","    visibilityChanged : function(e) {","        var titlebar;","        if (e.attrName === 'visible') {","            this.get('maskNode').addClass(CSS.LIGHTBOX);","            if (this.get('center') && !e.prevVal && e.newVal) {","                this.centerDialogue();","            }","            if (this.get('draggable')) {","                titlebar = '#' + this.get('id') + ' .' + CSS.HEADER;","                this.plug(Y.Plugin.Drag, {handles : [titlebar]});","                Y.one(titlebar).setStyle('cursor', 'move');","            }","        }","    },","","    /**","     * Centre the dialogue on the page.","     *","     * @method centerDialogue","     */","    centerDialogue : function() {","        var bb = this.get('boundingBox'),","            hidden = bb.hasClass(DIALOGUE_PREFIX+'-hidden'),","            x, y;","        if (hidden) {","            bb.setStyle('top', '-1000px').removeClass(DIALOGUE_PREFIX+'-hidden');","        }","        x = Math.max(Math.round((bb.get('winWidth') - bb.get('offsetWidth'))/2), 15);","        y = Math.max(Math.round((bb.get('winHeight') - bb.get('offsetHeight'))/2), 15) + Y.one(window).get('scrollTop');","","        if (hidden) {","            bb.addClass(DIALOGUE_PREFIX+'-hidden');","        }","        bb.setStyle('left', x).setStyle('top', y);","    }","}, {","    NAME : DIALOGUE_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        notificationBase : {","","        },","        /**","         * Boolean indicating if the dialogue should be modal and have a lightbox on the background.","         *","         * @attribute lightbox","         * @type Boolean","         * @default true","         */","        lightbox : {","            validator : Y.Lang.isBoolean,","            value : true","        },","        /**","         * Boolean indicating if the dialogue should have a close button.","         *","         * @attribute closeButton","         * @type Boolean","         * @default true","         */","        closeButton : {","            validator : Y.Lang.isBoolean,","            value : true","        },","        /**","         * String setting the close button title.","         *","         * @attribute closeButtonTitle","         * @type String","         * @default 'Close'","         */","        closeButtonTitle : {","            validator : Y.Lang.isString,","            value : 'Close'","        },","        /**","         * Boolean indicating whether the dialogue should be centred when it's opened.","         *","         * @attribute center","         * @type Boolean","         * @default true","         */","        center : {","            validator : Y.Lang.isBoolean,","            value : true","        },","        /**","         * Boolean indicating whether the dialogue should be draggable.","         *","         * @attribute draggable","         * @type Boolean","         * @default false","         */","        draggable : {","            validator : Y.Lang.isBoolean,","            value : false","        }","    }","});","","/**","  * A base class for a Moodle alert.","  *","  * @param {Object} config Object literal specifying alert configuration properties.","  * @class M.core.alert","  * @constructor","  * @extends M.core.dialogue","  */","ALERT = function(config) {","    config.closeButton = false;","    ALERT.superclass.constructor.apply(this, [config]);","};","Y.extend(ALERT, DIALOGUE, {","    _enterKeypress : null,","    initializer : function() {","        this.publish('complete');","        var yes = C('<input type=\"button\" id=\"id_yuialertconfirm-' + this.COUNT + '\" value=\"'+this.get(CONFIRMYES)+'\" />'),","            content = C('<div class=\"confirmation-dialogue\"></div>')","                    .append(C('<div class=\"confirmation-message\">'+this.get('message')+'</div>'))","                    .append(C('<div class=\"confirmation-buttons\"></div>')","                            .append(yes));","        this.get(BASE).addClass('moodle-dialogue-confirm');","        this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);","        this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id=\"moodle-dialogue-'+COUNT+'-header-text\">' + this.get(TITLE) + '</h1>', Y.WidgetStdMod.REPLACE);","        this.after('destroyedChange', function(){this.get(BASE).remove();}, this);","        this._enterKeypress = Y.on('key', this.submit, window, 'down:13', this);","        yes.on('click', this.submit, this);","    },","    submit : function() {","        this._enterKeypress.detach();","        this.fire('complete');","        this.hide();","        this.destroy();","    }","}, {","    NAME : ALERT_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        /**","         * String indicating the title of the alert.","         *","         * @attribute title","         * @type String","         * @default 'Alert'","         */","        title : {","            validator : Y.Lang.isString,","            value : 'Alert'","        },","","        /**","         * String indicating the message displayed in the alert.","         *","         * @attribute message","         * @type String","         * @default 'Confirm'","         */","        message : {","            validator : Y.Lang.isString,","            value : 'Confirm'","        },","","        /**","         * String indicating the content of the 'Ok' button displayed in the alert.","         *","         * @attribute yesLabel","         * @type String","         * @default 'Ok'","         */","        yesLabel : {","            validator : Y.Lang.isString,","            setter : function(txt) {","                if (!txt) {","                    txt = 'Ok';","                }","                return txt;","            },","            value : 'Ok'","        }","    }","});","","/**","  * A base class for a Moodle confirmation dialogue.","  *","  * @param {Object} config Object literal specifying confirm configuration properties.","  * @class M.core.confirm","  * @constructor","  * @extends M.core.dialogue","  */","CONFIRM = function(config) {","    CONFIRM.superclass.constructor.apply(this, [config]);","};","Y.extend(CONFIRM, DIALOGUE, {","    _enterKeypress : null,","    _escKeypress : null,","    initializer : function() {","        this.publish('complete');","        this.publish('complete-yes');","        this.publish('complete-no');","        var yes = C('<input type=\"button\" id=\"id_yuiconfirmyes-' + this.COUNT + '\" value=\"'+this.get(CONFIRMYES)+'\" />'),","            no = C('<input type=\"button\" id=\"id_yuiconfirmno-' + this.COUNT + '\" value=\"'+this.get(CONFIRMNO)+'\" />'),","            content = C('<div class=\"confirmation-dialogue\"></div>')","                        .append(C('<div class=\"confirmation-message\">'+this.get(QUESTION)+'</div>'))","                        .append(C('<div class=\"confirmation-buttons\"></div>')","                            .append(yes)","                            .append(no));","        this.get(BASE).addClass('moodle-dialogue-confirm');","        this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);","        this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id=\"moodle-dialogue-'+COUNT+'-header-text\">' + this.get(TITLE) + '</h1>', Y.WidgetStdMod.REPLACE);","        this.after('destroyedChange', function(){this.get(BASE).remove();}, this);","        this._enterKeypress = Y.on('key', this.submit, window, 'down:13', this, true);","        this._escKeypress = Y.on('key', this.submit, window, 'down:27', this, false);","        yes.on('click', this.submit, this, true);","        no.on('click', this.submit, this, false);","    },","    submit : function(e, outcome) {","        this._enterKeypress.detach();","        this._escKeypress.detach();","        this.fire('complete', outcome);","        if (outcome) {","            this.fire('complete-yes');","        } else {","            this.fire('complete-no');","        }","        this.hide();","        this.destroy();","    }","}, {","    NAME : CONFIRM_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        /**","         * String indicating the content of the 'Ok' button displayed in the alert.","         *","         * @attribute yesLabel","         * @type String","         * @default 'Ok'","         */","        yesLabel : {","            validator : Y.Lang.isString,","            value : 'Yes'","        },","","        /**","         * String indicating the content of the 'No' button displayed in the alert.","         *","         * @attribute noLabel","         * @type String","         * @default 'Ok'","         */","        noLabel : {","            validator : Y.Lang.isString,","            value : 'No'","        },","","        /**","         * String indicating the title of the alert.","         *","         * @attribute title","         * @type String","         * @default 'Alert'","         */","        title : {","            validator : Y.Lang.isString,","            value : 'Confirm'","        },","","        /**","         * String indicating the question shown in the confirmation dialogue.","         *","         * @attribute question","         * @type String","         * @default 'Are you sure?'","         */","        question : {","            validator : Y.Lang.isString,","            value : 'Are you sure?'","        }","    }","});","Y.augment(CONFIRM, Y.EventTarget);","","EXCEPTION = function(config) {","    config.width = config.width || (M.cfg.developerdebug)?Math.floor(Y.one(document.body).get('winWidth')/3)+'px':null;","    config.closeButton = true;","    EXCEPTION.superclass.constructor.apply(this, [config]);","};","Y.extend(EXCEPTION, DIALOGUE, {","    _hideTimeout : null,","    _keypress : null,","    initializer : function(config) {","        var content,","            self = this,","            delay = this.get('hideTimeoutDelay');","        this.get(BASE).addClass('moodle-dialogue-exception');","        this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id=\"moodle-dialogue-'+COUNT+'-header-text\">' + config.name + '</h1>', Y.WidgetStdMod.REPLACE);","        content = C('<div class=\"moodle-exception\"></div>')","                .append(C('<div class=\"moodle-exception-message\">'+this.get('message')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-filename\"><label>File:</label> '+this.get('fileName')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-linenumber\"><label>Line:</label> '+this.get('lineNumber')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-stacktrace\"><label>Stack trace:</label> <pre>'+this.get('stack')+'</pre></div>'));","        if (M.cfg.developerdebug) {","            content.all('.moodle-exception-param').removeClass('hidden');","        }","        this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);","","        if (delay) {","            this._hideTimeout = setTimeout(function(){self.hide();}, delay);","        }","        this.after('visibleChange', this.visibilityChanged, this);","        this.after('destroyedChange', function(){this.get(BASE).remove();}, this);","        this._keypress = Y.on('key', this.hide, window, 'down:13,27', this);","        this.centerDialogue();","    },","    visibilityChanged : function(e) {","        if (e.attrName === 'visible' && e.prevVal && !e.newVal) {","            if (this._keypress) {","                this._keypress.detach();","            }","            var self = this;","            setTimeout(function(){self.destroy();}, 1000);","        }","    }","}, {","    NAME : EXCEPTION_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        message : {","            value : ''","        },","        name : {","            value : ''","        },","        fileName : {","            value : ''","        },","        lineNumber : {","            value : ''","        },","        stack : {","            setter : function(str) {","                var lines = str.split(\"\\n\"),","                    pattern = new RegExp('^(.+)@('+M.cfg.wwwroot+')?(.{0,75}).*:(\\\\d+)$'),","                    i;","                for (i in lines) {","                    lines[i] = lines[i].replace(pattern,","                            \"<div class='stacktrace-line'>ln: $4</div><div class='stacktrace-file'>$3</div><div class='stacktrace-call'>$1</div>\");","                }","                return lines.join('');","            },","            value : ''","        },","        hideTimeoutDelay : {","            validator : Y.Lang.isNumber,","            value : null","        }","    }","});","","AJAXEXCEPTION = function(config) {","    config.name = config.name || 'Error';","    config.closeButton = true;","    AJAXEXCEPTION.superclass.constructor.apply(this, [config]);","};","Y.extend(AJAXEXCEPTION, DIALOGUE, {","    _keypress : null,","    initializer : function(config) {","        var content,","            self = this,","            delay = this.get('hideTimeoutDelay');","        this.get(BASE).addClass('moodle-dialogue-exception');","        this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id=\"moodle-dialogue-'+COUNT+'-header-text\">' + config.name + '</h1>', Y.WidgetStdMod.REPLACE);","        content = C('<div class=\"moodle-ajaxexception\"></div>')","                .append(C('<div class=\"moodle-exception-message\">'+this.get('error')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-debuginfo\"><label>URL:</label> '+this.get('reproductionlink')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-debuginfo\"><label>Debug info:</label> '+this.get('debuginfo')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-stacktrace\"><label>Stack trace:</label> <pre>'+this.get('stacktrace')+'</pre></div>'));","        if (M.cfg.developerdebug) {","            content.all('.moodle-exception-param').removeClass('hidden');","        }","        this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);","","        if (delay) {","            this._hideTimeout = setTimeout(function(){self.hide();}, delay);","        }","        this.after('visibleChange', this.visibilityChanged, this);","        this._keypress = Y.on('key', this.hide, window, 'down:13, 27', this);","        this.centerDialogue();","    },","    visibilityChanged : function(e) {","        if (e.attrName === 'visible' && e.prevVal && !e.newVal) {","            var self = this;","            this._keypress.detach();","            setTimeout(function(){self.destroy();}, 1000);","        }","    }","}, {","    NAME : AJAXEXCEPTION_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        error : {","            validator : Y.Lang.isString,","            value : 'Unknown error'","        },","        debuginfo : {","            value : null","        },","        stacktrace : {","            value : null","        },","        reproductionlink : {","            setter : function(link) {","                if (link !== null) {","                    link = '<a href=\"'+link+'\">'+link.replace(M.cfg.wwwroot, '')+'</a>';","                }","                return link;","            },","            value : null","        },","        hideTimeoutDelay : {","            validator : Y.Lang.isNumber,","            value : null","        }","    }","});","","M.core = M.core || {};","M.core.dialogue = DIALOGUE;","M.core.alert = ALERT;","M.core.confirm = CONFIRM;","M.core.exception = EXCEPTION;","M.core.ajaxException = AJAXEXCEPTION;","","","}, '@VERSION@', {\"requires\": [\"base\", \"node\", \"panel\", \"event-key\", \"dd-plugin\"]});"];
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].lines = {"1":0,"8":0,"45":0,"46":0,"47":0,"48":0,"54":0,"55":0,"56":0,"57":0,"58":0,"59":0,"62":0,"63":0,"65":0,"68":0,"69":0,"71":0,"76":0,"81":0,"83":0,"85":0,"88":0,"90":0,"91":0,"92":0,"95":0,"96":0,"97":0,"98":0,"99":0,"101":0,"102":0,"103":0,"104":0,"115":0,"118":0,"119":0,"121":0,"122":0,"124":0,"125":0,"127":0,"202":0,"203":0,"204":0,"206":0,"209":0,"210":0,"215":0,"216":0,"217":0,"218":0,"219":0,"220":0,"223":0,"224":0,"225":0,"226":0,"266":0,"267":0,"269":0,"284":0,"285":0,"287":0,"291":0,"292":0,"293":0,"294":0,"301":0,"302":0,"303":0,"304":0,"305":0,"306":0,"307":0,"308":0,"311":0,"312":0,"313":0,"314":0,"315":0,"317":0,"319":0,"320":0,"375":0,"377":0,"378":0,"379":0,"380":0,"382":0,"386":0,"389":0,"390":0,"391":0,"396":0,"397":0,"399":0,"401":0,"402":0,"404":0,"405":0,"406":0,"407":0,"410":0,"411":0,"412":0,"414":0,"415":0,"436":0,"439":0,"440":0,"443":0,"454":0,"455":0,"456":0,"457":0,"459":0,"462":0,"465":0,"466":0,"467":0,"472":0,"473":0,"475":0,"477":0,"478":0,"480":0,"481":0,"482":0,"485":0,"486":0,"487":0,"488":0,"507":0,"508":0,"510":0,"521":0,"522":0,"523":0,"524":0,"525":0,"526":0};
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].functions = {"action:75":0,"DIALOGUE:45":0,"initializer:89":0,"visibilityChanged:94":0,"centerDialogue:114":0,"ALERT:202":0,"(anonymous 2):218":0,"initializer:208":0,"submit:222":0,"setter:265":0,"CONFIRM:284":0,"(anonymous 3):304":0,"initializer:290":0,"submit:310":0,"EXCEPTION:377":0,"(anonymous 4):402":0,"(anonymous 5):405":0,"initializer:385":0,"(anonymous 6):415":0,"visibilityChanged:409":0,"setter:435":0,"AJAXEXCEPTION:454":0,"(anonymous 7):478":0,"initializer:461":0,"(anonymous 8):488":0,"visibilityChanged:484":0,"setter:506":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].coveredLines = 143;
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].coveredFunctions = 28;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 1);
YUI.add('moodle-core-notification', function (Y, NAME) {

/**
  * Provides the base dialogue class.
  *
  * @module moodle-core-dialogue
  */
_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 8);
var DIALOGUE_NAME = 'Moodle dialogue',
    DIALOGUE_PREFIX = 'moodle-dialogue',
    CONFIRM_NAME = 'Moodle confirmation dialogue',
    EXCEPTION_NAME = 'Moodle exception',
    AJAXEXCEPTION_NAME = 'Moodle AJAX exception',
    ALERT_NAME = 'Moodle alert',
    C = Y.Node.create,
    BASE = 'notificationBase',
    COUNT = 0,
    CONFIRMYES = 'yesLabel',
    CONFIRMNO = 'noLabel',
    TITLE = 'title',
    QUESTION = 'question',
    CSS = {
        BASE : 'moodle-dialogue-base',
        WRAP : 'moodle-dialogue-wrap',
        HEADER : 'moodle-dialogue-hd',
        BODY : 'moodle-dialogue-bd',
        CONTENT : 'moodle-dialogue-content',
        FOOTER : 'moodle-dialogue-ft',
        HIDDEN : 'hidden',
        LIGHTBOX : 'moodle-dialogue-lightbox'
    },
    EXCEPTION,
    ALERT,
    CONFIRM,
    AJAXEXCEPTION,
    DIALOGUE;

/**
  * A base class for a Moodle dialogue.
  *
  * @param {Object} config Object literal specifying dialogue configuration properties.
  * @class M.core.dialogue
  * @constructor
  * @extends Panel
  */
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 45);
DIALOGUE = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "DIALOGUE", 45);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 46);
COUNT++;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 47);
var id = 'moodle-dialogue-'+COUNT;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 48);
config.notificationBase =
        new C('<div class="'+CSS.BASE+'">')
              .append(new C('<div id="'+id+'" role="dialog" aria-labelledby="'+id+'-header-text" class="'+CSS.WRAP+'"></div>')
              .append(new C('<div class="'+CSS.HEADER+' yui3-widget-hd"></div>'))
              .append(new C('<div class="'+CSS.BODY+' yui3-widget-bd"></div>'))
              .append(new C('<div class="'+CSS.FOOTER+' yui3-widget-ft"></div>')));
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 54);
Y.one(document.body).append(config.notificationBase);
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 55);
config.srcNode =    '#'+id;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 56);
config.width =      config.width || '400px';
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 57);
config.visible =    config.visible || false;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 58);
config.center =     config.centered || true;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 59);
config.centered =   false;

    // lightbox param to keep the stable versions API.
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 62);
if (config.lightbox !== false) {
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 63);
config.modal = true;
    }
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 65);
delete config.lightbox;

    // closeButton param to keep the stable versions API.
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 68);
if (config.closeButton === false) {
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 69);
config.buttons = null;
    } else {
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 71);
config.buttons = [
            {
                section: Y.WidgetStdMod.HEADER,
                classNames: 'closebutton',
                action: function () {
                    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "action", 75);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 76);
this.hide();
                }
            }
        ];
    }
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 81);
DIALOGUE.superclass.constructor.apply(this, [config]);

    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 83);
if (config.closeButton !== false) {
        // The buttons constructor does not allow custom attributes
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 85);
this.get('buttons').header[0].setAttribute('title', this.get('closeButtonTitle'));
    }
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 88);
Y.extend(DIALOGUE, Y.Panel, {
    initializer : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 89);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 90);
this.after('visibleChange', this.visibilityChanged, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 91);
this.render();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 92);
this.show();
    },
    visibilityChanged : function(e) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "visibilityChanged", 94);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 95);
var titlebar;
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 96);
if (e.attrName === 'visible') {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 97);
this.get('maskNode').addClass(CSS.LIGHTBOX);
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 98);
if (this.get('center') && !e.prevVal && e.newVal) {
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 99);
this.centerDialogue();
            }
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 101);
if (this.get('draggable')) {
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 102);
titlebar = '#' + this.get('id') + ' .' + CSS.HEADER;
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 103);
this.plug(Y.Plugin.Drag, {handles : [titlebar]});
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 104);
Y.one(titlebar).setStyle('cursor', 'move');
            }
        }
    },

    /**
     * Centre the dialogue on the page.
     *
     * @method centerDialogue
     */
    centerDialogue : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "centerDialogue", 114);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 115);
var bb = this.get('boundingBox'),
            hidden = bb.hasClass(DIALOGUE_PREFIX+'-hidden'),
            x, y;
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 118);
if (hidden) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 119);
bb.setStyle('top', '-1000px').removeClass(DIALOGUE_PREFIX+'-hidden');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 121);
x = Math.max(Math.round((bb.get('winWidth') - bb.get('offsetWidth'))/2), 15);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 122);
y = Math.max(Math.round((bb.get('winHeight') - bb.get('offsetHeight'))/2), 15) + Y.one(window).get('scrollTop');

        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 124);
if (hidden) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 125);
bb.addClass(DIALOGUE_PREFIX+'-hidden');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 127);
bb.setStyle('left', x).setStyle('top', y);
    }
}, {
    NAME : DIALOGUE_NAME,
    CSS_PREFIX : DIALOGUE_PREFIX,
    ATTRS : {
        notificationBase : {

        },
        /**
         * Boolean indicating if the dialogue should be modal and have a lightbox on the background.
         *
         * @attribute lightbox
         * @type Boolean
         * @default true
         */
        lightbox : {
            validator : Y.Lang.isBoolean,
            value : true
        },
        /**
         * Boolean indicating if the dialogue should have a close button.
         *
         * @attribute closeButton
         * @type Boolean
         * @default true
         */
        closeButton : {
            validator : Y.Lang.isBoolean,
            value : true
        },
        /**
         * String setting the close button title.
         *
         * @attribute closeButtonTitle
         * @type String
         * @default 'Close'
         */
        closeButtonTitle : {
            validator : Y.Lang.isString,
            value : 'Close'
        },
        /**
         * Boolean indicating whether the dialogue should be centred when it's opened.
         *
         * @attribute center
         * @type Boolean
         * @default true
         */
        center : {
            validator : Y.Lang.isBoolean,
            value : true
        },
        /**
         * Boolean indicating whether the dialogue should be draggable.
         *
         * @attribute draggable
         * @type Boolean
         * @default false
         */
        draggable : {
            validator : Y.Lang.isBoolean,
            value : false
        }
    }
});

/**
  * A base class for a Moodle alert.
  *
  * @param {Object} config Object literal specifying alert configuration properties.
  * @class M.core.alert
  * @constructor
  * @extends M.core.dialogue
  */
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 202);
ALERT = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "ALERT", 202);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 203);
config.closeButton = false;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 204);
ALERT.superclass.constructor.apply(this, [config]);
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 206);
Y.extend(ALERT, DIALOGUE, {
    _enterKeypress : null,
    initializer : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 208);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 209);
this.publish('complete');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 210);
var yes = C('<input type="button" id="id_yuialertconfirm-' + this.COUNT + '" value="'+this.get(CONFIRMYES)+'" />'),
            content = C('<div class="confirmation-dialogue"></div>')
                    .append(C('<div class="confirmation-message">'+this.get('message')+'</div>'))
                    .append(C('<div class="confirmation-buttons"></div>')
                            .append(yes));
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 215);
this.get(BASE).addClass('moodle-dialogue-confirm');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 216);
this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 217);
this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id="moodle-dialogue-'+COUNT+'-header-text">' + this.get(TITLE) + '</h1>', Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 218);
this.after('destroyedChange', function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 2)", 218);
this.get(BASE).remove();}, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 219);
this._enterKeypress = Y.on('key', this.submit, window, 'down:13', this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 220);
yes.on('click', this.submit, this);
    },
    submit : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "submit", 222);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 223);
this._enterKeypress.detach();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 224);
this.fire('complete');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 225);
this.hide();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 226);
this.destroy();
    }
}, {
    NAME : ALERT_NAME,
    CSS_PREFIX : DIALOGUE_PREFIX,
    ATTRS : {
        /**
         * String indicating the title of the alert.
         *
         * @attribute title
         * @type String
         * @default 'Alert'
         */
        title : {
            validator : Y.Lang.isString,
            value : 'Alert'
        },

        /**
         * String indicating the message displayed in the alert.
         *
         * @attribute message
         * @type String
         * @default 'Confirm'
         */
        message : {
            validator : Y.Lang.isString,
            value : 'Confirm'
        },

        /**
         * String indicating the content of the 'Ok' button displayed in the alert.
         *
         * @attribute yesLabel
         * @type String
         * @default 'Ok'
         */
        yesLabel : {
            validator : Y.Lang.isString,
            setter : function(txt) {
                _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "setter", 265);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 266);
if (!txt) {
                    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 267);
txt = 'Ok';
                }
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 269);
return txt;
            },
            value : 'Ok'
        }
    }
});

/**
  * A base class for a Moodle confirmation dialogue.
  *
  * @param {Object} config Object literal specifying confirm configuration properties.
  * @class M.core.confirm
  * @constructor
  * @extends M.core.dialogue
  */
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 284);
CONFIRM = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "CONFIRM", 284);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 285);
CONFIRM.superclass.constructor.apply(this, [config]);
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 287);
Y.extend(CONFIRM, DIALOGUE, {
    _enterKeypress : null,
    _escKeypress : null,
    initializer : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 290);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 291);
this.publish('complete');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 292);
this.publish('complete-yes');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 293);
this.publish('complete-no');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 294);
var yes = C('<input type="button" id="id_yuiconfirmyes-' + this.COUNT + '" value="'+this.get(CONFIRMYES)+'" />'),
            no = C('<input type="button" id="id_yuiconfirmno-' + this.COUNT + '" value="'+this.get(CONFIRMNO)+'" />'),
            content = C('<div class="confirmation-dialogue"></div>')
                        .append(C('<div class="confirmation-message">'+this.get(QUESTION)+'</div>'))
                        .append(C('<div class="confirmation-buttons"></div>')
                            .append(yes)
                            .append(no));
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 301);
this.get(BASE).addClass('moodle-dialogue-confirm');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 302);
this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 303);
this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id="moodle-dialogue-'+COUNT+'-header-text">' + this.get(TITLE) + '</h1>', Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 304);
this.after('destroyedChange', function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 3)", 304);
this.get(BASE).remove();}, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 305);
this._enterKeypress = Y.on('key', this.submit, window, 'down:13', this, true);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 306);
this._escKeypress = Y.on('key', this.submit, window, 'down:27', this, false);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 307);
yes.on('click', this.submit, this, true);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 308);
no.on('click', this.submit, this, false);
    },
    submit : function(e, outcome) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "submit", 310);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 311);
this._enterKeypress.detach();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 312);
this._escKeypress.detach();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 313);
this.fire('complete', outcome);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 314);
if (outcome) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 315);
this.fire('complete-yes');
        } else {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 317);
this.fire('complete-no');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 319);
this.hide();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 320);
this.destroy();
    }
}, {
    NAME : CONFIRM_NAME,
    CSS_PREFIX : DIALOGUE_PREFIX,
    ATTRS : {
        /**
         * String indicating the content of the 'Ok' button displayed in the alert.
         *
         * @attribute yesLabel
         * @type String
         * @default 'Ok'
         */
        yesLabel : {
            validator : Y.Lang.isString,
            value : 'Yes'
        },

        /**
         * String indicating the content of the 'No' button displayed in the alert.
         *
         * @attribute noLabel
         * @type String
         * @default 'Ok'
         */
        noLabel : {
            validator : Y.Lang.isString,
            value : 'No'
        },

        /**
         * String indicating the title of the alert.
         *
         * @attribute title
         * @type String
         * @default 'Alert'
         */
        title : {
            validator : Y.Lang.isString,
            value : 'Confirm'
        },

        /**
         * String indicating the question shown in the confirmation dialogue.
         *
         * @attribute question
         * @type String
         * @default 'Are you sure?'
         */
        question : {
            validator : Y.Lang.isString,
            value : 'Are you sure?'
        }
    }
});
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 375);
Y.augment(CONFIRM, Y.EventTarget);

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 377);
EXCEPTION = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "EXCEPTION", 377);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 378);
config.width = config.width || (M.cfg.developerdebug)?Math.floor(Y.one(document.body).get('winWidth')/3)+'px':null;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 379);
config.closeButton = true;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 380);
EXCEPTION.superclass.constructor.apply(this, [config]);
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 382);
Y.extend(EXCEPTION, DIALOGUE, {
    _hideTimeout : null,
    _keypress : null,
    initializer : function(config) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 385);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 386);
var content,
            self = this,
            delay = this.get('hideTimeoutDelay');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 389);
this.get(BASE).addClass('moodle-dialogue-exception');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 390);
this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id="moodle-dialogue-'+COUNT+'-header-text">' + config.name + '</h1>', Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 391);
content = C('<div class="moodle-exception"></div>')
                .append(C('<div class="moodle-exception-message">'+this.get('message')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-filename"><label>File:</label> '+this.get('fileName')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-linenumber"><label>Line:</label> '+this.get('lineNumber')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-stacktrace"><label>Stack trace:</label> <pre>'+this.get('stack')+'</pre></div>'));
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 396);
if (M.cfg.developerdebug) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 397);
content.all('.moodle-exception-param').removeClass('hidden');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 399);
this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);

        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 401);
if (delay) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 402);
this._hideTimeout = setTimeout(function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 4)", 402);
self.hide();}, delay);
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 404);
this.after('visibleChange', this.visibilityChanged, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 405);
this.after('destroyedChange', function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 5)", 405);
this.get(BASE).remove();}, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 406);
this._keypress = Y.on('key', this.hide, window, 'down:13,27', this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 407);
this.centerDialogue();
    },
    visibilityChanged : function(e) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "visibilityChanged", 409);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 410);
if (e.attrName === 'visible' && e.prevVal && !e.newVal) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 411);
if (this._keypress) {
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 412);
this._keypress.detach();
            }
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 414);
var self = this;
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 415);
setTimeout(function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 6)", 415);
self.destroy();}, 1000);
        }
    }
}, {
    NAME : EXCEPTION_NAME,
    CSS_PREFIX : DIALOGUE_PREFIX,
    ATTRS : {
        message : {
            value : ''
        },
        name : {
            value : ''
        },
        fileName : {
            value : ''
        },
        lineNumber : {
            value : ''
        },
        stack : {
            setter : function(str) {
                _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "setter", 435);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 436);
var lines = str.split("\n"),
                    pattern = new RegExp('^(.+)@('+M.cfg.wwwroot+')?(.{0,75}).*:(\\d+)$'),
                    i;
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 439);
for (i in lines) {
                    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 440);
lines[i] = lines[i].replace(pattern,
                            "<div class='stacktrace-line'>ln: $4</div><div class='stacktrace-file'>$3</div><div class='stacktrace-call'>$1</div>");
                }
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 443);
return lines.join('');
            },
            value : ''
        },
        hideTimeoutDelay : {
            validator : Y.Lang.isNumber,
            value : null
        }
    }
});

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 454);
AJAXEXCEPTION = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "AJAXEXCEPTION", 454);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 455);
config.name = config.name || 'Error';
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 456);
config.closeButton = true;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 457);
AJAXEXCEPTION.superclass.constructor.apply(this, [config]);
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 459);
Y.extend(AJAXEXCEPTION, DIALOGUE, {
    _keypress : null,
    initializer : function(config) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 461);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 462);
var content,
            self = this,
            delay = this.get('hideTimeoutDelay');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 465);
this.get(BASE).addClass('moodle-dialogue-exception');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 466);
this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id="moodle-dialogue-'+COUNT+'-header-text">' + config.name + '</h1>', Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 467);
content = C('<div class="moodle-ajaxexception"></div>')
                .append(C('<div class="moodle-exception-message">'+this.get('error')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-debuginfo"><label>URL:</label> '+this.get('reproductionlink')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-debuginfo"><label>Debug info:</label> '+this.get('debuginfo')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-stacktrace"><label>Stack trace:</label> <pre>'+this.get('stacktrace')+'</pre></div>'));
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 472);
if (M.cfg.developerdebug) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 473);
content.all('.moodle-exception-param').removeClass('hidden');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 475);
this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);

        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 477);
if (delay) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 478);
this._hideTimeout = setTimeout(function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 7)", 478);
self.hide();}, delay);
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 480);
this.after('visibleChange', this.visibilityChanged, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 481);
this._keypress = Y.on('key', this.hide, window, 'down:13, 27', this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 482);
this.centerDialogue();
    },
    visibilityChanged : function(e) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "visibilityChanged", 484);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 485);
if (e.attrName === 'visible' && e.prevVal && !e.newVal) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 486);
var self = this;
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 487);
this._keypress.detach();
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 488);
setTimeout(function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 8)", 488);
self.destroy();}, 1000);
        }
    }
}, {
    NAME : AJAXEXCEPTION_NAME,
    CSS_PREFIX : DIALOGUE_PREFIX,
    ATTRS : {
        error : {
            validator : Y.Lang.isString,
            value : 'Unknown error'
        },
        debuginfo : {
            value : null
        },
        stacktrace : {
            value : null
        },
        reproductionlink : {
            setter : function(link) {
                _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "setter", 506);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 507);
if (link !== null) {
                    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 508);
link = '<a href="'+link+'">'+link.replace(M.cfg.wwwroot, '')+'</a>';
                }
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 510);
return link;
            },
            value : null
        },
        hideTimeoutDelay : {
            validator : Y.Lang.isNumber,
            value : null
        }
    }
});

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 521);
M.core = M.core || {};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 522);
M.core.dialogue = DIALOGUE;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 523);
M.core.alert = ALERT;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 524);
M.core.confirm = CONFIRM;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 525);
M.core.exception = EXCEPTION;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 526);
M.core.ajaxException = AJAXEXCEPTION;


}, '@VERSION@', {"requires": ["base", "node", "panel", "event-key", "dd-plugin"]});

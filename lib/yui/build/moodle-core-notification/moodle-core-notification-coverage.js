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
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].code=["YUI.add('moodle-core-notification', function (Y, NAME) {","","var DIALOGUE_NAME = 'Moodle dialogue',","    DIALOGUE_PREFIX = 'moodle-dialogue',","    CONFIRM_NAME = 'Moodle confirmation dialogue',","    EXCEPTION_NAME = 'Moodle exception',","    AJAXEXCEPTION_NAME = 'Moodle AJAX exception',","    ALERT_NAME = 'Moodle alert',","    C = Y.Node.create,","    BASE = 'notificationBase',","    COUNT = 0,","    CONFIRMYES = 'yesLabel',","    CONFIRMNO = 'noLabel',","    TITLE = 'title',","    QUESTION = 'question',","    CSS = {","        BASE : 'moodle-dialogue-base',","        WRAP : 'moodle-dialogue-wrap',","        HEADER : 'moodle-dialogue-hd',","        BODY : 'moodle-dialogue-bd',","        CONTENT : 'moodle-dialogue-content',","        FOOTER : 'moodle-dialogue-ft',","        HIDDEN : 'hidden',","        LIGHTBOX : 'moodle-dialogue-lightbox'","    },","    EXCEPTION,","    ALERT,","    CONFIRM,","    AJAXEXCEPTION,","    DIALOGUE;","","DIALOGUE = function(config) {","    COUNT++;","    var id = 'moodle-dialogue-'+COUNT;","    config.notificationBase =","        new C('<div class=\"'+CSS.BASE+'\">')","              .append(new C('<div id=\"'+id+'\" role=\"dialog\" aria-labelledby=\"'+id+'-header-text\" class=\"'+CSS.WRAP+'\"></div>')","              .append(new C('<div class=\"'+CSS.HEADER+' yui3-widget-hd\"></div>'))","              .append(new C('<div class=\"'+CSS.BODY+' yui3-widget-bd\"></div>'))","              .append(new C('<div class=\"'+CSS.FOOTER+' yui3-widget-ft\"></div>')));","    Y.one(document.body).append(config.notificationBase);","    config.srcNode =    '#'+id;","    config.width =      config.width || '400px';","    config.visible =    config.visible || false;","    config.center =     config.centered || true;","    config.centered =   false;","","    // lightbox param to keep the stable versions API.","    if (config.lightbox !== false) {","        config.modal = true;","    }","    delete config.lightbox;","","    // closeButton param to keep the stable versions API.","    if (config.closeButton === false) {","        config.buttons = null;","    } else {","        config.buttons = [","            {","                section: Y.WidgetStdMod.HEADER,","                classNames: 'closebutton',","                action: function () {","                    this.hide();","                }","            }","        ];","    }","    DIALOGUE.superclass.constructor.apply(this, [config]);","","    if (config.closeButton !== false) {","        // The buttons constructor does not allow custom attributes","        this.get('buttons').header[0].setAttribute('title', this.get('closeButtonTitle'));","    }","};","Y.extend(DIALOGUE, Y.Panel, {","    initializer : function() {","        this.after('visibleChange', this.visibilityChanged, this);","        this.render();","        this.show();","    },","    visibilityChanged : function(e) {","        var titlebar;","        if (e.attrName === 'visible') {","            this.get('maskNode').addClass(CSS.LIGHTBOX);","            if (this.get('center') && !e.prevVal && e.newVal) {","                this.centerDialogue();","            }","            if (this.get('draggable')) {","                titlebar = '#' + this.get('id') + ' .' + CSS.HEADER;","                this.plug(Y.Plugin.Drag, {handles : [titlebar]});","                Y.one(titlebar).setStyle('cursor', 'move');","            }","        }","    },","    centerDialogue : function() {","        var bb = this.get('boundingBox'),","            hidden = bb.hasClass(DIALOGUE_PREFIX+'-hidden'),","            x, y;","        if (hidden) {","            bb.setStyle('top', '-1000px').removeClass(DIALOGUE_PREFIX+'-hidden');","        }","        x = Math.max(Math.round((bb.get('winWidth') - bb.get('offsetWidth'))/2), 15);","        y = Math.max(Math.round((bb.get('winHeight') - bb.get('offsetHeight'))/2), 15) + Y.one(window).get('scrollTop');","","        if (hidden) {","            bb.addClass(DIALOGUE_PREFIX+'-hidden');","        }","        bb.setStyle('left', x).setStyle('top', y);","    }","}, {","    NAME : DIALOGUE_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        notificationBase : {","","        },","        lightbox : {","            validator : Y.Lang.isBoolean,","            value : true","        },","        closeButton : {","            validator : Y.Lang.isBoolean,","            value : true","        },","        closeButtonTitle : {","            validator : Y.Lang.isString,","            value : 'Close'","        },","        center : {","            validator : Y.Lang.isBoolean,","            value : true","        },","        draggable : {","            validator : Y.Lang.isBoolean,","            value : false","        }","    }","});","","ALERT = function(config) {","    config.closeButton = false;","    ALERT.superclass.constructor.apply(this, [config]);","};","Y.extend(ALERT, DIALOGUE, {","    _enterKeypress : null,","    initializer : function() {","        this.publish('complete');","        var yes = C('<input type=\"button\" id=\"id_yuialertconfirm-' + this.COUNT + '\" value=\"'+this.get(CONFIRMYES)+'\" />'),","            content = C('<div class=\"confirmation-dialogue\"></div>')","                    .append(C('<div class=\"confirmation-message\">'+this.get('message')+'</div>'))","                    .append(C('<div class=\"confirmation-buttons\"></div>')","                            .append(yes));","        this.get(BASE).addClass('moodle-dialogue-confirm');","        this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);","        this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id=\"moodle-dialogue-'+COUNT+'-header-text\">' + this.get(TITLE) + '</h1>', Y.WidgetStdMod.REPLACE);","        this.after('destroyedChange', function(){this.get(BASE).remove();}, this);","        this._enterKeypress = Y.on('key', this.submit, window, 'down:13', this);","        yes.on('click', this.submit, this);","    },","    submit : function() {","        this._enterKeypress.detach();","        this.fire('complete');","        this.hide();","        this.destroy();","    }","}, {","    NAME : ALERT_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        title : {","            validator : Y.Lang.isString,","            value : 'Alert'","        },","        message : {","            validator : Y.Lang.isString,","            value : 'Confirm'","        },","        yesLabel : {","            validator : Y.Lang.isString,","            setter : function(txt) {","                if (!txt) {","                    txt = 'Ok';","                }","                return txt;","            },","            value : 'Ok'","        }","    }","});","","CONFIRM = function(config) {","    CONFIRM.superclass.constructor.apply(this, [config]);","};","Y.extend(CONFIRM, DIALOGUE, {","    _enterKeypress : null,","    _escKeypress : null,","    initializer : function() {","        this.publish('complete');","        this.publish('complete-yes');","        this.publish('complete-no');","        var yes = C('<input type=\"button\" id=\"id_yuiconfirmyes-' + this.COUNT + '\" value=\"'+this.get(CONFIRMYES)+'\" />'),","            no = C('<input type=\"button\" id=\"id_yuiconfirmno-' + this.COUNT + '\" value=\"'+this.get(CONFIRMNO)+'\" />'),","            content = C('<div class=\"confirmation-dialogue\"></div>')","                        .append(C('<div class=\"confirmation-message\">'+this.get(QUESTION)+'</div>'))","                        .append(C('<div class=\"confirmation-buttons\"></div>')","                            .append(yes)","                            .append(no));","        this.get(BASE).addClass('moodle-dialogue-confirm');","        this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);","        this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id=\"moodle-dialogue-'+COUNT+'-header-text\">' + this.get(TITLE) + '</h1>', Y.WidgetStdMod.REPLACE);","        this.after('destroyedChange', function(){this.get(BASE).remove();}, this);","        this._enterKeypress = Y.on('key', this.submit, window, 'down:13', this, true);","        this._escKeypress = Y.on('key', this.submit, window, 'down:27', this, false);","        yes.on('click', this.submit, this, true);","        no.on('click', this.submit, this, false);","    },","    submit : function(e, outcome) {","        this._enterKeypress.detach();","        this._escKeypress.detach();","        this.fire('complete', outcome);","        if (outcome) {","            this.fire('complete-yes');","        } else {","            this.fire('complete-no');","        }","        this.hide();","        this.destroy();","    }","}, {","    NAME : CONFIRM_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        yesLabel : {","            validator : Y.Lang.isString,","            value : 'Yes'","        },","        noLabel : {","            validator : Y.Lang.isString,","            value : 'No'","        },","        title : {","            validator : Y.Lang.isString,","            value : 'Confirm'","        },","        question : {","            validator : Y.Lang.isString,","            value : 'Are you sure?'","        }","    }","});","Y.augment(CONFIRM, Y.EventTarget);","","EXCEPTION = function(config) {","    config.width = config.width || (M.cfg.developerdebug)?Math.floor(Y.one(document.body).get('winWidth')/3)+'px':null;","    config.closeButton = true;","    EXCEPTION.superclass.constructor.apply(this, [config]);","};","Y.extend(EXCEPTION, DIALOGUE, {","    _hideTimeout : null,","    _keypress : null,","    initializer : function(config) {","        var content,","            self = this,","            delay = this.get('hideTimeoutDelay');","        this.get(BASE).addClass('moodle-dialogue-exception');","        this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id=\"moodle-dialogue-'+COUNT+'-header-text\">' + config.name + '</h1>', Y.WidgetStdMod.REPLACE);","        content = C('<div class=\"moodle-exception\"></div>')","                .append(C('<div class=\"moodle-exception-message\">'+this.get('message')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-filename\"><label>File:</label> '+this.get('fileName')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-linenumber\"><label>Line:</label> '+this.get('lineNumber')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-stacktrace\"><label>Stack trace:</label> <pre>'+this.get('stack')+'</pre></div>'));","        if (M.cfg.developerdebug) {","            content.all('.moodle-exception-param').removeClass('hidden');","        }","        this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);","","        if (delay) {","            this._hideTimeout = setTimeout(function(){self.hide();}, delay);","        }","        this.after('visibleChange', this.visibilityChanged, this);","        this.after('destroyedChange', function(){this.get(BASE).remove();}, this);","        this._keypress = Y.on('key', this.hide, window, 'down:13,27', this);","        this.centerDialogue();","    },","    visibilityChanged : function(e) {","        if (e.attrName === 'visible' && e.prevVal && !e.newVal) {","            if (this._keypress) {","                this._keypress.detach();","            }","            var self = this;","            setTimeout(function(){self.destroy();}, 1000);","        }","    }","}, {","    NAME : EXCEPTION_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        message : {","            value : ''","        },","        name : {","            value : ''","        },","        fileName : {","            value : ''","        },","        lineNumber : {","            value : ''","        },","        stack : {","            setter : function(str) {","                var lines = str.split(\"\\n\"),","                    pattern = new RegExp('^(.+)@('+M.cfg.wwwroot+')?(.{0,75}).*:(\\\\d+)$'),","                    i;","                for (i in lines) {","                    lines[i] = lines[i].replace(pattern,","                            \"<div class='stacktrace-line'>ln: $4</div><div class='stacktrace-file'>$3</div><div class='stacktrace-call'>$1</div>\");","                }","                return lines.join('');","            },","            value : ''","        },","        hideTimeoutDelay : {","            validator : Y.Lang.isNumber,","            value : null","        }","    }","});","","AJAXEXCEPTION = function(config) {","    config.name = config.name || 'Error';","    config.closeButton = true;","    AJAXEXCEPTION.superclass.constructor.apply(this, [config]);","};","Y.extend(AJAXEXCEPTION, DIALOGUE, {","    _keypress : null,","    initializer : function(config) {","        var content,","            self = this,","            delay = this.get('hideTimeoutDelay');","        this.get(BASE).addClass('moodle-dialogue-exception');","        this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id=\"moodle-dialogue-'+COUNT+'-header-text\">' + config.name + '</h1>', Y.WidgetStdMod.REPLACE);","        content = C('<div class=\"moodle-ajaxexception\"></div>')","                .append(C('<div class=\"moodle-exception-message\">'+this.get('error')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-debuginfo\"><label>URL:</label> '+this.get('reproductionlink')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-debuginfo\"><label>Debug info:</label> '+this.get('debuginfo')+'</div>'))","                .append(C('<div class=\"moodle-exception-param hidden param-stacktrace\"><label>Stack trace:</label> <pre>'+this.get('stacktrace')+'</pre></div>'));","        if (M.cfg.developerdebug) {","            content.all('.moodle-exception-param').removeClass('hidden');","        }","        this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);","","        if (delay) {","            this._hideTimeout = setTimeout(function(){self.hide();}, delay);","        }","        this.after('visibleChange', this.visibilityChanged, this);","        this._keypress = Y.on('key', this.hide, window, 'down:13, 27', this);","        this.centerDialogue();","    },","    visibilityChanged : function(e) {","        if (e.attrName === 'visible' && e.prevVal && !e.newVal) {","            var self = this;","            this._keypress.detach();","            setTimeout(function(){self.destroy();}, 1000);","        }","    }","}, {","    NAME : AJAXEXCEPTION_NAME,","    CSS_PREFIX : DIALOGUE_PREFIX,","    ATTRS : {","        error : {","            validator : Y.Lang.isString,","            value : 'Unknown error'","        },","        debuginfo : {","            value : null","        },","        stacktrace : {","            value : null","        },","        reproductionlink : {","            setter : function(link) {","                if (link !== null) {","                    link = '<a href=\"'+link+'\">'+link.replace(M.cfg.wwwroot, '')+'</a>';","                }","                return link;","            },","            value : null","        },","        hideTimeoutDelay : {","            validator : Y.Lang.isNumber,","            value : null","        }","    }","});","","M.core = M.core || {};","M.core.dialogue = DIALOGUE;","M.core.alert = ALERT;","M.core.confirm = CONFIRM;","M.core.exception = EXCEPTION;","M.core.ajaxException = AJAXEXCEPTION;","","","}, '@VERSION@', {\"requires\": [\"base\", \"node\", \"panel\", \"event-key\", \"dd-plugin\"]});"];
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].lines = {"1":0,"3":0,"32":0,"33":0,"34":0,"35":0,"41":0,"42":0,"43":0,"44":0,"45":0,"46":0,"49":0,"50":0,"52":0,"55":0,"56":0,"58":0,"63":0,"68":0,"70":0,"72":0,"75":0,"77":0,"78":0,"79":0,"82":0,"83":0,"84":0,"85":0,"86":0,"88":0,"89":0,"90":0,"91":0,"96":0,"99":0,"100":0,"102":0,"103":0,"105":0,"106":0,"108":0,"140":0,"141":0,"142":0,"144":0,"147":0,"148":0,"153":0,"154":0,"155":0,"156":0,"157":0,"158":0,"161":0,"162":0,"163":0,"164":0,"181":0,"182":0,"184":0,"191":0,"192":0,"194":0,"198":0,"199":0,"200":0,"201":0,"208":0,"209":0,"210":0,"211":0,"212":0,"213":0,"214":0,"215":0,"218":0,"219":0,"220":0,"221":0,"222":0,"224":0,"226":0,"227":0,"251":0,"253":0,"254":0,"255":0,"256":0,"258":0,"262":0,"265":0,"266":0,"267":0,"272":0,"273":0,"275":0,"277":0,"278":0,"280":0,"281":0,"282":0,"283":0,"286":0,"287":0,"288":0,"290":0,"291":0,"312":0,"315":0,"316":0,"319":0,"330":0,"331":0,"332":0,"333":0,"335":0,"338":0,"341":0,"342":0,"343":0,"348":0,"349":0,"351":0,"353":0,"354":0,"356":0,"357":0,"358":0,"361":0,"362":0,"363":0,"364":0,"383":0,"384":0,"386":0,"397":0,"398":0,"399":0,"400":0,"401":0,"402":0};
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].functions = {"action:62":0,"DIALOGUE:32":0,"initializer:76":0,"visibilityChanged:81":0,"centerDialogue:95":0,"ALERT:140":0,"(anonymous 2):156":0,"initializer:146":0,"submit:160":0,"setter:180":0,"CONFIRM:191":0,"(anonymous 3):211":0,"initializer:197":0,"submit:217":0,"EXCEPTION:253":0,"(anonymous 4):278":0,"(anonymous 5):281":0,"initializer:261":0,"(anonymous 6):291":0,"visibilityChanged:285":0,"setter:311":0,"AJAXEXCEPTION:330":0,"(anonymous 7):354":0,"initializer:337":0,"(anonymous 8):364":0,"visibilityChanged:360":0,"setter:382":0,"(anonymous 1):1":0};
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].coveredLines = 143;
_yuitest_coverage["build/moodle-core-notification/moodle-core-notification.js"].coveredFunctions = 28;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 1);
YUI.add('moodle-core-notification', function (Y, NAME) {

_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 1)", 1);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 3);
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

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 32);
DIALOGUE = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "DIALOGUE", 32);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 33);
COUNT++;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 34);
var id = 'moodle-dialogue-'+COUNT;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 35);
config.notificationBase =
        new C('<div class="'+CSS.BASE+'">')
              .append(new C('<div id="'+id+'" role="dialog" aria-labelledby="'+id+'-header-text" class="'+CSS.WRAP+'"></div>')
              .append(new C('<div class="'+CSS.HEADER+' yui3-widget-hd"></div>'))
              .append(new C('<div class="'+CSS.BODY+' yui3-widget-bd"></div>'))
              .append(new C('<div class="'+CSS.FOOTER+' yui3-widget-ft"></div>')));
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 41);
Y.one(document.body).append(config.notificationBase);
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 42);
config.srcNode =    '#'+id;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 43);
config.width =      config.width || '400px';
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 44);
config.visible =    config.visible || false;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 45);
config.center =     config.centered || true;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 46);
config.centered =   false;

    // lightbox param to keep the stable versions API.
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 49);
if (config.lightbox !== false) {
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 50);
config.modal = true;
    }
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 52);
delete config.lightbox;

    // closeButton param to keep the stable versions API.
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 55);
if (config.closeButton === false) {
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 56);
config.buttons = null;
    } else {
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 58);
config.buttons = [
            {
                section: Y.WidgetStdMod.HEADER,
                classNames: 'closebutton',
                action: function () {
                    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "action", 62);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 63);
this.hide();
                }
            }
        ];
    }
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 68);
DIALOGUE.superclass.constructor.apply(this, [config]);

    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 70);
if (config.closeButton !== false) {
        // The buttons constructor does not allow custom attributes
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 72);
this.get('buttons').header[0].setAttribute('title', this.get('closeButtonTitle'));
    }
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 75);
Y.extend(DIALOGUE, Y.Panel, {
    initializer : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 76);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 77);
this.after('visibleChange', this.visibilityChanged, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 78);
this.render();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 79);
this.show();
    },
    visibilityChanged : function(e) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "visibilityChanged", 81);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 82);
var titlebar;
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 83);
if (e.attrName === 'visible') {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 84);
this.get('maskNode').addClass(CSS.LIGHTBOX);
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 85);
if (this.get('center') && !e.prevVal && e.newVal) {
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 86);
this.centerDialogue();
            }
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 88);
if (this.get('draggable')) {
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 89);
titlebar = '#' + this.get('id') + ' .' + CSS.HEADER;
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 90);
this.plug(Y.Plugin.Drag, {handles : [titlebar]});
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 91);
Y.one(titlebar).setStyle('cursor', 'move');
            }
        }
    },
    centerDialogue : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "centerDialogue", 95);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 96);
var bb = this.get('boundingBox'),
            hidden = bb.hasClass(DIALOGUE_PREFIX+'-hidden'),
            x, y;
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 99);
if (hidden) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 100);
bb.setStyle('top', '-1000px').removeClass(DIALOGUE_PREFIX+'-hidden');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 102);
x = Math.max(Math.round((bb.get('winWidth') - bb.get('offsetWidth'))/2), 15);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 103);
y = Math.max(Math.round((bb.get('winHeight') - bb.get('offsetHeight'))/2), 15) + Y.one(window).get('scrollTop');

        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 105);
if (hidden) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 106);
bb.addClass(DIALOGUE_PREFIX+'-hidden');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 108);
bb.setStyle('left', x).setStyle('top', y);
    }
}, {
    NAME : DIALOGUE_NAME,
    CSS_PREFIX : DIALOGUE_PREFIX,
    ATTRS : {
        notificationBase : {

        },
        lightbox : {
            validator : Y.Lang.isBoolean,
            value : true
        },
        closeButton : {
            validator : Y.Lang.isBoolean,
            value : true
        },
        closeButtonTitle : {
            validator : Y.Lang.isString,
            value : 'Close'
        },
        center : {
            validator : Y.Lang.isBoolean,
            value : true
        },
        draggable : {
            validator : Y.Lang.isBoolean,
            value : false
        }
    }
});

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 140);
ALERT = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "ALERT", 140);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 141);
config.closeButton = false;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 142);
ALERT.superclass.constructor.apply(this, [config]);
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 144);
Y.extend(ALERT, DIALOGUE, {
    _enterKeypress : null,
    initializer : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 146);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 147);
this.publish('complete');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 148);
var yes = C('<input type="button" id="id_yuialertconfirm-' + this.COUNT + '" value="'+this.get(CONFIRMYES)+'" />'),
            content = C('<div class="confirmation-dialogue"></div>')
                    .append(C('<div class="confirmation-message">'+this.get('message')+'</div>'))
                    .append(C('<div class="confirmation-buttons"></div>')
                            .append(yes));
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 153);
this.get(BASE).addClass('moodle-dialogue-confirm');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 154);
this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 155);
this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id="moodle-dialogue-'+COUNT+'-header-text">' + this.get(TITLE) + '</h1>', Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 156);
this.after('destroyedChange', function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 2)", 156);
this.get(BASE).remove();}, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 157);
this._enterKeypress = Y.on('key', this.submit, window, 'down:13', this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 158);
yes.on('click', this.submit, this);
    },
    submit : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "submit", 160);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 161);
this._enterKeypress.detach();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 162);
this.fire('complete');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 163);
this.hide();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 164);
this.destroy();
    }
}, {
    NAME : ALERT_NAME,
    CSS_PREFIX : DIALOGUE_PREFIX,
    ATTRS : {
        title : {
            validator : Y.Lang.isString,
            value : 'Alert'
        },
        message : {
            validator : Y.Lang.isString,
            value : 'Confirm'
        },
        yesLabel : {
            validator : Y.Lang.isString,
            setter : function(txt) {
                _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "setter", 180);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 181);
if (!txt) {
                    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 182);
txt = 'Ok';
                }
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 184);
return txt;
            },
            value : 'Ok'
        }
    }
});

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 191);
CONFIRM = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "CONFIRM", 191);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 192);
CONFIRM.superclass.constructor.apply(this, [config]);
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 194);
Y.extend(CONFIRM, DIALOGUE, {
    _enterKeypress : null,
    _escKeypress : null,
    initializer : function() {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 197);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 198);
this.publish('complete');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 199);
this.publish('complete-yes');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 200);
this.publish('complete-no');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 201);
var yes = C('<input type="button" id="id_yuiconfirmyes-' + this.COUNT + '" value="'+this.get(CONFIRMYES)+'" />'),
            no = C('<input type="button" id="id_yuiconfirmno-' + this.COUNT + '" value="'+this.get(CONFIRMNO)+'" />'),
            content = C('<div class="confirmation-dialogue"></div>')
                        .append(C('<div class="confirmation-message">'+this.get(QUESTION)+'</div>'))
                        .append(C('<div class="confirmation-buttons"></div>')
                            .append(yes)
                            .append(no));
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 208);
this.get(BASE).addClass('moodle-dialogue-confirm');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 209);
this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 210);
this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id="moodle-dialogue-'+COUNT+'-header-text">' + this.get(TITLE) + '</h1>', Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 211);
this.after('destroyedChange', function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 3)", 211);
this.get(BASE).remove();}, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 212);
this._enterKeypress = Y.on('key', this.submit, window, 'down:13', this, true);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 213);
this._escKeypress = Y.on('key', this.submit, window, 'down:27', this, false);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 214);
yes.on('click', this.submit, this, true);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 215);
no.on('click', this.submit, this, false);
    },
    submit : function(e, outcome) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "submit", 217);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 218);
this._enterKeypress.detach();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 219);
this._escKeypress.detach();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 220);
this.fire('complete', outcome);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 221);
if (outcome) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 222);
this.fire('complete-yes');
        } else {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 224);
this.fire('complete-no');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 226);
this.hide();
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 227);
this.destroy();
    }
}, {
    NAME : CONFIRM_NAME,
    CSS_PREFIX : DIALOGUE_PREFIX,
    ATTRS : {
        yesLabel : {
            validator : Y.Lang.isString,
            value : 'Yes'
        },
        noLabel : {
            validator : Y.Lang.isString,
            value : 'No'
        },
        title : {
            validator : Y.Lang.isString,
            value : 'Confirm'
        },
        question : {
            validator : Y.Lang.isString,
            value : 'Are you sure?'
        }
    }
});
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 251);
Y.augment(CONFIRM, Y.EventTarget);

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 253);
EXCEPTION = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "EXCEPTION", 253);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 254);
config.width = config.width || (M.cfg.developerdebug)?Math.floor(Y.one(document.body).get('winWidth')/3)+'px':null;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 255);
config.closeButton = true;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 256);
EXCEPTION.superclass.constructor.apply(this, [config]);
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 258);
Y.extend(EXCEPTION, DIALOGUE, {
    _hideTimeout : null,
    _keypress : null,
    initializer : function(config) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 261);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 262);
var content,
            self = this,
            delay = this.get('hideTimeoutDelay');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 265);
this.get(BASE).addClass('moodle-dialogue-exception');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 266);
this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id="moodle-dialogue-'+COUNT+'-header-text">' + config.name + '</h1>', Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 267);
content = C('<div class="moodle-exception"></div>')
                .append(C('<div class="moodle-exception-message">'+this.get('message')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-filename"><label>File:</label> '+this.get('fileName')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-linenumber"><label>Line:</label> '+this.get('lineNumber')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-stacktrace"><label>Stack trace:</label> <pre>'+this.get('stack')+'</pre></div>'));
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 272);
if (M.cfg.developerdebug) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 273);
content.all('.moodle-exception-param').removeClass('hidden');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 275);
this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);

        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 277);
if (delay) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 278);
this._hideTimeout = setTimeout(function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 4)", 278);
self.hide();}, delay);
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 280);
this.after('visibleChange', this.visibilityChanged, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 281);
this.after('destroyedChange', function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 5)", 281);
this.get(BASE).remove();}, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 282);
this._keypress = Y.on('key', this.hide, window, 'down:13,27', this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 283);
this.centerDialogue();
    },
    visibilityChanged : function(e) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "visibilityChanged", 285);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 286);
if (e.attrName === 'visible' && e.prevVal && !e.newVal) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 287);
if (this._keypress) {
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 288);
this._keypress.detach();
            }
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 290);
var self = this;
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 291);
setTimeout(function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 6)", 291);
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
                _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "setter", 311);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 312);
var lines = str.split("\n"),
                    pattern = new RegExp('^(.+)@('+M.cfg.wwwroot+')?(.{0,75}).*:(\\d+)$'),
                    i;
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 315);
for (i in lines) {
                    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 316);
lines[i] = lines[i].replace(pattern,
                            "<div class='stacktrace-line'>ln: $4</div><div class='stacktrace-file'>$3</div><div class='stacktrace-call'>$1</div>");
                }
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 319);
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

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 330);
AJAXEXCEPTION = function(config) {
    _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "AJAXEXCEPTION", 330);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 331);
config.name = config.name || 'Error';
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 332);
config.closeButton = true;
    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 333);
AJAXEXCEPTION.superclass.constructor.apply(this, [config]);
};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 335);
Y.extend(AJAXEXCEPTION, DIALOGUE, {
    _keypress : null,
    initializer : function(config) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "initializer", 337);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 338);
var content,
            self = this,
            delay = this.get('hideTimeoutDelay');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 341);
this.get(BASE).addClass('moodle-dialogue-exception');
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 342);
this.setStdModContent(Y.WidgetStdMod.HEADER, '<h1 id="moodle-dialogue-'+COUNT+'-header-text">' + config.name + '</h1>', Y.WidgetStdMod.REPLACE);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 343);
content = C('<div class="moodle-ajaxexception"></div>')
                .append(C('<div class="moodle-exception-message">'+this.get('error')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-debuginfo"><label>URL:</label> '+this.get('reproductionlink')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-debuginfo"><label>Debug info:</label> '+this.get('debuginfo')+'</div>'))
                .append(C('<div class="moodle-exception-param hidden param-stacktrace"><label>Stack trace:</label> <pre>'+this.get('stacktrace')+'</pre></div>'));
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 348);
if (M.cfg.developerdebug) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 349);
content.all('.moodle-exception-param').removeClass('hidden');
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 351);
this.setStdModContent(Y.WidgetStdMod.BODY, content, Y.WidgetStdMod.REPLACE);

        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 353);
if (delay) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 354);
this._hideTimeout = setTimeout(function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 7)", 354);
self.hide();}, delay);
        }
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 356);
this.after('visibleChange', this.visibilityChanged, this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 357);
this._keypress = Y.on('key', this.hide, window, 'down:13, 27', this);
        _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 358);
this.centerDialogue();
    },
    visibilityChanged : function(e) {
        _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "visibilityChanged", 360);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 361);
if (e.attrName === 'visible' && e.prevVal && !e.newVal) {
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 362);
var self = this;
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 363);
this._keypress.detach();
            _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 364);
setTimeout(function(){_yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "(anonymous 8)", 364);
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
                _yuitest_coverfunc("build/moodle-core-notification/moodle-core-notification.js", "setter", 382);
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 383);
if (link !== null) {
                    _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 384);
link = '<a href="'+link+'">'+link.replace(M.cfg.wwwroot, '')+'</a>';
                }
                _yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 386);
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

_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 397);
M.core = M.core || {};
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 398);
M.core.dialogue = DIALOGUE;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 399);
M.core.alert = ALERT;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 400);
M.core.confirm = CONFIRM;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 401);
M.core.exception = EXCEPTION;
_yuitest_coverline("build/moodle-core-notification/moodle-core-notification.js", 402);
M.core.ajaxException = AJAXEXCEPTION;


}, '@VERSION@', {"requires": ["base", "node", "panel", "event-key", "dd-plugin"]});

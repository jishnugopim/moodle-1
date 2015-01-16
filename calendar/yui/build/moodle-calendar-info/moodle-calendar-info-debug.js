YUI.add('moodle-calendar-info', function (Y, NAME) {

var LOGNAME = 'moodle-calendar-info',
    CALENDARNODE = 'calendarNode',
    DOT = '.',
    HASEVENT = 'hasevent',
    EVENTTITLE = 'eventtitle',
    EVENTCONTENT = 'eventcontent',
    EVENTDELAY = 'delay',
    BOUNDINGBOX = 'boundingBox',
    ARIALIVE = 'aria-live',
    INNERHTML = 'innerHTML',
    INFO = function() {
        INFO.superclass.constructor.apply(this, arguments);
    };


Y.extend(INFO, Y.Base, {
    _events: null,

    _showTimer: null,
    _hideTimer: null,
    _panel: null,

    initializer: function() {
        var calendar = this.get(CALENDARNODE);

        if (calendar === null) {
            // Bail - the calendar could not be found.
            Y.log('Unable to find the calendar, exiting early', 'debug', LOGNAME);
            return;
        }

        calendar.delegate(['mouseenter', 'focus'], this.startShow, DOT + HASEVENT, this);
        calendar.delegate(['mouseleave', 'blur'], this.startHide, DOT + HASEVENT, this);
    },
    initPanel: function() {
        if (!this._panel) {
            var constraint = this.get(CALENDARNODE).ancestor('div');

            this._panel = new Y.Overlay({
                headerContent: Y.Node.create('<h2 class="' + EVENTTITLE + '"/>'),
                bodyContent: Y.Node.create('<div class="' + EVENTCONTENT + '"/>'),
                visible: false,
                render: constraint,
                constrain: constraint,
                width: (constraint.get('offsetWidth') * 0.9) + 'px'
            });

            this._panel.get(BOUNDINGBOX)
                .addClass('calendar-event-panel')
                .setAttribute(ARIALIVE, 'off');

            this._panel.on('visibleChange', function(e) {
                // Assume showing.
                var state = 'assertive';
                if (e.prevVal && !e.newVal) {
                    // Hiding.
                    state = 'off';
                }
                this.get(BOUNDINGBOX).setAttribute(ARIALIVE, state);
            });
        }
    },
    startShow: function(e) {
        this.cancelHide()
            .cancelShow()

        // Initialise the panel now - this will only happen once. This way
        // it's ready for when the timer times out.
            .initPanel();


        this._showTimer = setTimeout(Y.bind(function() {
                this.show(e.currentTarget);
            }, this), this.get(EVENTDELAY));
    },
    show: function(target) {
        var bb = this._panel.get(BOUNDINGBOX),
            widgetPositionAlign = Y.WidgetPositionAlign;

        bb.one(DOT + EVENTTITLE).set(INNERHTML, target.getData('title'));
        bb.one(DOT + EVENTCONTENT).set(INNERHTML, target.getData('popupcontent'));

        // Move the panel to the current target.
        target.appendChild(bb);

        this._panel
            // Align it with the area clicked.
            .align(target, [
                    widgetPositionAlign.TL,
                    widgetPositionAlign.BC
                ])
            // Show it.
            .show();
    },
    cancelShow: function() {
        if (this._showTimer) {
            clearTimeout(this._showTimer);
        }
        return this;
    },
    startHide: function() {
        this.cancelShow()
            .cancelHide()
            ._hideTimer = setTimeout(Y.bind(this._panel.hide, this._panel), this.get(EVENTDELAY));
    },
    cancelHide: function() {
        if (this._hideTimer) {
            clearTimeout(this._hideTimer);
        }
        return this;
    }
}, {
    NAME: 'calendarInfo',
    ATTRS: {
        calendarNode: {
            value: null,
            setter: function(id) {
                return Y.one('#' + id);
            }
        },
        delay: {
            value: 300
        }
    }
});

Y.namespace('M.calendar.info').init = function(config) {
    return new INFO(config);
};


}, '@VERSION@', {"requires": ["base", "node", "event-mouseenter", "overlay", "moodle-calendar-info-skin"]});

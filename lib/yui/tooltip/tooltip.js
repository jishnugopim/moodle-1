YUI.add('moodle-core-tooltip', function (Y) {

    var TOOLTIP = function (config) {
        if (!config) {
            config = {};
        }

        // Override the default options provided by the parent class.
        if (typeof config.draggable === 'undefined') {
            config.draggable = true;
        }

        if (typeof config.constrain === 'undefined') {
            config.constrain = true;
        }

        if (typeof config.lightbox === 'undefined') {
            config.lightbox = false;
        }

        TOOLTIP.superclass.constructor.apply(this, [config]);
    },

    SELECTORS = {
        CLOSEBUTTON : '.closebutton'
    },

    CSS = {
        PANELTEXT : 'tooltiptext'
    };

    TOOLTIP.NAME = 'moodle-core-tooltip';
    TOOLTIP.CSS_PREFIX = 'moodle-core-tooltip';
    TOOLTIP.ATTRS = {
        initialheadertext : {
            value : ''
        },
        initialbodytext : {
            value : '',
            setter : function(content) {
                var parentnode, spinner;
                parentnode = Y.Node.create('<div />')
                    .set('text', content)
                    .addClass(CSS.PANELTEXT);

                spinner = M.util.add_spinner(Y, parentnode);
                spinner.show();
                return parentnode;
            }
        },
        initialfootertext : {
            value : null,
            setter : function(content) {
                if (content) {
                    return Y.Node.create('<div />')
                        .set('text', content);
                }
            }
        },

        headerhandler : {
            value : null
        },
        bodyhandler : {
            value : null
        },
        footerhandler : {
            value : null
        },

        /**
         * Set the Y.Cache object to use.
         *
         * By default a new Y.Cache object will be created for each instance of the tooltip.
         *
         * In certain situations, where multiple tooltips may share the same cache, it may be preferable to
         * seed this cache from the calling method.
         *
         * @attr textcache
         * @type {Y.Cache|null}
         * @default null
         */
        textcache : {
            value : null
        }
    };

    Y.extend(TOOLTIP, M.core.dialogue, {
        // The bounding box.
        bb : null,

        // Any event listeners we may need to cancel later.
        listenevents : [],

        // Cache of objects we've already retrieved.
        textcache : null,

        // The align position. This differs for RTL languages so we calculate once and store.
        alignpoints : [
            Y.WidgetPositionAlign.TL,
            Y.WidgetPositionAlign.RC
        ],

        initializer : function () {
            // Set the initial values for the handlers.
            // These cannot be set in the attributes section as context isn't present at that time.
            if (!this.get('headerhandler')) {
                this.set('headerhandler', this.set_header_content);
            }
            if (!this.get('bodyhandler')) {
                this.set('bodyhandler', this.set_body_content);
            }
            if (!this.get('footerhandler')) {
                this.set('footerhandler', function() {});
            }

            // Set up the dialogue initially.
            this.setup_panel();
        },

        setup_panel : function () {
            this.setAttrs({
                headerContent : this.get('initialheadertext'),
                bodyContent   : this.get('initialbodytext'),
                footerContent : this.get('initialfootertext'),
                zIndex        : 150
            });

            // Hide and then render the dialogue.
            this.render();

            // Hook into a few useful areas.
            this.bb = this.get('boundingBox');

            // Change the alignment if this is an RTL language.
            if (right_to_left()) {
                this.alignpoints = [
                    Y.WidgetPositionAlign.TR,
                    Y.WidgetPositionAlign.LC
                ];
            }

            // Set up the text cache if it's not set up already.
            if (!this.get('textcache')) {
                this.set('textcache', new Y.Cache({
                    // Set a maximum cache size to prevent memory growth
                    'max' : 10
                }));
            }

            return this;
        },

        display_panel : function (e) {
            var clickedlink, thisevent, ajaxurl, config, errors, cacheentry;

            // Prevent the default click action and prevent the event triggering anything else.
            e.preventDefault();
            e.stopPropagation();

            // Cancel any existing listeners and close the panel if it's already open.
            this.cancel_events();

            // Grab the clickedlink - this contains the URL we fetch and we align the panel to it.
            clickedlink = e.target.ancestor('a', true);

            // Align with the link that was clicked.
            this.align(clickedlink, this.alignpoints);

            // Reset the initial text to a spinner while we retrieve the text.
            this.setAttrs({
                headerContent : this.get('initialheadertext'),
                bodyContent   : this.get('initialbodytext'),
                footerContent : this.get('initialfootertext')
            });

            // Now that initial setup has begun, show the panel.
            this.show();

            // Add some listen events to close on.
            thisevent = this.bb.delegate('click', this.close_panel, SELECTORS.CLOSEBUTTON, this);
            this.listenevents.push(thisevent);

            thisevent = Y.one('body').on('key', this.close_panel, 'esc', this);
            this.listenevents.push(thisevent);

            // Listen for mousedownoutside events - clickoutside is broken on IE.
            thisevent = this.bb.on('mousedownoutside', this.close_panel, this);
            this.listenevents.push(thisevent);

            ajaxurl = clickedlink.get('href');

            cacheentry = this.get('textcache').retrieve(ajaxurl);
            if (cacheentry) {
                // The data from this help call was already cached so use that and avoid an AJAX call.
                this.set_panel_contents(cacheentry.response);
            } else {
                // Retrieve the actual help text we should use.
                config = {
                    method : 'get',
                    context : this,
                    sync : false,
                    data : {
                        // We use a slightly different AJAX URL to the one on the anchor to allow non-JS fallback.
                        'ajax' : 1
                    },
                    on : {
                        success : function (tid, response) {
                            this.set_panel_contents(response.responseText, ajaxurl);
                        },
                        failure : function (tid, response) {
                            errors = new M.core.ajaxException(response);
                        }
                    }
                };

                Y.io(clickedlink.get('href'), config);
            }
        },

        set_panel_contents : function (response, ajaxurl) {
            var responseobject;

            // Attempt to parse the response into an object.
            try {
                responseobject = Y.JSON.parse(response);
                if (responseobject.error) {
                    new M.core.ajaxException(responseobject);
                }
            } catch (error) {
                this.close_panel();
                new M.core.exception({
                    'name' : error.name,
                    'message' : "Unable to retrieve the requested content. The following error was returned: " + error.message
                });
            }

            // Set the contents using various handlers.
            Y.bind(this.get('headerhandler'), this, responseobject)();
            Y.bind(this.get('bodyhandler'), this, responseobject)();
            Y.bind(this.get('footerhandler'), this, responseobject)();

            if (ajaxurl) {
                // Ensure that this data is added to the cache.
                this.get('textcache').add(ajaxurl, response);
            }

            this.get('buttons').header[0].focus();
        },

        set_header_content : function(responseobject) {
            this.set('headerContent', responseobject.heading);
        },
        set_body_content : function(responseobject) {
            var bodycontent = Y.Node.create('<div />')
                .set('innerHTML', responseobject.text)
                .setAttribute('role', 'definition')
                .addClass(CSS.PANELTEXT);
            this.set('bodyContent', bodycontent);
        },
        set_footer_content : function() {
        },

        close_panel : function (e) {
            // Hide the panel first.
            this.hide();

            // Cancel the listeners that we add
            this.cancel_events();

            // Prevent any default click that the close button may have.
            if (e) {
                e.preventDefault();
            }
        },
        cancel_events : function () {
            // Detach all listen events to prevent duplicate triggers.
            var thisevent;
            while (this.listenevents.length) {
                thisevent = this.listenevents.shift();
                thisevent.detach();
            }
        }
    });
    M.core = M.core || {};
    M.core.tooltip = M.core.tooltip = TOOLTIP;
},
'@VERSION@', {
    requires:['base', 'io-base', 'moodle-core-notification', 'json-parse',
            'widget-position', 'widget-position-align', 'event-outside', 'cache']
}
);

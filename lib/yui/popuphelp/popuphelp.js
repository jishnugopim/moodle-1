YUI.add('moodle-core-popuphelp', function (Y) {
    var POPUPHELP = function () {
        POPUPHELP.superclass.constructor.apply(this, arguments);
    };

    Y.extend(POPUPHELP, Y.Base, {
        // Reference to the panel we create.
        panel: null,

        // The bounding box.
        bb : null,

        // The initial values.
        initialhead : null,
        initialbody : null,
        initialfoot : null,

        // Any event listeners we may need to cancel later.
        listenevents : [],

        // Cache of help objects we've already retrieved.
        helpcache : {},

        // The align position. This differs for RTL languages so we calculate once and store.
        align : [
            Y.WidgetPositionAlign.TL,
            Y.WidgetPositionAlign.RC
        ],

        initializer : function () {
            Y.one('body').delegate('click', this.display_panel, 'a.helpicon', this);
        },
        display_panel : function (e) {
            if (!this.panel) {
                // Only set up the panel when required.
                this.setup_panel();
            }

            var helplink, thisevent, ajaxurl, config, errors;

            // Prevent the default click action and prevent the event triggering anything else.
            e.preventDefault();
            e.stopPropagation();

            // Cancel any existing listeners and close the panel if it's already open.
            this.close_panel(e);

            // Grab the helplink - this contains the URL we fetch and we align the panel to it.
            helplink = e.target.ancestor('a', true);

            // Align with the link that was clicked.
            this.panel.align(helplink, this.align);

            // Reset the initial text to a spinner while we retrieve the text.
            this.panel.setAttrs({
                headerContent : this.initialhead,
                bodyContent   : this.initialbody,
                footerContent : this.initialfoot
            });

            // Now that initial setup has begun, show the panel.
            this.panel.show();

            // Add some listen events to close on.
            thisevent = this.bb.delegate('click', this.close_panel, '.closebutton', this);
            this.listenevents.push(thisevent);

            thisevent = Y.one('body').on('keyup', function (e) {
                if (e.keyCode === 27) {
                    this.close_panel(e);
                }
            }, this);
            this.listenevents.push(thisevent);

            // Listen for mousedownoutside events - clickoutside is broken on IE.
            thisevent = this.bb.on('mousedownoutside', this.close_panel, this);
            this.listenevents.push(thisevent);

            // We use a slightly different AJAX URL to the one on the anchor.
            ajaxurl = helplink.get('href') + '&ajax=1';

            if (this.helpcache[ajaxurl]) {
                // The data from this help call was already cached so use that and avoid an AJAX call.
                this.set_panel_contents(this.helpcache[ajaxurl]);
            } else {
                // Retrieve the actual help text we should use.
                config = {
                    method : 'get',
                    context : this,
                    sync : false,
                    on : {
                        success : function (tid, response) {
                            this.set_panel_contents(response.responseText, ajaxurl);
                        },
                        failure : function (tid, response) {
                            errors = new M.core.ajaxException(response);
                        }
                    }
                };

                Y.io(ajaxurl, config);
            }
        },

        set_panel_contents : function (helpresponse, ajaxurl) {
            try {
                var helpobject, bodycontent, doclink, helpicon, errors;
                helpobject = Y.JSON.parse(helpresponse);
                if (helpobject.error) {
                    errors = new M.core.ajaxException(helpobject);
                }

                // We always have body and header content.
                bodycontent = Y.Node.create('<div />')
                    .set('innerHTML', helpobject.text)
                    .setAttribute('role', 'definition');

                this.panel.set('bodyContent', bodycontent);
                this.panel.set('headerContent', helpobject.heading);

                // Check for an optional link to documentation on moodle.org.
                if (helpobject.doclink) {
                    // Wrap a help icon and the morehelp text in an anchor. The class of the anchor should
                    // determine whether it's opened in a new window or not.
                    doclink = Y.Node.create('<a />')
                        .setAttrs({
                            'href' : helpobject.doclink.link
                        })
                        .addClass(helpobject.doclink['class']);
                    helpicon = Y.Node.create('<img />')
                        .setAttrs({
                            'alt'   : M.util.get_string('morehelp', 'moodle'),
                            'title' : M.util.get_string('morehelp', 'moodle'),
                            'src'   : M.util.image_url('docs', 'core')
                        })
                        .addClass('iconhelp');
                    doclink.appendChild(helpicon);
                    doclink.appendChild(helpobject.doclink.linktext);

                    // Set the footerContent to the contents of the doclink.
                    this.panel.set('footerContent', doclink);
                }

                if (ajaxurl) {
                    // Ensure that this data is in the cache.
                    this.helpcache[ajaxurl] = helpresponse;
                }
            } catch (e) {}
        },

        setup_panel : function () {
            var innerbodycontent, params;
            this.initialhead = M.util.get_string('loadinghelp', 'moodle');

            this.initialbody = Y.Node.create('<div />')
                .addClass('mainbody');
            innerbodycontent = Y.Node.create('<div />')
                .addClass('helptext');
            innerbodycontent.set('text', M.util.get_string('loadinghelpbody', 'moodle'));
            this.spinner = M.util.add_spinner(Y, innerbodycontent);
            this.spinner.show();

            this.initialbody.appendChild(innerbodycontent);

            this.initialfoot = Y.Node.create('<div />');

            // Dialogue configuration
            params = {
                bodyContent : this.initialbody,
                headerContent : this.initialhead,
                footerContent : this.initialfoot,
                draggable : true,
                visible : false, // Hide by default
                zIndex : 150, // Display in front of other items
                lightbox : false, // This dialogue should not be modal
                constrain : true,
                id : 'panelhelp'
            };
            // Create the new overlay.
            this.panel = new M.core.dialogue(params);

            // Hide and then render the dialogue.
            this.panel.hide();
            this.panel.render();

            // Hook into a few useful areas.
            this.bb = this.panel.get('boundingBox');

            // Change the alignment if this is an RTL language.
            if (Y.one('body').hasClass('dir-rtl')) {
                this.align = [
                    Y.WidgetPositionAlign.TR,
                    Y.WidgetPositionAlign.LC
                ];
            }

            return this.panel;
        },
        close_panel : function (e) {
            // Hide the panel first.
            this.panel.hide();

            // Detach all listen events to prevent duplicate triggers.
            var thisevent;
            while (this.listenevents.length) {
                thisevent = this.listenevents.shift();
                thisevent.detach();
            }

            // Prevent any default click that the close button may have.
            e.preventDefault();
        }
    },
    {
        NAME : 'moodle-core-popuphelp',
        ATTRS : {
        }
    });
    M.core = M.core || {};
    M.core.popuphelp = M.core.popuphelp || function (config) {
        return new POPUPHELP(config);
    };
},
'@VERSION@', {
    requires:['base', 'io-base', 'moodle-core-notification', 'json-parse', 'widget-position', 'widget-position-align', 'event-outside']
}
);

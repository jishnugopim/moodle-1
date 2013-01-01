YUI.add('moodle-core-chooserdialogue', function(Y) {

    var CHOOSERDIALOGUE = function() {
        CHOOSERDIALOGUE.superclass.constructor.apply(this, arguments);
    };

    Y.extend(CHOOSERDIALOGUE, Y.Base, {
        // The panel widget
        panel: null,

        // The submit button - we disable this until an element is set
        submitbutton : null,

        // The chooserdialogue container
        container : null,

        // Any event listeners we may need to cancel later
        listenevents : [],

        // The initial overflow setting
        initialoverflow : '',

        bodycontent : null,
        headercontent : null,
        instanceconfig : null,

        searchfield : null,
        searchfield_div : null,
        filter : null,

        setup_chooser_dialogue : function(bodycontent, headercontent, config) {
            this.bodycontent = bodycontent;
            this.headercontent = headercontent;
            this.instanceconfig = config;
        },

        prepare_chooser : function () {
            if (this.panel) {
                return;
            }

            // Set Default options
            var params = {
                bodyContent : this.bodycontent.get('innerHTML'),
                headerContent : this.headercontent.get('innerHTML'),
                width : '540px',
                draggable : true,
                usefilter : true,
                visible : false, // Hide by default
                zindex : 100, // Display in front of other items
                lightbox : true, // This dialogue should be modal
                shim : true,
                closeButtonTitle : this.get('closeButtonTitle')
            },
            paramkey;

            // Override with additional options
            for (paramkey in this.instanceconfig) {
              params[paramkey] = this.instanceconfig[paramkey];
            }

            // Create the panel
            this.panel = new M.core.dialogue(params);

            // Remove the template for the chooser
            this.bodycontent.remove();
            this.headercontent.remove();

            // Hide and then render the panel
            this.panel.hide();
            this.panel.render();

            // Set useful links
            this.container = this.panel.get('boundingBox').one('.choosercontainer');
            this.options = this.container.all('.option input[type=radio]');

            // Add the chooserdialogue class to the container for styling
            this.panel.get('boundingBox').addClass('chooserdialogue');

            // Setup the filter
            if (params.usefilter) {
                this.setup_filter();
            }
        },

        setup_filter : function () {
            var ChooserFilter;

            // Create a ChooserFilter class which mixes Y.AutoCompleteBase with Y.Base
            ChooserFilter = Y.Base.create('chooserFilter', Y.Base, [Y.AutoCompleteBase], {
                initializer: function () {
                  this._bindUIACBase();
                  this._syncUIACBase();
                }
            });

            // Create a hidden input to receive the text
            this.searchfield = Y.Node.create("<input type='text' />")
                .addClass('autocomplete')
                .setAttribute('placeholder', M.util.get_string('filter', 'moodle'));

            this.searchfield_div = Y.Node.create('<div />');
            this.searchfield_div.addClass('autocompletewrapper');
            this.searchfield_div.appendChild(this.searchfield);

            // Append the searchfield_div
            this.container.one('.alloptions').prepend(this.searchfield_div);

            this.searchfield.on('key', function(e) {
                var optionlist, currentselection, newselection,
                    previousnode = null,
                    usenext = false,
                    found = false;
                optionlist = this.container.all('div.option:not(.hidden)');

                if (optionlist.size() > 0) {
                    // If results were found, stop the default arrow action within the textbox
                    e.preventDefault();
                }

                // Get the current selection so we can work out which option to select next
                currentselection = this.container.one('div.option.selected');

                // Select the first option if the there's only one or we don't have any selected
                if (optionlist.size() === 1 || !currentselection) {
                    // Select this one
                    newselection = optionlist.shift();
                    newselection.one('input[type=radio]').set('checked', 'checked');
                    found = true;
                }

                if (!found) {
                    previousnode = null;
                    usenext = false;
                    optionlist.each(function (node) {
                        if (node === currentselection) {
                            if (e.keyCode === 38) {
                                if (previousnode) {
                                    previousnode.one('input[type=radio]').set('checked', 'checked');
                                }
                            } else {
                                usenext = true;
                            }
                        } else if (usenext) {
                            node.one('input[type=radio]').set('checked', 'checked');
                            usenext = false;
                        }
                        previousnode = node;
                    });
                }

                // Actually make the selection
                this.check_options();

                // check_options steals focus
                // Focus the searchfield again otherwise the back key navigates away
                this.searchfield.focus();
            }, 'down:38,40', this);

            this.container.on('keydown', function(e) {
                var regex;

                this.searchfield.focus();

                // Check that the key was a valid character
                regex = new RegExp('[\\s\\S]', "i");
                if (e.keyCode < 48 || !regex.test(String.fromCharCode(e.keyCode))) {
                    return;
                }

                // Focus on the searchfield now so that the character is entered into it
                this.searchfield.focus();
            }, this);

            // Create and configure an instance of the PieFilter class.
            this.filter = new ChooserFilter({
                inputNode: this.searchfield,
                minQueryLength: 0,
                queryDelay: 0,
                container: this.container,

                // Run an immediately-invoked function that returns an array of results to
                // be used for each query, based on the nodes on the page. Since the list
                // of nodes remains static, this saves time by not gathering the results
                // for each query.
                source: (function (container) {
                    var results = [];

                    // Build an array of results containing each node in the list.
                    container.all('div.option').each(function (node) {
                        results.push({
                            node: node,
                            tags: node.one('.typename').get('innerHTML')
                        });
                    });

                    return results;
                }(this.container)),

                // Specify that the "tags" property of each result object contains the text
                // to filter on.
                resultTextLocator: 'tags',

                // Use a result filter to filter the results based on their tags.
                resultFilters: 'phraseMatch',

                // Create a highlight filter to highlight the node results based onthe filter
                resultHighlighter: function(query, results, caseSensitive) {
                    return Y.Array.map(results, function(result) {
                        var newtext = Y.Highlight.all(result.text, [query], {
                            caseSensitive: caseSensitive
                        });
                        result.raw.node.one('.typename').set('innerHTML', newtext);
                    });
                }
            }, this);

            // Subscribe to the "results" event and update node visibility based on
            // whether or not they were included in the list of results.
            this.filter.on('results', function (e) {
                var currentselection,
                    firstresult,
                    hasselection;
                // First hide all the photos.
                this.container.all('div.option').addClass('hidden');

                // Then unhide the ones that are in the current result list.
                Y.Array.each(e.results, function (result) {
                  result.raw.node.removeClass('hidden');
                });

                // Get the currently selected option and unset it if relevant
                currentselection = this.container.one('div.option.selected');
                if (currentselection) {
                    currentselection.one('input[type=radio]').set('checked', '');
                }

                // Select the first result if we have a query, or already have a selected option
                firstresult = e.results.shift();
                hasselection = this.container.one('div.option.selected');
                if ((e.query.length || hasselection) && firstresult) {
                    firstresult.raw.node.one('input[type=radio]').set('checked', 'checked');
                }
                this.check_options();

                // check_options steals focus
                // Focus the searchfield again otherwise the back key navigates away
                this.searchfield.focus();
            }, this);
        },

        /**
         * Display the module chooser
         *
         * @param e Event Triggering Event
         * @return void
         */
        display_chooser : function (e) {
            this.prepare_chooser();

            // Stop the default event actions before we proceed
            e.preventDefault();

            var bb = this.panel.get('boundingBox');
            var dialogue = this.container.one('.alloptions');

            // Get the overflow setting when the chooser was opened - we
            // may need this later
            if (Y.UA.ie > 0) {
                this.initialoverflow = Y.one('html').getStyle('overflow');
            } else {
                this.initialoverflow = Y.one('body').getStyle('overflow');
            }

            var thisevent;

            // This will detect a change in orientation and retrigger centering
            thisevent = Y.one('document').on('orientationchange', function(e) {
                this.center_dialogue(dialogue);
            }, this);
            this.listenevents.push(thisevent);

            // Detect window resizes (most browsers)
            thisevent = Y.one('window').on('resize', function(e) {
                this.center_dialogue(dialogue);
            }, this);
            this.listenevents.push(thisevent);

            // These will trigger a check_options call to display the correct help
            thisevent = this.container.on('click', function(e) {
                this.check_options();
                if (this.searchfield && this.searchfield.contains(e.target)) {
                    this.searchfield.focus();
                }
            }, this);
            this.listenevents.push(thisevent);
            thisevent = this.container.on('key_up', this.check_options, this);
            this.listenevents.push(thisevent);
            thisevent = this.container.on('dblclick', function(e) {
                if (e.target.ancestor('div.option')) {
                    this.check_options();

                    // Prevent duplicate submissions
                    this.submitbutton.setAttribute('disabled', 'disabled');
                    this.options.setAttribute('disabled', 'disabled');
                    this.cancel_listenevents();

                    this.container.one('form').submit();
                }
            }, this);
            this.listenevents.push(thisevent);

            this.container.one('form').on('submit', function(e) {
                // Prevent duplicate submissions on submit
                this.submitbutton.setAttribute('disabled', 'disabled');
                this.options.setAttribute('disabled', 'disabled');
                this.cancel_listenevents();
            }, this);

            // Hook onto the cancel button to hide the form
            thisevent = this.container.one('.addcancel').on('click', this.cancel_popup, this);
            this.listenevents.push(thisevent);

            // Hide will be managed by cancel_popup after restoring the body overflow
            thisevent = bb.one('button.closebutton').on('click', this.cancel_popup, this);
            this.listenevents.push(thisevent);

            // Grab global keyup events and handle them
            thisevent = Y.one('document').on('keyup', this.handle_key_press, this);
            this.listenevents.push(thisevent);

            // Add references to various elements we adjust
            this.jumplink     = this.container.one('.jump');
            this.submitbutton = this.container.one('.submitbutton');

            // Disable the submit element until the user makes a selection
            this.submitbutton.set('disabled', 'true');

            // Ensure that the options are shown
            this.options.removeAttribute('disabled');

            // Clear the autocomplete searchfield
            if (this.searchfield) {
                this.searchfield.set('value', '');
                this.filter.sendRequest('');
            }

            // Display the panel
            this.panel.show();

            // Re-centre the dialogue after we've shown it.
            this.center_dialogue(dialogue);

            // Finally, focus the first radio element - this enables form selection via the keyboard
            this.container.one('.option input[type=radio]').focus();

            // Trigger check_options to set the initial jumpurl
            this.check_options();
        },

        /**
         * Cancel any listen events in the listenevents queue
         *
         * Several locations add event handlers which should only be called before the form is submitted. This provides
         * a way of cancelling those events.
         *
         * @return void
         */
        cancel_listenevents : function () {
            // Detach all listen events to prevent duplicate triggers
            var thisevent;
            while (this.listenevents.length) {
                thisevent = this.listenevents.shift();
                thisevent.detach();
            }
        },

        /**
         * Calculate the optimum height of the chooser dialogue
         *
         * This tries to set a sensible maximum and minimum to ensure that some options are always shown, and preferably
         * all, whilst fitting the box within the current viewport.
         *
         * @param dialogue Y.Node The dialogue
         * @return void
         */
        center_dialogue : function(dialogue) {
            var bb = this.panel.get('boundingBox');

            var winheight = bb.get('winHeight');
            var winwidth = bb.get('winWidth');
            var offsettop = 0;

            // Try and set a sensible max-height -- this must be done before setting the top
            // Set a default height of 640px
            var newheight = this.get('maxheight');
            if (winheight <= newheight) {
                // Deal with smaller window sizes
                if (winheight <= this.get('minheight')) {
                    newheight = this.get('minheight');
                } else {
                    newheight = winheight;
                }
            }

            // Set a fixed position if the window is large enough
            if (newheight > this.get('minheight')) {
                bb.setStyle('position', 'fixed');
                // Disable the page scrollbars
                if (Y.UA.ie > 0) {
                    Y.one('html').setStyle('overflow', 'hidden');
                } else {
                    Y.one('body').setStyle('overflow', 'hidden');
                }
            } else {
                bb.setStyle('position', 'absolute');
                offsettop = Y.one('window').get('scrollTop');
                // Ensure that the page scrollbars are enabled
                if (Y.UA.ie > 0) {
                    Y.one('html').setStyle('overflow', this.initialoverflow);
                } else {
                    Y.one('body').setStyle('overflow', this.initialoverflow);
                }
            }

            // Take off 15px top and bottom for borders, plus 40px each for the title and button area before setting the
            // new max-height
            var totalheight = newheight;
            newheight = newheight - (15 + 15 + 40 + 40);
            dialogue.setStyle('max-height', newheight + 'px');
            dialogue.setStyle('height', newheight + 'px');

            // Re-calculate the location now that we've changed the size
            var dialoguetop = Math.max(12, ((winheight - totalheight) / 2)) + offsettop;

            // We need to set the height for the yui3-widget - can't work
            // out what we're setting at present -- shoud be the boudingBox
            bb.setStyle('top', dialoguetop + 'px');

            // Calculate the left location of the chooser
            // We don't set a minimum width in the same way as we do height as the width would be far lower than the
            // optimal width for moodle anyway.
            var dialoguewidth = bb.get('offsetWidth');
            var dialogueleft = (winwidth - dialoguewidth) / 2;
            bb.setStyle('left', dialogueleft + 'px');
        },

        handle_key_press : function(e) {
            if (e.keyCode == 27) {
                this.cancel_popup(e);
            }
        },

        cancel_popup : function (e) {
            // Prevent normal form submission before hiding
            e.preventDefault();
            this.hide();
        },

        hide : function() {
            // Cancel all listen events
            this.cancel_listenevents();

            // Re-enable the page scrollbars
            if (Y.UA.ie > 0) {
                Y.one('html').setStyle('overflow', this.initialoverflow);
            } else {
                Y.one('body').setStyle('overflow', this.initialoverflow);
            }

            this.panel.hide();
        },

        check_options : function(e) {
            // Check which options are set, and change the parent class
            // to show/hide help as required
            this.options.each(function(thisoption) {
                var optiondiv = thisoption.get('parentNode').get('parentNode');
                if (thisoption.get('checked')) {
                    optiondiv.addClass('selected');

                    // Trigger any events for this option
                    this.option_selected(thisoption);

                    // Ensure that the form may be submitted
                    this.submitbutton.removeAttribute('disabled');

                    // Ensure that the radio remains focus so that keyboard navigation is still possible
                    thisoption.focus();
                } else {
                    optiondiv.removeClass('selected');
                }
            }, this);
        },

        option_selected : function(e) {
        }
    },
    {
        NAME : 'moodle-core-chooserdialogue',
        ATTRS : {
            minheight : {
                value : 300
            },
            maxheight : {
                value : 660
            },
            closeButtonTitle : {
                validator : Y.Lang.isString,
                value : 'Close'
            }
        }
    });
    M.core = M.core || {};
    M.core.chooserdialogue = CHOOSERDIALOGUE;
},
'@VERSION@', {
    requires:['base', 'panel', 'moodle-core-notification', 'autocomplete-base', 'autocomplete-filters', 'autocomplete-highlighters', 'event-key', 'event-valuechange', 'highlight-base']
}
);

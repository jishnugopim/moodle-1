/**
 * Init a collapsible region, see print_collapsible_region in weblib.php
 * @param {YUI} Y YUI3 instance with all libraries loaded
 * @param {String} id the HTML id for the div.
 * @param {String} userpref the user preference that records the state of this box. false if none.
 * @param {String} strtooltip
 */
M.util.init_collapsible_region = function(Y, id, userpref, strtooltip) {
    Y.use('anim', function(Y) {
        new M.util.CollapsibleRegion(Y, id, userpref, strtooltip);
    });
};

/**
 * Object to handle a collapsible region : instantiate and forget styled object
 *
 * @class
 * @constructor
 * @param {YUI} Y YUI3 instance with all libraries loaded
 * @param {String} id The HTML id for the div.
 * @param {String} userpref The user preference that records the state of this box. false if none.
 * @param {String} strtooltip
 */
M.util.CollapsibleRegion = function(Y, id, userpref, strtooltip) {
    // Record the pref name
    this.userpref = userpref;

    // Find the divs in the document.
    this.div = Y.one('#'+id);

    // Get the caption for the collapsible region
    var caption = this.div.one('#'+id + '_caption');

    // Create a link
    var a = Y.Node.create('<a href="#"></a>');
    a.setAttribute('title', strtooltip);

    // Get all the nodes from caption, remove them and append them to <a>
    while (caption.hasChildNodes()) {
        child = caption.get('firstChild');
        child.remove();
        a.append(child);
    }
    caption.append(a);

    // Get the height of the div at this point before we shrink it if required
    var height = this.div.get('offsetHeight');
    var collapsedimage = 't/collapsed'; // ltr mode
    if (right_to_left()) {
        collapsedimage = 't/collapsed_rtl';
    } else {
        collapsedimage = 't/collapsed';
    }
    if (this.div.hasClass('collapsed')) {
        // Add the correct image and record the YUI node created in the process
        this.icon = Y.Node.create('<img src="'+M.util.image_url(collapsedimage, 'moodle')+'" alt="" />');
        // Shrink the div as it is collapsed by default
        this.div.setStyle('height', caption.get('offsetHeight')+'px');
    } else {
        // Add the correct image and record the YUI node created in the process
        this.icon = Y.Node.create('<img src="'+M.util.image_url('t/expanded', 'moodle')+'" alt="" />');
    }
    a.append(this.icon);

    // Create the animation.
    var animation = new Y.Anim({
        node: this.div,
        duration: 0.3,
        easing: Y.Easing.easeBoth,
        to: {height:caption.get('offsetHeight')},
        from: {height:height}
    });

    // Handler for the animation finishing.
    animation.on('end', function() {
        this.div.toggleClass('collapsed');
        var collapsedimage = 't/collapsed'; // ltr mode
        if (right_to_left()) {
            collapsedimage = 't/collapsed_rtl';
            } else {
            collapsedimage = 't/collapsed';
            }
        if (this.div.hasClass('collapsed')) {
            this.icon.set('src', M.util.image_url(collapsedimage, 'moodle'));
        } else {
            this.icon.set('src', M.util.image_url('t/expanded', 'moodle'));
        }
    }, this);

    // Hook up the event handler.
    a.on('click', function(e, animation) {
        e.preventDefault();
        // Animate to the appropriate size.
        if (animation.get('running')) {
            animation.stop();
        }
        animation.set('reverse', this.div.hasClass('collapsed'));
        // Update the user preference.
        if (this.userpref) {
            M.util.set_user_preference(this.userpref, !this.div.hasClass('collapsed'));
        }
        animation.run();
    }, this, animation);
};

/**
 * The user preference that stores the state of this box.
 * @property userpref
 * @type String
 */
M.util.CollapsibleRegion.prototype.userpref = null;

/**
 * The key divs that make up this
 * @property div
 * @type Y.Node
 */
M.util.CollapsibleRegion.prototype.div = null;

/**
 * The key divs that make up this
 * @property icon
 * @type Y.Node
 */
M.util.CollapsibleRegion.prototype.icon = null;

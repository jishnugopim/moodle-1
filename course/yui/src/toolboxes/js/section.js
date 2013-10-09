var SECTIONTOOLBOX = function() {
    SECTIONTOOLBOX.superclass.constructor.apply(this, arguments);
};

Y.extend(SECTIONTOOLBOX, TOOLBOX, {
    /**
        * Initialize the toolboxes module
        *
        * Updates all span.commands with relevant handlers and other required changes
        */
    initializer : function() {
        M.course.coursebase.register_module(this);
        Y.log('Registered section toolbox to coursebase', 'debug', 'moodle-course-toolboxes');

        // Section Highlighting
        Y.delegate('click', this.toggle_highlight, SELECTOR.PAGECONTENT, SELECTOR.SECTIONLI + ' ' + SELECTOR.HIGHLIGHT, this);
        // Section Visibility
        Y.delegate('click', this.toggle_hide_section, SELECTOR.PAGECONTENT, SELECTOR.SECTIONLI + ' ' + SELECTOR.SHOWHIDE, this);
    },
    toggle_hide_section : function(e) {
        // Prevent the default button action
        e.preventDefault();

        // Get the section we're working on
        var section = e.target.ancestor(M.course.format.get_section_selector(Y));
        var button = e.target.ancestor('a', true);
        var hideicon = button.one('img');

        // The value to submit
        var value;
        // The text for strings and images. Also determines the icon to display.
        var action,
            nextaction;

        if (!section.hasClass(CSS.SECTIONHIDDENCLASS)) {
            section.addClass(CSS.SECTIONHIDDENCLASS);
            value = 0;
            action = 'hide';
            nextaction = 'show';
        } else {
            section.removeClass(CSS.SECTIONHIDDENCLASS);
            value = 1;
            action = 'show';
            nextaction = 'hide';
        }

        var newstring = M.util.get_string(nextaction + 'fromothers', 'format_' + this.get('format'));
        hideicon.setAttrs({
            'alt' : newstring,
            'src'   : M.util.image_url('i/' + nextaction)
        });
        button.set('title', newstring);

        // Change the highlight status
        var data = {
            'class' : 'section',
            'field' : 'visible',
            'id'    : Y.Moodle.core_course.util.section.getId(section.ancestor(M.course.format.get_section_wrapper(Y), true)),
            'value' : value
        };

        var lightbox = M.util.add_lightbox(Y, section);
        lightbox.show();

        var response = this.send_request(data, lightbox);

        var activities = section.all(SELECTOR.ACTIVITYLI);
        activities.each(function(node) {
            var button;
            if (node.one(SELECTOR.SHOW)) {
                button = node.one(SELECTOR.SHOW);
            } else {
                button = node.one(SELECTOR.HIDE);
            }
            var activityid = Y.Moodle.core_course.util.cm.getId(node);

            // NOTE: resourcestotoggle is returned as a string instead
            // of a Number so we must cast our activityid to a String.
            if (Y.Array.indexOf(response.resourcestotoggle, "" + activityid) !== -1) {
                M.course.resource_toolbox.handle_resource_dim(button, node, action);
            }
        }, this);
    },
    toggle_highlight : function(e) {
        // Prevent the default button action
        e.preventDefault();

        // Get the section we're working on
        var section = e.target.ancestor(M.course.format.get_section_selector(Y));
        var button = e.target.ancestor('a', true);
        var buttonicon = button.one('img');

        // Determine whether the marker is currently set
        var togglestatus = section.hasClass('current');
        var value = 0;

        // Set the current highlighted item text
        var old_string = M.util.get_string('markthistopic', 'moodle');
        Y.one(SELECTOR.PAGECONTENT)
            .all(M.course.format.get_section_selector(Y) + '.current ' + SELECTOR.HIGHLIGHT)
            .set('title', old_string);
        Y.one(SELECTOR.PAGECONTENT)
            .all(M.course.format.get_section_selector(Y) + '.current ' + SELECTOR.HIGHLIGHT + ' img')
            .set('alt', old_string)
            .set('src', M.util.image_url('i/marker'));

        // Remove the highlighting from all sections
        Y.one(SELECTOR.PAGECONTENT).all(M.course.format.get_section_selector(Y)).removeClass('current');

        // Then add it if required to the selected section
        if (!togglestatus) {
            section.addClass('current');
            value = Y.Moodle.core_course.util.section.getId(section.ancestor(M.course.format.get_section_wrapper(Y), true));
            var new_string = M.util.get_string('markedthistopic', 'moodle');
            button
                .set('title', new_string);
            buttonicon
                .set('alt', new_string)
                .set('src', M.util.image_url('i/marked'));
        }

        // Change the highlight status
        var data = {
            'class' : 'course',
            'field' : 'marker',
            'value' : value
        };
        var lightbox = M.util.add_lightbox(Y, section);
        lightbox.show();
        this.send_request(data, lightbox);
    }
}, {
    NAME : 'course-section-toolbox',
    ATTRS : {
        courseid : {
            'value' : 0
        },
        format : {
            'value' : 'topics'
        }
    }
});

M.course.init_section_toolbox = function(config) {
    return new SECTIONTOOLBOX(config);
};

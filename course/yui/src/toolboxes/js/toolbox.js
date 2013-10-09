/**
    * The toolbox classes
    *
    * TOOLBOX is a generic class which should never be directly instantiated
    * RESOURCETOOLBOX is a class extending TOOLBOX containing code specific to resources
    * SECTIONTOOLBOX is a class extending TOOLBOX containing code specific to sections
    */
var TOOLBOX = function() {
    TOOLBOX.superclass.constructor.apply(this, arguments);
};

Y.extend(TOOLBOX, Y.Base, {
    /**
        * Send a request using the REST API
        *
        * @param data The data to submit
        * @param statusspinner (optional) A statusspinner which may contain a section loader
        * @param optionalconfig (optional) Any additional configuration to submit
        * @return response responseText field from responce
        */
    send_request : function(data, statusspinner, optionalconfig) {
        // Default data structure
        if (!data) {
            data = {};
        }
        // Handle any variables which we must pass back through to
        var pageparams = this.get('config').pageparams,
            varname;
        for (varname in pageparams) {
            data[varname] = pageparams[varname];
        }

        data.sesskey = M.cfg.sesskey;
        data.courseId = this.get('courseid');

        var uri = M.cfg.wwwroot + this.get('ajaxurl');

        // Define the configuration to send with the request
        var responsetext = [];
        var config = {
            method: 'POST',
            data: data,
            on: {
                success: function(tid, response) {
                    try {
                        responsetext = Y.JSON.parse(response.responseText);
                        if (responsetext.error) {
                            new M.core.ajaxException(responsetext);
                        }
                    } catch (e) {}
                    if (statusspinner) {
                        window.setTimeout(function() {
                            statusspinner.hide();
                        }, 400);
                    }
                },
                failure : function(tid, response) {
                    if (statusspinner) {
                        statusspinner.hide();
                    }
                    new M.core.ajaxException(response);
                }
            },
            context: this,
            sync: true
        };

        // Apply optional config
        if (optionalconfig) {
            for (varname in optionalconfig) {
                config[varname] = optionalconfig[varname];
            }
        }

        if (statusspinner) {
            statusspinner.show();
        }

        // Send the request
        Y.io(uri, config);
        return responsetext;
    }
},
{
    NAME : 'course-toolbox',
    ATTRS : {
        // The ID of the current course
        courseid : {
            'value' : 0
        },
        ajaxurl : {
            'value' : 0
        },
        config : {
            'value' : 0
        }
    }
});

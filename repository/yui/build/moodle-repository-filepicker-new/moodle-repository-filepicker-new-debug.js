YUI.add('moodle-repository-filepicker-new', function (Y, NAME) {

var FilePicker = function() {
    FilePicker.superclass.constructor.apply(this, arguments);
};

Y.extend(FilePicker, M.core.dialogue, {
    compiledTemplates: {},

    activeRepository:  null,
    activeRepositoryID:  null,

    baseIOConfig: null,

    spinner: null,

    cachedResponses: null,

    treeview: null,

    loginHandlers: [],

    initializer: function() {
    },
    show: function() {
        // Ensure that the initial setup has completed.
        if (this.checkInitialSetup()) {

            // Call the superclass call function now.
            return FilePicker.superclass.show.call(this);
        }
    },

    checkInitialSetup: function() {
        var bb = this.get('boundingBox');

        if (!bb.hasClass('filepicker')) {
            // Set up initial content.
            var bodyContent = this.getTemplate('generallayout');
            this.setAttrs({
                bodyContent: bodyContent,
                footerContent: null,
                width: 'auto'
            });

            this.updateRepositoryList();

            // Set up event handlers for repository selection.
            bb.delegate('click', this.handleRepositorySelection, '.fp-repo', this);

            this.get('boundingBox').addClass('filepicker');

            // TODO Add the spinner.
            this.spinner = Y.Node.create('<div class="spinner">');

            // Set up a new cache.
            this.cachedResponses = new Y.Cache();

            // Set up the treeview for the file list.
            this.treeview = new Y.M.repository.filepicker.FileTree();
        }

        return this;
    },

    /**
     * Handle repository selection.
     */
    handleRepositorySelection: function(e) {
        e.preventDefault();

        // Set the preferences.
        // Display this repository now.
        this.selectRepository(e.currentTarget.getData('repositoryid'));
    },

    /**
     * Select a repository.
     */
    selectRepository: function(repositoryid) {
        var bb = this.get('boundingBox'),
            repositoryListNode = bb.one('.fp-list'),
            repositoryList = this.get('repositories'),
            repository;

        // Clear up the previous repository.
        if (this.activeRepositoryID && repositoryList[this.activeRepositoryID]) {
            repository = repositoryList[this.activeRepositoryID];

            // Toggle the 'active' class to show which is currently selected.
            repositoryListNode.all('.active').removeClass('active');

            // Remove the type class.
            bb.removeClass('repository_' + repository.type);
        }

        // Set the active repository.
        this.activeRepositoryID = repositoryid;

        // Set up for the new repository.
        if (repositoryList[this.activeRepositoryID]) {
            this.activeRepository = repositoryList[this.activeRepositoryID];

            // Toggle the 'active' class to show which is currently selected.
            repositoryListNode.one('[data-repositoryid="' + repositoryid + '"]')
                    .addClass('active');

            // Add the type class.
            bb.addClass('repository_' + this.activeRepository.type);

            // Replace the current view with the loader.
            // Retrieve the repository view.
            this.performRequest('list');
        }
    },

    parseRepositoryResult: function(data) {
        this.updateToolbar(data);

        if (data.login) {
            // Display the login dialogue.
            this.displayLogin(data);
        } else if (data.upload) {
            this.displayUploadForm(data);
        } else if (data.object) {
            this.createObjectContainer(data);
        } else if (data.list) {
            // Files were returned. Update the tree.
            this.updateFileList(this.treeview.rootNode, data.list, true);
        }
    },

    updateToolbar: function(data) {
        var contentSpace = this.get('boundingBox').one('.fp-repo-items'),
            toolbarbuttons = [
                    'refresh',
                    'login',
                    'manage',
                    'help',
                    'message',
                    'search'
                ];

        if (data.toolbar) {
            Y.log(data.toolbar);
            Y.each(toolbarbuttons, function(fieldName) {
                contentSpace.toggleClass('no' + fieldName, !data.toolbar[fieldName]);
            });
            contentSpace.toggleClass('noback', true);
        }

        this.displayPath(data.p || []);
    },

    displayPath: function(path) {
        var pathbar = this.get('boundingBox').one('.fp-pathbar');
        if (path.length === 0) {
            // No path specified. Hide the path.
            pathbar.hide();
            return;
        }
        pathbar.show();
    },

    displayLogin: function(data) {
        var formConfig = {
                client_id: this.get('client_id')
            },
            form = Y.Node.create(this.getTemplate('loginform', formConfig)),
            table = form.one('table'),
            elementTypes = {},
            action = 'login';

        if (data.login_btn_action) {
            action = data.login_btn_action;
        }

        // The login data item should contain a set of form elements.
        Y.each(data.login, function(loginitem) {
            var formElement = this.getTemplate('loginform_' + loginitem.type, loginitem);
            if (!formElement) {
                formElement = this.getTemplate('loginform_input', loginitem);
            }

            table.appendChild(formElement);
            elementTypes[loginitem.type] = true;
        }, this);

        // Add any handlers for each login type.
        Y.each(elementTypes, function(elementType) {
            // Push onto this.loginHandlers so that we can detach all of
            // the handlers when clearing.
            if (elementType === 'popup') {
                loginHandlers.push(
                    form.delegate('click', function(e) {
                        window.open(
                                e.currentTarget.getData('loginurl'),
                                'repo_auth',
                                'location=0,status=0,width=500,height=300,scrollbars=yes'
                        );
                        e.preventDefault();
                    }, 'button.fp-login-popup-but', this));

                    form.delegate('keydown', function(e) {
                        if (e.keyCode === 13) {
                            popupbutton.simulate('click');
                            e.preventDefault();
                        }
                    }, 'form', this);

                // And remove the normal submit buttons.
                form.all('.fp-login-submit').remove();
            }
        }, this);

        // register button action for login and search
        if (action === 'login' || action === 'search') {
            form.one('.fp-login-submit').on('click', function(e){
                e.preventDefault();

                var config = {
                        data: {
                            path: ''
                        },
                        form: {
                            id: this.get('client_id'),
                            upload: false,
                            useDisabled: true
                        }
                    };

                if (action !== 'search') {
                    action = 'signin';
                }

                this.performRequest(action, config);
                /*
                this.hide_header();
                */
            }, this);
        }

        this.updateContent(form);

    },
    displayUploadForm: function() {
        var templateConfig = {
                client_id: this.get('client_id'),
                itemid: this.get('itemid'),
                types: this.get('accepted_types'),
                file: 'repo_upload_file',
                saveas: 'title',
                author: 'author',
                license: 'license',
                licenses: this.get('licenses'),
                selectedLicense: this.get('defaultlicense')
            },
            uploadForm;

        // Override the default license if a per-user setting exists.

        // Attempt to use a repository-specific form.
        uploadForm = this.getTemplate('uploadform_' + this.activeRepository.type,
                templateConfig);

        // Fall back on the default upload form template.
        if (!uploadForm) {
            uploadForm = this.getTemplate('uploadform', templateConfig);
        }

        var form = Y.Node.create(uploadForm);
        this.updateContent(form);
    },
    createObjectContainer: function(data) {
        var noop = data;
        noop = data;
    },

    updateFileList: function(rootNode, newList, clearOld) {
        if (clearOld) {
            rootNode.empty();
        }
        rootNode.append(newList);
    },

    performRequest: function(action, requestConfig, callback, showLoading) {
        var cachekey = 'fakekey';

        if (action !== 'upload') {
            var cachedresult = this.cachedResponses.retrieve(cachekey);
            if (false && cachedresult) {
                // TODO Process the callback too.
                return cachedresult;
            }
        }

        if (!this.baseIOConfig) {
            this.baseIOConfig = {
                context: this,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
                },
                data: {
                    // The paramters with default values.
                    sesskey: M.cfg.sesskey,
                    itemid: this.get('itemid'),
                    maxbytes: this.get('maxbytes'),
                    areamaxbytes: this.get('areamaxbytes'),
                    env: this.get('env'),
                    ctx_id: this.get('context').id,
                    accepted_types: this.get('accepted_types'),
                    client_id: this.get('client_id'),

                    // Defaults that we'll override in a moment.
                    // The path.
                    p: '',
                    page: ''
                },
                on: {
                    complete: this.completeRequest
                }
            };
        }

        // Check that we have all required parts of the requestConfig.
        requestConfig = requestConfig || {};
        requestConfig.data = requestConfig.data || {};

        // Create the configuration for this instance of Y.io.
        var config = Y.clone(this.baseIOConfig);
        config.data = Y.merge(config.data, requestConfig.data, {
            repo_id: this.activeRepositoryID,
            action: action
        });
        config['arguments'] = {
            callback: callback,
            cachekey: cachekey,
            action: config.data.action
        };

        // Check whether this request includes a form for submission:
        if (requestConfig.form) {
            config.form = requestConfig.form;
        }
        
        if (showLoading) {
            // Show the loading animation in the content pane. We always
            // hide it on completion, regardless of whether it was started.
            config.on.start = function() {
                // Display the spinner.
                this.spinner.show();
            };
        }

        // Perform the Y.IO request now.
        Y.io(this.get('api'), config);
    },

    completeRequest: function(id, outcome, args) {
        var payload;

        try {
            payload = Y.JSON.parse(outcome.responseText);
        } catch (e) {
            if (outcome && outcome.status && outcome.status > 0) {
                Y.use('moodle-core-notification-exception', function() {
                    new M.core.exception(e);
                });
                return;
            }
        }
        if (payload && payload.error) {
            Y.use('moodle-core-notification-ajaxexception', function () {
                new M.core.ajaxException(payload);
            });
            return;
        } else {
            // TODO work out what this is for.
            if (payload.msg) {
                // What is this for!?
                this.print_msg(payload.msg, 'info');
            }

            // Cache result if appropriate.
            if (args.action !== 'upload' && args.cachekey && payload.allowcaching) {
                this.cachedResponses.add(args.cachekey, payload);
            }

            this.parseRepositoryResult(payload, args);

            // Invoke the completion callback in the current context.
            if (typeof args.callback === 'function') {
                args.callback.apply(this, [payload, args]);
            }
        }
    },

    // This probably doesn't need to be called regularly. Check and make
    // sure. No point updating the DOM when we are just replacing like for
    // like.
    updateRepositoryList: function() {
        var repositoryList = [],
            repositoryArea = this.get('boundingBox').one('.fp-repo-area .fp-list');

        // Cast to array.
        // TODO find a better/more efficient way of doing this.
        Y.Object.each(this.get('repositories'), function(repository) {
            repositoryList[repository.id] = repository;
        });

        // Sort the list by the repository sortorder.
        repositoryList.sort(function(a, b){
            return a.sortorder - b.sortorder;
        });

        // Empty the existing list.
        repositoryArea.empty();

        // Refill it.
        Y.Array.each(repositoryList, function(repository) {
            var repositoryTemplate = this.getTemplate('repository', repository);
            repositoryArea.appendChild(repositoryTemplate);
        }, this);
    },

    updateContent: function(newContent) {
        this.get('boundingBox').one('.fp-content')
            .empty()
            .appendChild(newContent);
    },

    getTemplate: function(template, options) {
        if (!M.cfg.templates[template]) {
            // This template does not exist, fail gracefully.
            return '';
        }

        // Check whether we already compiled this one.
        if (!this.compiledTemplates[template]) {
            this.compiledTemplates[template] = Y.Handlebars.compile(M.cfg.templates[template]);
        }

        if (!options) {
            // Provide a default options hash.
            options = {};
        }

        // Return the built template.
        return this.compiledTemplates[template](options);
    }

}, {
    NAME: 'filepicker',
    ATTRS: {
        api: {
            value: M.cfg.wwwroot + '/repository/repository_ajax.php'
        },
        savepath: {
            value: '/'
        },
        repositories: {
            value: {}
        },
        client_id: {
            value: null
        },
        itemid: {
            value: 0
        },
        maxbytes: {
            value: -1
        },
        areamaxbytes: {
            value: -1
        },
        context: {
            value: null
        },
        env: {
            value: {
                id: null
            }
        },
        accepted_types: {
            value: []
        },
        licenses: {
            value: []
        }
    }
});

Y.Base.modifyAttrs(FilePicker, {
    /**
     * Boolean indicating whether or not the Widget is visible.
     * Overridden by moodle-repository-filepicker
     *
     * @attribute visible
     * @default false
     * @type boolean
     */
    visible: {
        value: false
    },
    rendered: {
        value: false
    },
    modal: {
        value: true
    },
    draggable: {
        value: true
    },
    centered: {
        value: true
    }
});

Y.namespace('M.repository').FilePicker = FilePicker;


}, '@VERSION@', {
    "requires": [
        "base",
        "moodle-core-notification-dialogue",
        "node",
        "handlebars",
        "cache",
        "io",
        "moodle-repository-filepicker-filetree"
    ]
});

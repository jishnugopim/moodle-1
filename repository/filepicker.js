// YUI3 File Picker module for moodle
// Author: Dongsheng Cai <dongsheng@moodle.com>

/**
 *
 * File Picker UI
 * =====
 * this.fpnode, contains reference to filepicker Node, non-empty if and only if rendered
 * this.api, stores the URL to make ajax request
 * this.mainui, YUI Panel
 * this.selectnode, contains reference to select-file Node
 * this.selectui, YUI Panel for selecting particular file
 * this.msg_dlg, YUI Panel for error or info message
 * this.process_dlg, YUI Panel for processing existing filename
 * this.treeview, YUI Treeview
 * this.viewmode, store current view mode
 * this.pathbar, reference to the Node with path bar
 * this.pathnode, a Node element representing one folder in a path bar (not attached anywhere, just used for template)
 * this.currentpath, the current path in the repository (or last requested path)
 *
 * Filepicker options:
 * =====
 * this.options.client_id, the instance id
 * this.options.contextid
 * this.options.itemid
 * this.options.repositories, stores all repositories displayed in file picker
 * this.options.formcallback
 *
 * Active repository options
 * =====
 * this.active_repo.id
 * this.active_repo.nosearch
 * this.active_repo.norefresh
 * this.active_repo.nologin
 * this.active_repo.help
 * this.active_repo.manage
 *
 * Server responses
 * =====
 * this.filelist, cached filelist
 * this.pages
 * this.page
 * this.filepath, current path (each element of the array is a part of the breadcrumb)
 * this.logindata, cached login form
 */

YUI.add('moodle-core_filepicker', function(Y) {
    /** help function to extract width/height style as a number, not as a string */
    Y.Node.prototype.getStylePx = function(attr) {
        var style = this.getStyle(attr);
        if (''+style == '0' || ''+style == '0px') {
            return 0;
        }
        var matches = style.match(/^([\d\.]+)px$/)
        if (matches && parseFloat(matches[1])) {
            return parseFloat(matches[1]);
        }
        return null;
    }

    /** if condition is met, the class is added to the node, otherwise - removed */
    Y.Node.prototype.addClassIf = function(className, condition) {
        if (condition) {
            this.addClass(className);
        } else {
            this.removeClass(className);
        }
        return this;
    }

    /** sets the width(height) of the node considering existing minWidth(minHeight) */
    Y.Node.prototype.setStyleAdv = function(stylename, value) {
        var stylenameCap = stylename.substr(0,1).toUpperCase() + stylename.substr(1, stylename.length-1).toLowerCase();
        this.setStyle(stylename, '' + Math.max(value, this.getStylePx('min'+stylenameCap)) + 'px')
        return this;
    }

    /** set image source to src, if there is preview, remember it in lazyloading.
     *  If there is a preview and it was already loaded, use it. */
    Y.Node.prototype.setImgSrc = function(src, realsrc, lazyloading) {
        if (realsrc) {
            if (M.core_filepicker.loadedpreviews[realsrc]) {
                this.set('src', realsrc).addClass('realpreview');
                return this;
            } else {
                if (!this.get('id')) {
                    this.generateID();
                }
                lazyloading[this.get('id')] = realsrc;
            }
        }
        this.set('src', src);
        return this;
    }

    /**
     * Replaces the image source with preview. If the image is inside the treeview, we need
     * also to update the html property of corresponding YAHOO.widget.HTMLNode
     * @param array lazyloading array containing associations of imgnodeid->realsrc
     */
    Y.Node.prototype.setImgRealSrc = function(lazyloading) {
        if (this.get('id') && lazyloading[this.get('id')]) {
            var newsrc = lazyloading[this.get('id')];
            M.core_filepicker.loadedpreviews[newsrc] = true;
            this.set('src', newsrc).addClass('realpreview');
            delete lazyloading[this.get('id')];
            var treenode = this.ancestor('.fp-treeview')
            if (treenode && treenode.get('parentNode').treeview) {
                treenode.get('parentNode').treeview.getRoot().refreshPreviews(this.get('id'), newsrc);
            }
        }
        return this;
    }

    /** scan TreeView to find which node contains image with id=imgid and replace it's html
     * with the new image source. */
    Y.YUI2.widget.Node.prototype.refreshPreviews = function(imgid, newsrc, regex) {
        if (!regex) {
            regex = new RegExp("<img\\s[^>]*id=\""+imgid+"\"[^>]*?(/?)>", "im");
        }
        if (this.expanded || this.isLeaf) {
            var html = this.getContentHtml();
            if (html && this.setHtml && regex.test(html)) {
                var newhtml = this.html.replace(regex, "<img id=\""+imgid+"\" src=\""+newsrc+"\" class=\"realpreview\"$1>", html);
                this.setHtml(newhtml);
                return true;
            }
            if (!this.isLeaf && this.children) {
                for(var c in this.children) {
                    if (this.children[c].refreshPreviews(imgid, newsrc, regex)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Displays a list of files (used by filepicker, filemanager) inside the Node
     *
     * @param array options
     *   viewmode : 1 - icons, 2 - tree, 3 - table
     *   appendonly : whether fileslist need to be appended instead of replacing the existing content
     *   filenode : Node element that contains template for displaying one file
     *   callback : On click callback. The element of the fileslist array will be passed as argument
     *   rightclickcallback : On right click callback (optional).
     *   callbackcontext : context where callbacks are executed
     *   sortable : whether content may be sortable (in table mode)
     *   dynload : allow dynamic load for tree view
     *   filepath : for pre-building of tree view - the path to the current directory in filepicker format
     *   treeview_dynload : callback to function to dynamically load the folder in tree view
     *   classnamecallback : callback to function that returns the class name for an element
     * @param array fileslist array of files to show, each array element may have attributes:
     *   title or fullname : file name
     *   shorttitle (optional) : display file name
     *   thumbnail : url of image
     *   icon : url of icon image
     *   thumbnail_width : width of thumbnail, default 90
     *   thumbnail_height : height of thumbnail, default 90
     *   thumbnail_alt : TODO not needed!
     *   description or thumbnail_title : alt text
     * @param array lazyloading : reference to the array with lazy loading images
     */
    Y.Node.prototype.fp_display_filelist = function(options, fileslist, lazyloading) {
        var viewmodeclassnames = {1:'fp-iconview', 2:'fp-treeview', 3:'fp-tableview'};
        var classname = viewmodeclassnames[options.viewmode];
        var scope = this;
        /** return whether file is a folder (different attributes in FileManager and FilePicker) */
        var file_is_folder = function(node) {
            if (node.children) {return true;}
            if (node.type && node.type == 'folder') {return true;}
            return false;
        };
        /** return the name of the file (different attributes in FileManager and FilePicker) */
        var file_get_filename = function(node) {
            return node.title ? node.title : node.fullname;
        };
        /** return display name of the file (different attributes in FileManager and FilePicker) */
        var file_get_displayname = function(node) {
            var displayname = node.shorttitle ? node.shorttitle : file_get_filename(node);
            return Y.Escape.html(displayname);
        };
        /** return file description (different attributes in FileManager and FilePicker) */
        var file_get_description = function(node) {
            var description = '';
            if (node.description) {
                description = node.description;
            } else if (node.thumbnail_title) {
                description = node.thumbnail_title;
            } else {
                description = file_get_filename(node);
            }
            return Y.Escape.html(description);
        };
        /** help funciton for tree view */
        var build_tree = function(node, level) {
            // prepare file name with icon
            var el = Y.Node.create('<div/>');
            el.appendChild(options.filenode.cloneNode(true));

            el.one('.fp-filename').setContent(file_get_displayname(node));
            // TODO add tooltip with node.title or node.thumbnail_title
            var tmpnodedata = {className:options.classnamecallback(node)};
            el.get('children').addClass(tmpnodedata.className);
            if (node.icon) {
                el.one('.fp-icon').appendChild(Y.Node.create('<img/>'));
                el.one('.fp-icon img').setImgSrc(node.icon, node.realicon, lazyloading);
            }
            // create node
            tmpnodedata.html = el.getContent();
            var tmpNode = new Y.YUI2.widget.HTMLNode(tmpnodedata, level, false);
            if (node.dynamicLoadComplete) {
                tmpNode.dynamicLoadComplete = true;
            }
            tmpNode.fileinfo = node;
            tmpNode.isLeaf = !file_is_folder(node);
            if (!tmpNode.isLeaf) {
                if(node.expanded) {
                    tmpNode.expand();
                }
                tmpNode.path = node.path ? node.path : (node.filepath ? node.filepath : '');
                for(var c in node.children) {
                    build_tree(node.children[c], tmpNode);
                }
            }
        };
        /** initialize tree view */
        var initialize_tree_view = function() {
            var parentid = scope.one('.'+classname).get('id');
            // TODO MDL-32736 use YUI3 gallery TreeView
            scope.treeview = new Y.YUI2.widget.TreeView(parentid);
            if (options.dynload) {
                scope.treeview.setDynamicLoad(Y.bind(options.treeview_dynload, options.callbackcontext), 1);
            }
            scope.treeview.singleNodeHighlight = true;
            if (options.filepath && options.filepath.length) {
                // we just jumped from icon/details view, we need to show all parents
                // we extract as much information as possible from filepath and filelist
                // and send additional requests to retrieve siblings for parent folders
                var mytree = {};
                var mytreeel = null;
                for (var i in options.filepath) {
                    if (mytreeel == null) {
                        mytreeel = mytree;
                    } else {
                        mytreeel.children = [{}];
                        mytreeel = mytreeel.children[0];
                    }
                    var pathelement = options.filepath[i];
                    mytreeel.path = pathelement.path;
                    mytreeel.title = pathelement.name;
                    mytreeel.icon = pathelement.icon;
                    mytreeel.dynamicLoadComplete = true; // we will call it manually
                    mytreeel.expanded = true;
                }
                mytreeel.children = fileslist;
                build_tree(mytree, scope.treeview.getRoot());
                // manually call dynload for parent elements in the tree so we can load other siblings
                if (options.dynload) {
                    var root = scope.treeview.getRoot();
                    while (root && root.children && root.children.length) {
                        root = root.children[0];
                        if (root.path == mytreeel.path) {
                            root.origpath = options.filepath;
                            root.origlist = fileslist;
                        } else if (!root.isLeaf && root.expanded) {
                            Y.bind(options.treeview_dynload, options.callbackcontext)(root, null);
                        }
                    }
                }
            } else {
                // there is no path information, just display all elements as a list, without hierarchy
                for(k in fileslist) {
                    build_tree(fileslist[k], scope.treeview.getRoot());
                }
            }
            scope.treeview.subscribe('clickEvent', function(e){
                e.node.highlight(false);
                var callback = options.callback;
                if (options.rightclickcallback && e.event.target &&
                        Y.Node(e.event.target).ancestor('.fp-treeview .fp-contextmenu', true)) {
                    callback = options.rightclickcallback;
                }
                Y.bind(callback, options.callbackcontext)(e, e.node.fileinfo);
                Y.YUI2.util.Event.stopEvent(e.event)
            });
            // TODO MDL-32736 support right click
            /*if (options.rightclickcallback) {
                scope.treeview.subscribe('dblClickEvent', function(e){
                    e.node.highlight(false);
                    Y.bind(options.rightclickcallback, options.callbackcontext)(e, e.node.fileinfo);
                });
            }*/
            scope.treeview.draw();
        };
        /** formatting function for table view */
        var formatValue = function (o){
            if (o.data[''+o.column.key+'_f_s']) {return o.data[''+o.column.key+'_f_s'];}
            else if (o.data[''+o.column.key+'_f']) {return o.data[''+o.column.key+'_f'];}
            else if (o.value) {return o.value;}
            else {return '';}
        };
        /** formatting function for table view */
        var formatTitle = function(o) {
            var el = Y.Node.create('<div/>');
            el.appendChild(options.filenode.cloneNode(true)); // TODO not node but string!
            el.get('children').addClass(o.data['classname']);
            el.one('.fp-filename').setContent(o.value);
            if (o.data['icon']) {
                el.one('.fp-icon').appendChild(Y.Node.create('<img/>'));
                el.one('.fp-icon img').setImgSrc(o.data['icon'], o.data['realicon'], lazyloading);
            }
            if (options.rightclickcallback) {
                el.get('children').addClass('fp-hascontextmenu');
            }
            // TODO add tooltip with o.data['title'] (o.value) or o.data['thumbnail_title']
            return el.getContent();
        }
        /** sorting function for table view */
        var sortFoldersFirst = function(a, b, desc) {
            if (a.get('isfolder') && !b.get('isfolder')) {
                return -1;
            }
            if (!a.get('isfolder') && b.get('isfolder')) {
                return 1;
            }
            var aa = a.get(this.key), bb = b.get(this.key), dir = desc ? -1 : 1;
            return (aa > bb) ? dir : ((aa < bb) ? -dir : 0);
        }
        /** initialize table view */
        var initialize_table_view = function() {
            var cols = [
                {key: "displayname", label: M.str.moodle.name, allowHTML: true, formatter: formatTitle,
                    sortable: true, sortFn: sortFoldersFirst},
                {key: "datemodified", label: M.str.moodle.lastmodified, allowHTML: true, formatter: formatValue,
                    sortable: true, sortFn: sortFoldersFirst},
                {key: "size", label: M.str.repository.size, allowHTML: true, formatter: formatValue,
                    sortable: true, sortFn: sortFoldersFirst},
                {key: "mimetype", label: M.str.repository.type, allowHTML: true,
                    sortable: true, sortFn: sortFoldersFirst}
            ];
            for (var k in fileslist) {
                // to speed up sorting and formatting
                fileslist[k].displayname = file_get_displayname(fileslist[k]);
                fileslist[k].isfolder = file_is_folder(fileslist[k]);
                fileslist[k].classname = options.classnamecallback(fileslist[k]);
            }
            scope.tableview = new Y.DataTable({columns: cols, data: fileslist});
            scope.tableview.delegate('click', function (e, tableview) {
                var record = tableview.getRecord(e.currentTarget.get('id'));
                if (record) {
                    var callback = options.callback;
                    if (options.rightclickcallback && e.target.ancestor('.fp-tableview .fp-contextmenu', true)) {
                        callback = options.rightclickcallback;
                    }
                    Y.bind(callback, this)(e, record.getAttrs());
                }
            }, 'tr', options.callbackcontext, scope.tableview);
            if (options.rightclickcallback) {
                scope.tableview.delegate('contextmenu', function (e, tableview) {
                    var record = tableview.getRecord(e.currentTarget.get('id'));
                    if (record) { Y.bind(options.rightclickcallback, this)(e, record.getAttrs()); }
                }, 'tr', options.callbackcontext, scope.tableview);
            }
        }
        /** append items in table view mode */
        var append_files_table = function() {
            var parentnode = scope.one('.'+classname);
            scope.tableview.render(parentnode);
            scope.tableview.sortable = options.sortable ? true : false;
        };
        /** append items in tree view mode */
        var append_files_tree = function() {
            if (options.appendonly) {
                var parentnode = scope.treeview.getRoot();
                if (scope.treeview.getHighlightedNode()) {
                    parentnode = scope.treeview.getHighlightedNode();
                    if (parentnode.isLeaf) {parentnode = parentnode.parent;}
                }
                for (var k in fileslist) {
                    build_tree(fileslist[k], parentnode);
                }
                scope.treeview.draw();
            } else {
                // otherwise files were already added in initialize_tree_view()
            }
        }
        /** append items in icon view mode */
        var append_files_icons = function() {
            parent = scope.one('.'+classname);
            for (var k in fileslist) {
                var node = fileslist[k];
                var element = options.filenode.cloneNode(true);
                parent.appendChild(element);
                element.addClass(options.classnamecallback(node));
                var filenamediv = element.one('.fp-filename');
                filenamediv.setContent(file_get_displayname(node));
                var imgdiv = element.one('.fp-thumbnail'), width, height, src;
                if (node.thumbnail) {
                    width = node.thumbnail_width ? node.thumbnail_width : 90;
                    height = node.thumbnail_height ? node.thumbnail_height : 90;
                    src = node.thumbnail;
                } else {
                    width = 16;
                    height = 16;
                    src = node.icon;
                }
                filenamediv.setStyleAdv('width', width);
                imgdiv.setStyleAdv('width', width).setStyleAdv('height', height);
                var img = Y.Node.create('<img/>').setAttrs({
                        title: file_get_description(node),
                        alt: Y.Escape.html(node.thumbnail_alt ? node.thumbnail_alt : file_get_filename(node))}).
                    setStyle('maxWidth', ''+width+'px').
                    setStyle('maxHeight', ''+height+'px');
                img.setImgSrc(src, node.realthumbnail, lazyloading);
                imgdiv.appendChild(img);
                element.on('click', function(e, nd) {
                    if (options.rightclickcallback && e.target.ancestor('.fp-iconview .fp-contextmenu', true)) {
                        Y.bind(options.rightclickcallback, this)(e, nd);
                    } else {
                        Y.bind(options.callback, this)(e, nd);
                    }
                }, options.callbackcontext, node);
                if (options.rightclickcallback) {
                    element.on('contextmenu', options.rightclickcallback, options.callbackcontext, node);
                }
            }
        }

        // initialize files view
        if (!options.appendonly) {
            var parent = Y.Node.create('<div/>').addClass(classname);
            this.setContent('').appendChild(parent);
            parent.generateID();
            if (options.viewmode == 2) {
                initialize_tree_view();
            } else if (options.viewmode == 3) {
                initialize_table_view();
            } else {
                // nothing to initialize for icon view
            }
        }

        // append files to the list
        if (options.viewmode == 2) {
            append_files_tree();
        } else if (options.viewmode == 3) {
            append_files_table();
        } else {
            append_files_icons();
        }

    }

    /**
     * creates a node and adds it to the div with id #filesskin. This is needed for CSS to be able
     * to overwrite YUI skin styles (instead of using !important that does not work in IE)
     */
    Y.Node.createWithFilesSkin = function(node) {
        if (!Y.one('#filesskin')) {
            Y.one(document.body).appendChild(Y.Node.create('<div/>').set('id', 'filesskin'));
        }
        return Y.one('#filesskin').appendChild(Y.Node.create(node));
    }
}, '@VERSION@', {
    requires:['base', 'node', 'yui2-treeview', 'panel', 'cookie', 'datatable', 'datatable-sort']
});

M.core_filepicker = M.core_filepicker || {};

/**
 * instances of file pickers used on page
 */
M.core_filepicker.instances = M.core_filepicker.instances || {};
M.core_filepicker.active_filepicker = null;

/**
 * HTML Templates to use in FilePicker
 */
M.core_filepicker.templates = M.core_filepicker.templates || {};

/**
 * Array of image sources for real previews (realicon or realthumbnail) that are already loaded
 */
M.core_filepicker.loadedpreviews = M.core_filepicker.loadedpreviews || {};

/**
* Set selected file info
*
* @parma object file info
*/
M.core_filepicker.select_file = function(file) {
    M.core_filepicker.active_filepicker.select_file(file);
};

/**
 * Init and show file picker
 */
M.core_filepicker.show = function(Y, options) {

    if (!M.core_filepicker.instances[options.client_id]) {
        M.core_filepicker.instances[options.client_id] = new Y.M.repository.FilePicker(options);
    }
    M.core_filepicker.instances[options.client_id].show();
};

M.core_filepicker.set_templates = function(Y, templates) {
    M.cfg.templates = M.cfg.templates || {};
    for (var templid in templates) {
        M.cfg.templates[templid] = templates[templid];
        M.core_filepicker.templates[templid] = templates[templid];
    }
};
M.core_filepicker.init = function(Y, options) {
    var loading = Y.one('#filepicker-loading-'+options.client_id);
    if (loading) {
        loading.setStyle('display', 'none');
    }
    M.core_filepicker.instances[options.client_id] = new M.repository.FilePickerHelper(options);
};

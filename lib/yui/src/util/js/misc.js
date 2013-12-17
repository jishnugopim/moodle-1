/**
 * Add module to list of available modules that can be loaded from YUI.
 * @param {Array} modules
 */
M.yui.add_module = function(modules) {
    for (var modname in modules) {
        YUI_config.modules[modname] = modules[modname];
    }
};
/**
 * The gallery version to use when loading YUI modules from the gallery.
 * Will be changed every time when using local galleries.
 */
M.yui.galleryversion = '2010.04.21-21-51';

/**
 * Language strings - initialised from page footer.
 */
M.str = M.str || {};

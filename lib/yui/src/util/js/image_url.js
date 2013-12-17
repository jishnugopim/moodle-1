/* jshint eqeqeq:false */
/**
 * Returns url for images.
 * @param {String} imagename
 * @param {String} component
 * @return {String}
 */
M.util.image_url = function(imagename, component) {
    if (!component || component === '' || component === 'moodle' || component === 'core') {
        component = 'core';
    }

    var url = M.cfg.wwwroot + '/theme/image.php';
    if (M.cfg.themerev > 0 && M.cfg.slasharguments == 1) {
        if (!M.cfg.svgicons) {
            url += '/_s';
        }
        url += '/' + M.cfg.theme + '/' + component + '/' + M.cfg.themerev + '/' + imagename;
    } else {
        url += '?theme=' + M.cfg.theme + '&component=' + component + '&rev=' + M.cfg.themerev + '&image=' + imagename;
        if (!M.cfg.svgicons) {
            url += '&svg=0';
        }
    }

    return url;
};

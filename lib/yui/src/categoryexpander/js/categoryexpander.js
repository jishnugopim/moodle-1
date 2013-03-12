var SELECTORS = {
        LISTENLINK: '.category_name a.category_link'
    },

    CSS = {
    };

M.core = M.core || {};
M.core.categoryexpander = M.core.categoryexpander = {
    init: function() {
        Y.one(Y.config.doc).delegate('click', this.toggle_expansion, SELECTORS.LISTENLINK, this);
    },
    toggle_expansion: function(e) {
        e.preventDefault();
    }
};

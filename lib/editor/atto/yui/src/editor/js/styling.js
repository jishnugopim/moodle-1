Y.mix(M.editor_atto, {

    /**
     * Disable CSS styling.
     *
     * @return {Void}
     */
    disable_css_styling: function() {
        try {
            document.execCommand("styleWithCSS", 0, false);
        } catch (e1) {
            try {
                document.execCommand("useCSS", 0, true);
            } catch (e2) {
                try {
                    document.execCommand('styleWithCSS', false, false);
                } catch (e3) {
                    // We did our best.
                }
            }
        }
    },

    /**
     * Enable CSS styling.
     *
     * @return {Void}
     */
    enable_css_styling: function() {
        try {
            document.execCommand("styleWithCSS", 0, true);
        } catch (e1) {
            try {
                document.execCommand("useCSS", 0, false);
            } catch (e2) {
                try {
                    document.execCommand('styleWithCSS', false, true);
                } catch (e3) {
                    // We did our best.
                }
            }
        }
    },

    /**
     * Change the formatting for the current selection.
     * Wraps the selection in spans and adds the provides classes.
     *
     * If the selection covers multiple block elements, multiple spans will be inserted to preserve the original structure.
     *
     * @method toggle_inline_selection_class
     * @param {String} elementid - The editor elementid.
     * @param {Array} toggleclasses - Class names to be toggled on or off.
     */
    toggle_inline_selection_class: function(elementid, toggleclasses) {
        var selectionparentnode = M.editor_atto.get_selection_parent_node(),
            root = Y.one('body'),
            nodes,
            items = [],
            parentspan,
            currentnode,
            newnode,
            i = 0;

        if (!selectionparentnode) {
            // No selection, nothing to format.
            return;
        }

        // Add a bogus fontname as the browsers handle inserting fonts into multiple blocks correctly.
        document.execCommand('fontname', false, M.editor_atto.PLACEHOLDER_FONTNAME);
        nodes = root.all(M.editor_atto.ALL_NODES_SELECTOR);

        // Create a list of all nodes that have our bogus fontname.
        nodes.each(function(node, index) {
            if (node.getStyle(M.editor_atto.FONT_FAMILY) === M.editor_atto.PLACEHOLDER_FONTNAME) {
                node.setStyle(M.editor_atto.FONT_FAMILY, '');
                if (!node.compareTo(root)) {
                    items.push(Y.Node.getDOMNode(nodes.item(index)));
                }
            }
        });

        // Replace the fontname tags with spans
        for (i = 0; i < items.length; i++) {
            currentnode = Y.one(items[i]);

            // Check for an existing span to add the nolink class to.
            parentspan = currentnode.ancestor('.editor_atto_content span');
            if (!parentspan) {
                newnode = Y.Node.create('<span></span>');
                newnode.append(items[i].innerHTML);
                currentnode.replace(newnode);

                currentnode = newnode;
            } else {
                currentnode = parentspan;
            }

            // Toggle the classes on the spans.
            for (var j = 0; j < toggleclasses.length; j++) {
                currentnode.toggleClass(toggleclasses[j]);
            }
        }
    }
});

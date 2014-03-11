// Add in the functionality.
Y.mix(M.editor_atto, {

    /**
     * A unique identifier for the last selection recorded.
     * @param lastselection
     * @type string
     */
    lastselection : null,

    /**
     * Work out if the cursor is in the editable area for this editor instance.
     * @param string elementid of this editor
     * @return bool
     */
    is_active : function(elementid) {
        var range = rangy.createRange(),
            editable = M.editor_atto.get_editable_node(elementid),
            selection = rangy.getSelection();

        if (!selection.rangeCount) {
            return false;
        }

        range.selectNode(editable.getDOMNode());

        return range.intersectsRange(selection.getRangeAt(0));
    },

    /**
     * Create a cross browser selection object that represents a yui node.
     * @param Node yui node for the selection
     * @return rangy.Range[]
     */
    get_selection_from_node: function(node) {
        var range = rangy.createRange();
        range.selectNode(node.getDOMNode());
        return [range];
    },

    /**
     * Save the current selection on blur, allows more reliable keyboard navigation.
     * @param Y.Event event
     * @param string elementid
     */
    save_selection : function(event) {
        var elementid = event.elementid;
        if (elementid && this.is_active(elementid)) {
            this.selections[elementid] = this.get_selection();
        }
    },

    /**
     * Restore any current selection when the editor gets focus again.
     * @param Y.Event event
     * @param string elementid
     */
    restore_selection : function(event, elementid) {
        if (!this.focusfromclick) {
            if (typeof this.selections[elementid] !== "undefined") {
                this.set_selection(this.selections[elementid]);
            }
        }
        this.focusfromclick = false;
    },

    /**
     * Get the selection object that can be passed back to set_selection.
     * @return rangy.Range[]
     */
    get_selection : function() {
        return rangy.getSelection().getAllRanges();
    },

    /**
     * Check that a YUI node it at least partly contained by the selection.
     * @param Y.Node node
     * @return boolean
     */
    selection_contains_node : function(node) {
        return rangy.getSelection().containsNode(node.getDOMNode(), true);
    },

    /**
     * Runs a selector on each node in the selection and will only return true if all nodes
     * in the selection match the filter.
     *
     * @param {String} elementid
     * @param {String} selector
     * @param {NodeList} selectednodes (Optional) - for performance we can pass this instead of looking it up.
     * @param {Boolean} requireall (Optional) - used to specify that any "any" match is good enough. Defaults to true.
     * @return {Boolean}
     */
    selection_filter_matches : function(elementid, selector, selectednodes, requireall) {
        if ((typeof requireall) === 'undefined') {
            requireall = true;
        }
        if (!selectednodes) {
            // Find this because it was not passed as a param.
            selectednodes = M.editor_atto.get_selected_nodes(elementid);
        }
        var allmatch = selectednodes.size() > 0, anymatch = false;
        selectednodes.each(function(node){
            // Check each node, if it doesn't match the tags AND is not within the specified tags then fail this thing.
            if (requireall) {
                // Check for at least one failure.
                if (!allmatch || !node.ancestor(selector, true, '#' + elementid + "editable")) {
                    allmatch = false;
                }
            } else {
                // Check for at least one match.
                if (!anymatch && node.ancestor(selector, true, '#' + elementid + "editable")) {
                    anymatch = true;
                }
            }
        }, this);
        if (requireall) {
            return allmatch;
        } else {
            return anymatch;
        }
    },

    /**
     * Get the deepest possible list of nodes in the current selection.
     *
     * @param {String} elementid
     * @return Y.NodeList
     */
    get_selected_nodes : function(elementid) {
        var results = new Y.NodeList(),
            nodes,
            selection,
            range,
            node,
            i;

        selection = rangy.getSelection();

        if (selection.rangeCount) {
            range = selection.getRangeAt(0);
        } else {
            // Empty range.
            range = rangy.createRange();
        }

        if (range.collapsed) {
            range.selectNode(range.commonAncestorContainer);
        }

        nodes = range.getNodes();

        for (i = 0; i < nodes.length; i++) {
            node = Y.one(nodes[i]);
            if (node.ancestor('#' + elementid + "editable")) {
                results.push(node);
            }
        }
        return results;
    },

    /**
     * Returns true if the selection has changed since this method was last called.
     *
     * If the selection has changed we also fire the custom event atto:selectionchanged
     *
     * @method _has_selection_changed
     * @private
     * @param {EventFacade} e
     * @returns {Boolean}
     */
    _has_selection_changed : function(e) {
        var selection = rangy.getSelection(),
            range,
            changed = false;

        if (selection.rangeCount) {
            range = selection.getRangeAt(0);
        } else {
            // Empty range.
            range = rangy.createRange();
        }

        if (this.lastselection) {
            if (!this.lastselection.equals(range)) {
                changed = true;
                return this._fire_selectionchanged(e);
            }
        }
        this.lastselection = range;
        return changed;
    },

    /**
     * Fires the atto:selectionchanged event.
     *
     * When the selectionchanged event gets fired three arguments are given:
     *   - event : the original event that lead to this event being fired.
     *   - elementid : the editor elementid for which this event is being fired.
     *   - selectednodes :  an array containing nodes that are entirely selected of contain partially selected content.
     *
     * @method _fire_selectionchanged
     * @private
     * @param {EventFacade} e
     */
    _fire_selectionchanged : function(e) {
        var editableid = e.currentTarget.get('id'),
            elementid = editableid.substring(0, editableid.length - 8),
            selectednodes = this.get_selected_nodes(elementid);
        this.fire('atto:selectionchanged', {
            event : e,
            elementid : elementid,
            selectedNodes : selectednodes
        });
    },

    /**
     * Get the dom node representing the common anscestor of the selection nodes.
     * @return DOMNode or false
     */
    get_selection_parent_node : function() {
        var selection = rangy.getSelection();
        if (selection.rangeCount) {
            return selection.getRangeAt(0).commonAncestorContainer;
        }
        return false;
    },

    /**
     * Set the current selection. Used to restore a selection.
     * @param rangy.Range[] ranges - List of ranges in selection.
     */
    set_selection : function(ranges) {
        var selection = rangy.getSelection();
        selection.setRanges(ranges);
    },

    /**
     * Change the formatting for the current selection.
     * Also changes the selection to the newly formatted block (allows applying multiple styles to a block).
     *
     * @param {String} elementid - The editor elementid.
     * @param {String} blocktag - Change the block level tag to this. Empty string, means do not change the tag.
     * @param {Object} attributes - The keys and values for attributes to be added/changed in the block tag.
     * @return Y.Node - if there was a selection.
     */
    format_selection_block : function(elementid, blocktag, attributes) {
        // First find the nearest ancestor of the selection that is a block level element.
        var selectionparentnode = M.editor_atto.get_selection_parent_node(),
            boundary,
            cell,
            nearestblock,
            newcontent,
            match,
            replacement;

        if (!selectionparentnode) {
            // No selection, nothing to format.
            return;
        }

        boundary = M.editor_atto.get_editable_node(elementid);

        selectionparentnode = Y.one(selectionparentnode);

        // If there is a table cell in between the selectionparentnode and the boundary,
        // move the boundary to the table cell.
        // This is because we might have a table in a div, and we select some text in a cell,
        // want to limit the change in style to the table cell, not the entire table (via the outer div).
        cell = selectionparentnode.ancestor(function (node) {
            var tagname = node.get('tagName');
            if (tagname) {
                tagname = tagname.toLowerCase();
            }
            return (node === boundary) ||
                   (tagname === 'td') ||
                   (tagname === 'th');
        }, true);

        if (cell) {
            // Limit the scope to the table cell.
            boundary = cell;
        }

        nearestblock = selectionparentnode.ancestor(M.editor_atto.BLOCK_TAGS.join(', '), true);
        if (nearestblock) {
            // Check that the block is contained by the boundary.
            match = nearestblock.ancestor(function (node) {
                return node === boundary;
            }, false);

            if (!match) {
                nearestblock = false;
            }
        }

        // No valid block element - make one.
        if (!nearestblock) {
            // There is no block node in the content, wrap the content in a p and use that.
            newcontent = Y.Node.create('<p></p>');
            boundary.get('childNodes').each(function (child) {
                newcontent.append(child.remove());
            });
            boundary.append(newcontent);
            nearestblock = newcontent;
        }

        // Guaranteed to have a valid block level element contained in the contenteditable region.
        // Change the tag to the new block level tag.
        if (blocktag && blocktag !== '') {
            // Change the block level node for a new one.
            replacement = Y.Node.create('<' + blocktag + '></' + blocktag + '>');
            // Copy all attributes.
            replacement.setAttrs(nearestblock.getAttrs());
            // Copy all children.
            nearestblock.get('childNodes').each(function (child) {
                child.remove();
                replacement.append(child);
            });

            nearestblock.replace(replacement);
            nearestblock = replacement;
        }

        // Set the attributes on the block level tag.
        if (attributes) {
            nearestblock.setAttrs(attributes);
        }

        // Change the selection to the modified block. This makes sense when we might apply multiple styles
        // to the block.
        var selection = M.editor_atto.get_selection_from_node(nearestblock);
        M.editor_atto.set_selection(selection);

        return nearestblock;
    },

    /**
     * Inserts the given HTML into the editable content at the currently focused point.
     * @param String html
     */
    insert_html_at_focus_point: function(html) {
        // We check document.selection here as the insertHTML exec command wan't available in IE until version 11.
        // In IE document.selection was removed at from version 11. Making it an easy affordable check.
        var selection = rangy.getSelection(),
            range,
            node = Y.Node.create(html);
        if (selection.rangeCount) {
            range = selection.getRangeAt(0);
        }
        if (range) {
            range.deleteContents();
            range.insertNode(node.getDOMNode());
        }
    }

});





function EditorPlugin() {
    EditorPlugin.superclass.constructor.apply(this, arguments);
}

Y.extend(EditorPlugin, Y.Base, {

}, {
    NAME: 'editorPlugin',
    ATTRS: {
    }
});

Y.namespace('M.editor_atto').EditorPlugin = EditorPlugin;

YUI.add('moodle-repository-filepicker-filetree', function (Y, NAME) {

Y.namespace('M.repository.filepicker').FileTree = Y.Base.create('fileTree', Y.Tree, [
        Y.Tree.Openable,
        Y.Tree.Labelable,
        Y.Tree.Selectable,
        Y.Tree.Sortable
]);


}, '@VERSION@', {"requires": ["tree", "tree-openable", "tree-labelable", "tree-sortable", "tree-selectable"]});

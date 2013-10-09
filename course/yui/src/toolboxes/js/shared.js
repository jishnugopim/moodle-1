// The following properties contain common strings.
// We separate them out here because when this JS is minified the content is less as
// Variables get compacted to single/double characters and the full length of the string
// exists only once.

// The CSS classes we use.
var CSS = {
    ACTIVITYINSTANCE : 'activityinstance',
    AVAILABILITYINFODIV : 'div.availabilityinfo',
    CONDITIONALHIDDEN : 'conditionalhidden',
    DIMCLASS : 'dimmed',
    DIMMEDTEXT : 'dimmed_text',
    EDITINSTRUCTIONS : 'editinstructions',
    HIDE : 'hide',
    MODINDENTCOUNT : 'mod-indent-',
    MODINDENTHUGE : 'mod-indent-huge',
    MODULEIDPREFIX : 'module-',
    SECTIONHIDDENCLASS : 'hidden',
    SECTIONIDPREFIX : 'section-',
    SHOW : 'editing_show',
    TITLEEDITOR : 'titleeditor'
},
// The CSS selectors we use.
SELECTOR = {
    ACTIONLINKTEXT : '.actionlinktext',
    ACTIVITYACTION : 'a.cm-edit-action[data-action]',
    ACTIVITYFORM : 'form.'+CSS.ACTIVITYINSTANCE,
    ACTIVITYICON : 'img.activityicon',
    ACTIVITYLI : 'li.activity',
    ACTIVITYTITLE : 'input[name=title]',
    COMMANDSPAN : '.commands',
    CONTENTAFTERLINK : 'div.contentafterlink',
    HIDE : 'a.editing_hide',
    HIGHLIGHT : 'a.editing_highlight',
    INSTANCENAME : 'span.instancename',
    MODINDENTDIV : 'div.mod-indent',
    PAGECONTENT : 'div#page-content',
    SECTIONLI : 'li.section',
    SHOW : 'a.'+CSS.SHOW,
    SHOWHIDE : 'a.editing_showhide'
},
BODY = Y.one(document.body);

M.course = M.course || {};

<?php

define('AJAX_SCRIPT', true);

require_once(dirname(__dir__) . '/config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->libdir . '/coursecatlib.php');

// We require either a category ID, or the type of frontpage category combo.
$categoryid = optional_param('categoryid', -1, PARAM_INT);
$type = optional_param('type', -1, PARAM_INT);

if ($CFG->forcelogin) {
    require_login();
}

$validfrontpagetypes = array(
    FRONTPAGECATEGORYNAMES,
    FRONTPAGECATEGORYCOMBO,
);

if ($categoryid !== -1) {
    // We need to know the current depth in order to get the correct layout.
    $depth = required_param('depth', PARAM_INT);
    $PAGE->set_category_by_id($categoryid);
    $courserenderer = $PAGE->get_renderer('core', 'course');

    // Create the course category structure.
    $coursecategory = new coursecat_renderable($categoryid, $depth);
    $coursecategory->set_subcat_depth($depth);

    // Only set the course display options if we should be showing courses.
    // TODO implement
    $coursecategory->set_courses_display_options(array(
                       'limit' => $CFG->coursesperpage,
                        'viewmoreurl' => new moodle_url('/course/category.php',
                                array('browse' => 'categories', 'page' => 1)),
                   ));
    $renderdata = $courserenderer->render($coursecategory);
    echo json_encode($renderdata);
} else if (in_array($type, $validfrontpagetypes)) {
    // Is this bit ever actually used?
    $PAGE->set_course($SITE);
    $courserenderer = $PAGE->get_renderer('core', 'course');
    $renderdata = $courserenderer->courses_list_frontpage($type);
    echo json_encode($renderdata);
} else {
    // TODO Add appropriate error message here
    print_error('youdiditwrong');
}

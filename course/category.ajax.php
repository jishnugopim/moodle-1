<?php

define('AJAX_SCRIPT', true);

require_once(dirname(__dir__) . '/config.php');

$categoryid = required_param('categoryid', PARAM_INT);
$depth = required_param('depth', PARAM_INT);
$showcourses = required_param('showcourses', PARAM_INT);

if ($CFG->forcelogin) {
    require_login();
}

// We need to know the current depth in order to get the correct layout.
$PAGE->set_category_by_id($categoryid);

$courserenderer = $PAGE->get_renderer('core', 'course');

// Create the course category structure.
$coursecategory = new coursecat_renderable($categoryid, $depth);
$coursecategory->set_subcat_depth($depth);

// Only set the course display options if we should be showing courses.
$coursecategory->set_show_courses($showcourses);

// Configure the more info links.
$coursecategory->set_categories_display_options(array(
            'limit' => $CFG->coursesperpage,
            'viewmoreurl' => new moodle_url('/course/category.php',
                    array('browse' => 'categories', 'page' => 1))
        ));

// Render the course category.
$renderdata = $courserenderer->render($coursecategory);
echo json_encode($renderdata);

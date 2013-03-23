<?php

define('AJAX_SCRIPT', true);

require_once(dirname(__dir__) . '/config.php');
require_once($CFG->dirroot . '/course/lib.php');
require_once($CFG->libdir.'/coursecatlib.php');

$type = required_param('type', PARAM_INT);

if ($CFG->forcelogin) {
    require_login();
}

if ($type === TYPECATEGORY) {
    // This is a request for a category list of some kind.
    $categoryid = required_param('categoryid', PARAM_INT);
    $showcourses = required_param('showcourses', PARAM_INT);
    $depth = required_param('depth', PARAM_INT);

    $PAGE->set_category_by_id($categoryid);
    $courserenderer = $PAGE->get_renderer('core', 'course');
    $coursecat_helper = new coursecat_helper();

    // Retrieve the category we're working on.
    $category = coursecat::get($categoryid);
    if ($showcourses === core_course_renderer::COURSECAT_SHOW_COURSES_COUNT) {
        // Only show the category without courses.
        $coursecat_helper->set_show_courses(core_course_renderer::COURSECAT_SHOW_COURSES_COUNT);
        $renderdata = $courserenderer->coursecat_subcategories($coursecat_helper, $category, $depth);
    } else {
        // Show the combo list.
        $renderdata = $courserenderer->coursecat_category_content($coursecat_helper, $category, $depth);
    }
} else if ($type === TYPECOURSE) {
    // This is a request for the course information.
    $courseid = required_param('courseid', PARAM_INT);
    $course = $DB->get_record('course', array('id' => $courseid), '*', MUST_EXIST);

    $PAGE->set_course($course);
    $courserenderer = $PAGE->get_renderer('core', 'course');
    $coursecat_helper = new coursecat_helper();

    $coursecat_helper->set_show_courses(core_course_renderer::COURSECAT_SHOW_COURSES_EXPANDED);
    $renderdata = $courserenderer->coursecat_coursebox_content($coursecat_helper, $course);
} else {
    throw new coding_exception('Invalid request type');
}
echo json_encode($renderdata);

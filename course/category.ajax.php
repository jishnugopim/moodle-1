<?php

define('AJAX_SCRIPT', true);

require_once(dirname(__dir__) . '/config.php');
require_once($CFG->dirroot . '/course/lib.php');

$categoryid = required_param('categoryid', PARAM_INT);
$showcourses = required_param('showcourses', PARAM_INT);

if ($CFG->forcelogin) {
    require_login();
}

// We need to know the current depth in order to get the correct layout.
$PAGE->set_category_by_id($categoryid);

$courserenderer = $PAGE->get_renderer('core', 'course');
$renderdata = $courserenderer->course_category($categoryid);
echo json_encode($renderdata);

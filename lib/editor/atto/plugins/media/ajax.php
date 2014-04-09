<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Renders text with the active filters and returns it. Used to create previews of medias
 * using whatever tex filters are enabled.
 *
 * @package    atto_media
 * @copyright  2014 Damyon Wiese
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

define('AJAX_SCRIPT', true);

require_once(dirname(__FILE__) . '/../../../../../config.php');

$contextid = required_param('contextid', PARAM_INT);
$context = context::instance_by_id($contextid, MUST_EXIST);
$PAGE->set_url('/lib/editor/atto/plugins/media/ajax.php');
$PAGE->set_context($context);

require_login($course, false, $cm);
require_sesskey();

$action = required_param('action', PARAM_ALPHA);

if ($action === 'filtertext') {
    $text = required_param('text', PARAM_RAW);

    $options = new stdClass();
    $options->trusted = false;
    $options->noclean = false;
    $options->smiley = false;
    $options->filter = true;
    $options->para = false;
    $options->newlines = false;
    $options->context = $context;

    echo $OUTPUT->header();
    echo format_text($text, FORMAT_HTML, $options);

    die();
}

print_error('invalidarguments');

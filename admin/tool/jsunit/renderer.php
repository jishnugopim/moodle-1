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
 * JSUnit tool renderer
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * Renderer for jsunit tool
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tool_jsunit_renderer extends plugin_renderer_base {

    public function test_header($modulename, $suitename, $configuration) {
        global $CFG;

        $return = <<<EOF
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>JavaScript Unit Tests for "$modulename:$suitename"</title>
EOF;
        $return .= html_writer::script("var M = {};");
        $return .= html_writer::script('', '../../../../config/config.js');
        $return .= html_writer::script('', "../../../../yuilib/$CFG->yui3version/yui/yui.js");
        $return .= <<<EOF
<script id="firstthemesheet" type="text/css">/** Required in order to fix style inclusion problems in IE with YUI **/</script>
</head>
<body class="yui3-skin-sam">
<div id="log"></div>

EOF;

        return $return;
    }

    public function test_footer() {
        $return = <<<EOF
</body>
</html>
EOF;
        return $return;
    }
}

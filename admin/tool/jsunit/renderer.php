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

        $simpleyuimodules = array(
            'yui',
            'oop',
            'event-custom-base',
            'dom-core',
            'dom-base',
            'color-base',
            'dom-style',
            'selector-native',
            'selector',
            'node-core',
            'node-base',
            'event-base',
            'event-base-ie',
            'pluginhost-base',
            'pluginhost-config',
            'event-delegate',
            'node-event-delegate',
            'node-pluginhost',
            'dom-screen',
            'node-screen',
            'node-style',
            'querystring-stringify-simple',
            'io-base',
            'json-parse',
            'transition',
            'selector-css2',
            'selector-css3',
            'dom-style-ie',

            // Some extras we use everywhere.
            'escape',

            'attribute-core',
            'event-custom-complex',
            'base-core',
            'attribute-base',
            'attribute-extras',
            'attribute-observable',
            'base-observable',
            'base-base',
            'base-pluginhost',
            'base-build',
            'event-synthetic',

            'attribute-complex',
            'event-mouseenter',
            'event-key',
            'event-outside',
            'event-autohide',
            'event-focus',
            'classnamemanager',
            'widget-base',
            'widget-htmlparser',
            'widget-skin',
            'widget-uievents',
            'widget-stdmod',
            'widget-position',
            'widget-position-align',
            'widget-stack',
            'widget-position-constrain',
            'overlay',

            'widget-autohide',
            'button-core',
            'button-plugin',
            'widget-buttons',
            'widget-modality',
            'panel',
            'yui-throttle',
            'dd-ddm-base',
            'dd-drag',
            'dd-plugin',

            // Cache is used by moodle-core-tooltip which we include everywhere.
            'cache-base',
        );

        $return = <<<EOF
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>JavaScript Unit Tests for "$modulename:$suitename"</title>
EOF;
        $return .= html_writer::script("var M = {
    cfg: {
        wwwroot: ''
    },
    yui: {}
};");
        $return .= html_writer::script('', '../../../../config/config.js');
        $return .= html_writer::script('', "../../../../yuilib/$CFG->yui3version/yui/yui.js");
        $return .= html_writer::script('', '../../../../config/javascript-static.js');
        $return .= '<script id="firstthemesheet" type="text/css">/** Required in order to fix style inclusion problems in IE with YUI **/</script>';
        $return .= html_writer::script('var Y = YUI().use("' . implode('", "', $simpleyuimodules) . '");');
        $return .= <<<EOF
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

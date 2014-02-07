<?php

define('CLI_SCRIPT', true);
require_once(dirname(dirname(dirname(__DIR__))) . '/config.php');

class test_page_requirements_manager extends page_requirements_manager {
    public function __construct() {
        global $CFG;

        $CFG->httpswwwroot = '../../../../../../../../../../..';
        // Run the parent constructor first.
        parent::__construct();

        // Now override some of the settings:

        // Use the local_base setting instead of the CDN.
        $this->YUI_config->base = $this->yui3loader->local_base;

        // Do not use the combo loader.
        $this->YUI_config->combine = false;
        foreach ($this->YUI_config->groups as &$group) {
            $group['combine'] = false;
        }

        $this->YUI_config->groups['moodle']['configFn'] = $this->YUI_config->set_config_source('/admin/tests/yuitest/yuitest.js');

        // Point at the static files for all groups.
        // We copy all built files into ./build/ as part of the unit test run.
        foreach ($this->YUI_config->groups as $name => &$group) {
            switch ($name) {
                case 'yui2':
                case 'gallery':
                    continue 2;
                    break;
                default:
                    break;
            }
            $group['base'] = './build/';
        }
    }

    public function get_yui_config() {
        return $this->YUI_config;
    }

    public function get_yui_head_code() {
        global $CFG;

        $code = '';

        // Add the configuration we're created.
        $config = $this->YUI_config->get_config_functions();
        $config .=  js_writer::set_variable('YUI_config', $this->get_yui_config());
        $config .= $this->YUI_config->update_header_js($config);

        $code .= html_writer::script($config);

        // TODO move these to a shared location.
        // Include everything from original SimpleYUI,
        // this list can be built using http://yuilibrary.com/yui/configurator/ by selecting all modules
        // listed in https://github.com/yui/yui3/blob/v3.12.0/build/simpleyui/simpleyui.js#L21327
        $baserollups = array(
            'yui',
            'yui-base',
            'get',
            'features',
            'loader-base',
            'loader-rollup',
            'loader-yui3',
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
        foreach ($baserollups as $rollup) {
            $code .= '<script type="text/javascript" src="'.$this->yui3loader->local_base.$rollup.'/' . $rollup . '-debug.js"></script>';
        }

        // These are Moodle specific parts of the rollup.
        // TODO move these to a shared location.
        $moodlerollups = array(
            'core/tooltip/tooltip',
            'core/popuphelp/popuphelp',
            'core/dock/dock-loader',
            'core/notification/notification-dialogue',
        );
        $filebase = $this->YUI_config->groups['moodle']['base'];
        foreach ($moodlerollups as $rollup) {
            $module = explode('/', $rollup);
            $modulename = implode('-', array('moodle', $module[0], $module[2]));
            $filename = $filebase . $modulename . '/' . $modulename;
            $code .= '<script type="text/javascript" src="' . $filename . '"></script>';
        }

        // And our static JS which is used in various places.
        $code .= html_writer::script('', $this->js_fix_url('/lib/javascript-static.js'));

        return $code;
    }

}

$testingpage = new test_page_requirements_manager();
echo $testingpage->get_yui_head_code() . "\n";

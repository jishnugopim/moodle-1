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
 * JSUnit implementation of YUI Configuration object
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * JSUnit implementation of YUI Configuration object
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tool_jsunit_yuiconfig extends YUI_config {
    public $jsunit_module_list = array();

    public $jsunit_test_list = array();

    // We need to hook in here somewhere to fetch all build.json directories too.
    protected function get_moodle_path_metadata($path) {
        $returnvalue = parent::get_moodle_path_metadata($path);

        $buildmodules = array();
        $srctests = array();

        $baseyui = $path . '/yui/build/';
        $srcyui = $path . '/yui/src/';
        foreach ($returnvalue as $modulename => $data) {
            if (isset($buildmodules[$modulename])) {
                // Convert to a YUI Exception?
                throw new tool_jsunit_exception('Duplicate module! Who broke it?!?');
            }

            // Get the build directory information.
            $builddir = $baseyui . $modulename;
            if (is_dir($builddir)) {
                $buildmodules[$modulename] = $builddir;
            }

            $testdir = $srcyui . $data->sourcemodule . '/tests/unit';
            $testconfig = $testdir . '/config.json';
            if (is_dir($testdir) && is_readable($testdir) && is_file($testconfig) && is_readable($testconfig)) {
                $testsuites = file_get_contents($testconfig);
                $moduleconfig = json_decode($testsuites);
                foreach ($moduleconfig as $module => $data) {
                    $data->sourcedir = $testdir;
                }
                $srctests = array_merge($srctests, (array) $moduleconfig);
            }
        }

        $this->jsunit_module_list = array_merge($this->jsunit_module_list, $buildmodules);
        $this->jsunit_test_list = array_merge($this->jsunit_test_list, $srctests);

        // Return the original parent value.
        return $returnvalue;
    }
}

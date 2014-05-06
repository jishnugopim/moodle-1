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
 * JSUnit tool
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tool_jsunit_util {

    public static function check_dir_exists($directory, $removefirst = false) {
        global $CFG;

        if (empty($CFG->jsunit_root)) {
            throw new tool_jsunit_exception('No jsunit_root defined');
        }
        if (!is_dir($CFG->jsunit_root)) {
            if (strpos($CFG->jsunit_root, $CFG->dirroot) !== false) {
                // The jsunit_root is wihin the dirroot - bail.
                throw new tool_jsunit_exception('The jsunit_root cannot be within the dirroot');
            }
        }

        if (strpos($directory, '/') === 0) {
            // The directory starts with a / so it is absolute.
            // Check that it's within the jsunit_root.
            if (strpos($directory, $CFG->jsunit_root) !== 0) {
                throw new tool_jsunit_exception('Attempted to create ' . $directory .
                    ' outside of the the jsunit_root directory');
            }
        } else {
            // Prefix wtih the jsunit_root.
            $directory = $CFG->jsunit_root . DIRECTORY_SEPARATOR . $directory;
        }

        if ($removefirst) {
            remove_dir($directory);
        }
        if (check_dir_exists($directory)) {
            return $directory;
        } else {
            throw new tool_jsunit_exception('Could not create your new shiny directory :(');
        }
    }

    public static function recursive_copy($source, $destination) {
        // TODO Check if this is a directory.
        if (!is_dir($source) || !is_readable($source)) {
        }
        if (!is_dir($destination) || !is_readable($destination)) {
        }
        // TODO Check that the destination directory exists.
        if (!is_dir($destination)) {
            mkdir($destination);
        }
        $directoryiterator = new RecursiveDirectoryIterator($source, RecursiveDirectoryIterator::SKIP_DOTS);
        $iterator = new RecursiveIteratorIterator($directoryiterator,  RecursiveIteratorIterator::SELF_FIRST);
        foreach ($iterator as $item) {
            $path = $destination . DIRECTORY_SEPARATOR . $iterator->getSubPathName();
            // TODO add error checking.
            // TODO permissions.
            if ($item->isDir()) {
                mkdir($path);
            } else {
                copy($item, $path);
            }
        }
        // TODO determine the best return value.
    }

    public static function get_yui_config() {
        $YUI_config = new tool_jsunit_yuiconfig();
        $YUI_config->add_group('moodle', array(
            'name' => 'moodle',
            'base' => '../../../../sources/build/moodle/',
            'filter' => 'DEBUG',
            'ext' => false,
            'patterns' => array(
                'moodle-' => array(
                    'group' => 'moodle',
                )
            )
        ));
        $YUI_config->add_moodle_metadata();

        // Unset various things we override for standard Moodle but need for/ testing.
        unset($YUI_config->base);
        unset($YUI_config->combine);
        unset($YUI_config->comboBase);
        unset($YUI_config->debug);
        unset($YUI_config->filter);
        $YUI_config->filter = 'RAW';

        return $YUI_config;
    }

    public static function build_module($YUI_config, $targetdir, $modulename) {
        global $PAGE;

        if (!isset($YUI_config->jsunit_module_list[$modulename])) {
            throw new tool_jsunit_exception('Module ' . $modulename . ' not found');
        }

        if (!isset($YUI_config->jsunit_test_list[$modulename])) {
            // We don't want to throw here - we don't demand tests.
            return;
        }

        // Get the list of testsuites for this module.
        $testsuites = $YUI_config->jsunit_test_list[$modulename];
        if (!isset($testsuites->tests)) {
            throw new tool_jsunit_exception('No tests found for ' . $modulename);
        }

        $renderer = $PAGE->get_renderer('tool_jsunit');

        // Build each test-suite.
        foreach ($testsuites->tests as $suitename => $configuration) {
            // Check that we have the required JS for this test.
            $testsuitedir = $testsuites->sourcedir . DIRECTORY_SEPARATOR . 'suites';
            if (!is_dir($testsuitedir)) {
                throw new tool_jsunit_exception('Could not find the test suite directory: ' . $testsuitedir);
            }
            if (!is_array($configuration->suites)) {
                throw new tool_jsunit_exception('No suites found for ' . $suitename);
            }

            // The test-suites goes into $targetdir/$modulename/$suitename.
            $builddir = $targetdir . DIRECTORY_SEPARATOR . $modulename . DIRECTORY_SEPARATOR . $suitename;
            tool_jsunit_util::check_dir_exists($builddir);

            // Re-initialise the output.
            $output = '';
            // Each testsuite has a header.
            $output .= $renderer->test_header($modulename, $suitename, $configuration);

            // If there is any HTML output, add it now.
            if (!empty($configuration->html)) {
                $htmlsourcedir = $testsuites->sourcedir . DIRECTORY_SEPARATOR . 'html';
                if (!is_dir($htmlsourcedir)) {
                    throw new tool_jsunit_exception('Could not find the test suite HTML directory: ' . $htmlsourcedir);
                }

                foreach ($configuration->html as $htmlsnippet) {
                    $htmlfile = $htmlsourcedir . DIRECTORY_SEPARATOR . $htmlsnippet;
                    if (!is_file($htmlfile)) {
                        throw new tool_jsunit_exception('Could not find the test html snippet: ' . $htmlfile);
                    }
                    $output .= "<!-- Start of HTML source from {$htmlfile} -->\n";
                    $output .= file_get_contents($htmlfile);
                    $output .= "<!-- End of HTML source from {$htmlfile} -->\n";
                }
            }

            // Build the full list of requirements.
            $requirements = implode("', '", array_merge($configuration->requires, array(
                $modulename,
                "node",
                "test",
                "test-console"
            )));

            $instanceconfig = new stdClass();
            $instanceconfig->coverage = array($modulename);
            $instanceconfig = json_encode($instanceconfig);
            $script =<<<EOF
    YUI({$instanceconfig}).use('{$requirements}', function(Y) {

        (new Y.Test.Console({
            verbose: true,
            newestOnTop: false,
            filters: {
                pass: true,
                fail: true
            }
        })).render('#log');

        var suite = new Y.Test.Suite("Tests for {$modulename}");

EOF;

            // Add all of the actual tests.
            $suitedir = $builddir . DIRECTORY_SEPARATOR . 'suites';
            tool_jsunit_util::check_dir_exists($suitedir);
            foreach ($configuration->suites as $suite) {
                $jsfile = $testsuitedir . DIRECTORY_SEPARATOR . $suite;
                if (!is_file($jsfile)) {
                    throw new tool_jsunit_exception('Could not find the test test file: ' . $htmlfile);
                }
                $script .= "// Start of Suite source from {$jsfile}\n";
                $script .= file_get_contents($jsfile);
                $script .= "// End of Suite source from {$jsfile}\n";
            }
            $script .=<<<EOF
        Y.Test.Runner.run();
    });\n
EOF;

            $output .= html_writer::script($script);

            // Each testsuite has a footer.
            $output .= $renderer->test_footer();

            // Now write the testsuite to disk.
            $fh = fopen($builddir . "/index.html", "w");
            if (!fwrite($fh, $output)) {
                throw new tool_jsunit_exception('Unable to write the test file.');
            }
            fclose($fh);

            // We also need to write all of the suite JS, and assets.
            //if (is
        }
    }
}

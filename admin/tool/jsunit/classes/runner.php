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
 * JSUnit Runner
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class tool_jsunit_runner {

    /**
     * A list of all the modules to build and/or run tests for.
     *
     * @var array module_run_list
     */
    private $module_run_list = array();

    /**
     * The root path where all compiled content lives.
     *
     * @var string jsunit_root
     */
    private $jsunit_root;

    /**
     * The directories under the root directory which other parts of this
     * class use.
     *
     * @var stdClass directories
     */
    private $directories;

    /**
     * The test-specific YUI configuration.
     *
     * @var stdClass YUI_config
     */
    private $YUI_config;

    /**
     * Whether to generate coverage reports for the modules being compiled and tested from YETI.
     *
     * @var boolean $automatedcoverage
     */
    private $automatedcoverage = false;

    /**
     * Whether to generate coverage reports for the modules being compiled and tested manually.
     *
     * @var boolean $manualcoverage
     */
    private $manualcoverage = false;

    /**
     * Build a new test runner.
     *
     * @param array $targetmodules An optional list of the moodle-YUI modules to build
     * @param boolean $fullbuild Whether to run a full build. If true, the
     * YUI module cache is removed and reset.
     */
    public function __construct($targetmodules = array(), $fullbuild = false) {
        $this->directories = new stdClass();

        // Create a new directory in dataroot
        $this->jsunit_root = tool_jsunit_util::check_dir_exists('jsunit', $fullbuild);

        // Clear up the old directory first and create a new directory.
        $this->directories->moodlebuild = tool_jsunit_util::check_dir_exists($this->jsunit_root . '/moodle', true);

        // Clear the old coverage directory away.
        remove_dir($this->jsunit_root . '/coverage');

        // And create somewhere to store the unit tests we will then run.
        $this->directories->tests = tool_jsunit_util::check_dir_exists($this->jsunit_root . '/tests/unit', $fullbuild);

        // Set the list of modules to run - we'll deal with this later once
        // we've parsed the YUI configuration.
        $this->module_run_list = $targetmodules;

        // Copy all of the YUI content in place.
        $this->compile_yui_content($fullbuild);
    }

    private function check_initialisation() {
        static $initialised = false;

        if (!$initialised) {
            $this->build_moodle_config();

            if (empty($this->module_run_list)) {
                foreach ($this->YUI_config->jsunit_test_list as $modulename => $source) {
                    $this->module_run_list[] = $modulename;
                }
            }

            // We need the module run list for coverage to happen nicely here.
            $this->copy_moodle_modules();

            $initialised = true;
        }
        return true;
    }

    private function get_yui_config() {
        $YUI_config = new tool_jsunit_yuiconfig();
        $YUI_config->add_group('moodle', array(
            'name' => 'moodle',
            'base' => '../../../../moodle/',
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

    private function build_moodle_config() {
        // We always build  a fresh YUI configuration.
        mtrace("Starting configuration build and copy");

        /*
         * Generate the YUI configuraiton.
         *
         * The generated configuration is stored inthe build directory so that
         * it can be easily updated and loaded separately to the built test files.
         */
        $configdir = tool_jsunit_util::check_dir_exists($this->jsunit_root . '/config');

        $this->YUI_config = $this->get_yui_config();
        $fh = fopen($configdir . "/config.js", "w");
        $config = js_writer::set_variable('YUI_config', $this->YUI_config);
        if (!fwrite($fh, $config)) {
            throw new tool_jsunit_exception('Unable to write YUI configuration');
        }
        fclose($fh);
        mtrace("Completed configuration build and copy");
    }

    private function copy_moodle_modules() {
        /*
         * Create a copy of all of the moodle modules.
         *
         * We always copy a fresh version of all YUI modules in place for testing.
         */
        mtrace("Starting copy of latest module build");

        foreach ($this->YUI_config->jsunit_module_list as $modulename => $source) {
            // Need to perform a recursive copy here... :(
            $targetdir = $this->directories->moodlebuild . DIRECTORY_SEPARATOR . $modulename;
            tool_jsunit_util::recursive_copy($source, $targetdir);
        }

        foreach ($this->module_run_list as $modulename) {
            $istanbul = escapeshellcmd("/usr/local/bin/istanbul");
            if ($this->manualcoverage && $istanbul && is_file($istanbul) && is_executable($istanbul)) {
                $targetdir = $this->directories->moodlebuild . DIRECTORY_SEPARATOR . $modulename;
                $debugfile = $targetdir . DIRECTORY_SEPARATOR . $modulename . '-debug.js';
                $instrumentedfile = $targetdir . DIRECTORY_SEPARATOR . $modulename . '-coverage.js';
                if (file_exists($debugfile)) {
                    exec($istanbul . ' instrument ' . escapeshellarg($debugfile) . ' > ' . escapeshellarg($instrumentedfile));
                } else {
                    // Stop at the first sign of trouble.
                    throw new tool_jsunit_exception('Unable to find a -debug file to build coverage for ' . $debugfile);
                }
            }
        }
        mtrace("Completed build copy");
    }

    /**
     * Compile all of the upstream YUI content into place in the output area.
     *
     * @param boolean $force Whether to clear the cache and force a fresh copy
     */
    public function compile_yui_content($force = false) {
        global $CFG;

        $yuidir = $this->jsunit_root . '/yuilib';
        if ($force || !is_dir($yuidir)) {
            mtrace("Copying YUI build directories in place");
            tool_jsunit_util::check_dir_exists($yuidir, true);

            // Copy all of YUI in place.
            tool_jsunit_util::recursive_copy($CFG->libdir . '/yuilib', $yuidir);
            mtrace("Finished copying YUI build directories in place");
        }
    }

    /**
     * Compile all required test suites from the source into a build
     * structure.
     */
    public function compile_testsuites() {
        $this->check_initialisation();

        foreach ($this->module_run_list as $modulename) {
            // Run the build for all modules in the run list.
            $this->compile_testsuite($modulename);
        }
    }

    /**
     * Compile the testsuites for the named Moodle YUI module.
     *
     * This module must have a valid yui/src directory, and have tests
     * within the tests/unit directory.
     *
     * @param string $modulename the Moodle YUI module to compile
     * testsuites for.
     */
    private function compile_testsuite($modulename) {
        global $PAGE;

        if (!isset($this->YUI_config->jsunit_module_list[$modulename])) {
            throw new tool_jsunit_exception('Module ' . $modulename . ' not found');
        }

        if (!isset($this->YUI_config->jsunit_test_list[$modulename])) {
            // We don't want to throw here - we don't demand tests.
            return;
        }

        // Get the list of testsuites for this module.
        $testsuites = $this->YUI_config->jsunit_test_list[$modulename];
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

            // The test-suites goes into /path/to/compiled/unit/tests/$modulename/$suitename.
            $builddir = tool_jsunit_util::check_dir_exists($this->directories->tests . DIRECTORY_SEPARATOR . $modulename . DIRECTORY_SEPARATOR . $suitename);

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

            $assetpath = $testsuites->sourcedir . DIRECTORY_SEPARATOR . 'assets';
            if (file_exists($assetpath) && is_dir($assetpath)) {
                tool_jsunit_util::recursive_copy($assetpath, $builddir . DIRECTORY_SEPARATOR . 'assets');
            }

            // Build the full list of requirements.
            if (!isset($configuration->requires)) {
                $configuration->requires = array();
            }
            $requirements = implode("', '", array_merge($configuration->requires, array(
                $modulename,
                "node",
                "test",
                "test-console"
            )));

            $instanceconfig = new stdClass();
            $instanceconfig->coverage = array($modulename);
            $instanceconfig->filter = ($this->manualcoverage) ? 'COVERAGE' : 'DEBUG';
            $instanceconfig = json_encode($instanceconfig);
            $script =<<<EOF
    YUI({$instanceconfig}).use('{$requirements}', function(Y) {

        (new Y.Test.Console({
            verbose: true,
            filters: {
                pass: true,
                fail: true
            }
        })).render('#log');

EOF;

            // Add all of the actual tests.
            foreach ($configuration->suites as $suite) {
                $jsfile = $testsuitedir . DIRECTORY_SEPARATOR . $suite;
                if (!is_file($jsfile)) {
                    throw new tool_jsunit_exception('Could not find the test test file: ' . $htmlfile);
                }

                $script .= "(function(runner) {\n";
                $script .= "var suite = new Y.Test.Suite('Tests for {$modulename}:{$suite}');\n";

                $script .= "// Start of Suite source from {$jsfile}\n";
                $script .= file_get_contents($jsfile);
                $script .= "// End of Suite source from {$jsfile}\n";

                $script .= "// Add the suite to the test runner.\n";
                $script .= "runner.add(suite);\n";
                $script .= "}(Y.Test.Runner));\n";
            }
            $script .=<<<EOF
        // Now run the tests.
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
        }
    }

    /**
     * Run all required test suites.
     */
    public function run_tests() {
        $this->check_initialisation();

        // TODO add some check to make sure that we compiled the test suites.

        $testdir = str_replace($this->jsunit_root . '/', '', $this->directories->tests);

        $runlist = array();
        foreach ($this->module_run_list as $modulename) {
            // Run the build for all target modules.
            $runlist[] = escapeshellarg("$testdir/$modulename") . "/*/index.html";
        }

        // Yeti must be run from the tests directory.
        chdir($this->jsunit_root);

        // TODO Switch this to using composer version of yeti
        $yeti = escapeshellcmd("/usr/local/bin/yeti");
        if ($this->automatedcoverage) {
            $coverage = '--coverage --instrument-exclude **/jsunit/yuilib/** --instrument-exclude **/jsunit/config/** --coverage-report html';
            if ($this->manualcoverage) {
                $coverage .= ' --no-instrument';
            }
        } else {
            $coverage = '';
        }

        exec($yeti . " $coverage " . implode(" ", $runlist), $output, $return);

        mtrace(implode("\n", $output));

        exit($return);
    }

    public function instrument_modules($automatedcoverage = false, $manualcoverage = false) {
        $this->automatedcoverage = $automatedcoverage;
        $this->manualcoverage = $manualcoverage;
    }

}

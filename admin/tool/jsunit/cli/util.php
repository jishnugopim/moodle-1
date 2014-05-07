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
 * CLI tool with utilities to manage JS Unit Testing in Moodle
 *
 * @package    tool_jsunit
 * @copyright  2014 Andrew Robert Nicols
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */


if (isset($_SERVER['REMOTE_ADDR'])) {
    die(); // No access from web!.
}

// Basic functions.
require_once(__DIR__ . '/../../../../lib/clilib.php');

// CLI options.
// We use the unrecognized options as a list of modules to operate on.
list($options, $targetmodules) = cli_get_params(
    array(
        'help'                  => false,
        'build'                 => false,
        'test'                  => false,
        'coverage'              => false,
        'reset'                 => false,
    ),
    array(
        'h' => 'help',
        'b' => 'build',
        't' => 'test',
        'c' => 'coverage',
    )
);

if ($options['build'] || $options['test']) {
    define('CACHE_DISABLE_ALL', true);
}

// Checking util.php CLI script usage.
$help = <<<EOF

JSUnit utilities to manage the test environment

jsunit [-b|--build] [-t|--test] [-c|--coverage] <[yui-module-name] [yui-module-name] ...>

Options:
--help                  Displays this help text
--build                 Build the testing files
--test                  Run tests
--with-coverage         Use coverage instrumentation to report code coverage

Example from Moodle root directory:

\$ php admin/tool/jsunit/cli/util.php --enable


EOF;

if (!empty($options['help'])) {
    echo $help;
    exit(0);
}

// Describe this script.
define('CLI_SCRIPT', true);
define('NO_OUTPUT_BUFFERING', true);
define('IGNORE_COMPONENT_CACHE', true);

// Only load CFG from config.php, stop ASAP in lib/setup.php.
require_once(__DIR__ . '/../../../../config.php');
require_once(dirname(__DIR__) . '/locallib.php');
require_once($CFG->libdir . '/filelib.php');

$CFG->jsunit_root = '/tmp/jsunit';

$runner = new tool_jsunit_runner($targetmodules, $options['reset']);
$runner->instrument_modules($options['coverage']);

// Always build when resetting.
if ($options['reset']) {
    $options['build'] = true;
}

if ($options['build']) {
    $runner->compile_testsuites();
}

if ($options['test']) {
    $runner->run_tests();
}

if (!$options['build'] && !$options['test']) {
    echo $help;
    exit(1);
}

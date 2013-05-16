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
 * Moodle JavaScript task handler.
 *
 * @module moodle
 */
module.exports = function(grunt) {
    grunt.initConfig({});

    // We define task functions in the tasks object, and shared library
    // functions in the libfunctions object.
    var tasks = {},
        libfunctions = {};

    /**
     * Get the root directory of the Moodle installation.
     *
     * @method libfunctions.getRootDirectory
     * @return {String} The root directory.
     */
    libfunctions.getRootDirectory = function() {
        return process.cwd();
    };

    /**
     * Determine whether the specified directory is the root directory or not.
     *
     * @method libfunctions.isRootDirectory
     * @param {String} cwd (optional) The directory to check.
     * @return {Boolean} Whether the current directory is the current directory.
     */
    libfunctions.isRootDirectory = function(cwd) {
        if (typeof cwd === "undefined") {
            cwd = process.env.PWD;
        }
        return grunt.file.isPathCwd(cwd);
    };

    /**
     * Find and read the Moodle configuration.
     *
     * @method libfunctions.getMoodleVersion
     * @return {String} The complete Moodle configuration file.
     */
    libfunctions._getMoodleVersion = function() {
        return grunt.file.read('version.php');
    };

    /**
     * Helper function to get the Moodle Release String.
     *
     * @method libfunctions._getMoodleReleaseString
     * @private
     * @return {Array} The complete release string including build version.
     */
    libfunctions._getMoodleReleaseString = function() {
        var config = libfunctions._getMoodleVersion(),
            build = config.match(/release *= *'(([^ ]*) *.*Build: ([^\)]*).*)';/);
        return build;
    };

    /**
     * Determine the moodle release name and number for the current branch.
     *
     * @method libfunctions.getMoodleRelease
     * @return {String} The release string for the current branch.
     */
    libfunctions.getMoodleRelease = function() {
        return libfunctions._getMoodleReleaseString()[1];
    };

    /**
     * Determine the moodle version name and number for the current branch.
     *
     * @method libfunctions.getMoodleVersion
     * @return {String} The version string for the current branch.
     */
    libfunctions.getMoodleVersion = function() {
        return libfunctions._getMoodleReleaseString()[2];
    };

    /**
     * Determine the moodle build name and number for the current branch.
     *
     * @method libfunctions.getMoodleBuild
     * @return {String} The build string for the current branch.
     */
    libfunctions.getMoodleBuild = function() {
        return libfunctions._getMoodleReleaseString()[3];
    };

    /**
     * Define the Shifter task to perform.
     *
     * @method tasks.shifter
     */
    tasks.shifter = function() {
        var path = require('path'),
            exec = require('child_process').spawn,
            done = this.async(),
            args = [],
            shifter,
            options = {
                recursive: true,
                watch: false,
                walk: false,
                module: false
            };

        // Determine the most appropriate options to run with based upon the current location.
        if (path.basename(process.env.PWD) === 'src') {
            // Detect whether we're in a src directory.
            grunt.log.debug('In a src directory');
            args.push('--walk');
            options.walk = true;

        } else if (path.basename(path.dirname(process.env.PWD)) === 'src') {
            // Detect whether we're in a module directory.
            grunt.log.debug('In a module directory');
            options.module = true;
        }

        if (grunt.option('watch')) {
            if (!options.walk && !options.module) {
                grunt.fail.fatal('Unable to watch unless in a src or module directory');
            }

            // It is not advisable to run with recursivity and watch - this
            // leads to building the build directory in a race-like fashion.
            grunt.log.debug('Detected a watch - disabling recursivity');
            options.recursive = false;
            args.push('--watch');
        }

        if (options.recursive) {
            args.push('--recursive');
        }

        // We always add standard Moodle lint config.
        args.push('--lint', 'config');

        // Always ignore the node_modules directory.
        args.push('--excludes', 'node_modules');

        // Add the stderr option if appropriate.
        if (grunt.option('verbose')) {
            args.push('--lint-stderr');
        }

        // Actually run shifter.
        shifter = exec(process.cwd() + '/node_modules/.bin/shifter', args, {
            cwd: process.env.PWD,
            stdio: 'inherit',
            env: process.env
        });

        // Tidy up after the exec.
        shifter.on('exit', function (code) {
            if (code) {
                grunt.fail.fatal('Shifter failed with code: ' + code);
            } else {
                grunt.log.ok('Shifter build complete.');
                done();
            }
        });
    };

    // Register the shifter task with some aliases.
    grunt.registerTask('shifter', 'Run Shifter against the current directory', tasks.shifter);
    grunt.registerTask('shift', ['shifter']);
    grunt.registerTask('s', ['shifter']);

    /**
     * Define a task to generate JavaScript documentation using YUIdoc.
     *
     * @method tasks.yuidoc
     */
    tasks.yuidoc = function() {
        var exec = require('child_process').spawn,
            done = this.async(),
            args = [],
            yuidoc;

        // Handle live documentation.
        if (grunt.option('server') || grunt.option('s')) {
            args.push('--server');
        }

        // Always ignore the node_modules directory.
        args.push('--exclude', 'node_modules');

        // Set the project version in the docs.
        args.push('--project-version', 'Moodle ' + libfunctions.getMoodleRelease());

        // Actually run yuidoc.
        yuidoc = exec(process.cwd() + '/node_modules/.bin/yuidoc', args, {
            cwd: libfunctions.getRootDirectory(),
            stdio: 'inherit',
            env: process.env
        });

        // Tidy up after the exec.
        yuidoc.on('exit', function (code) {
            if (code) {
                grunt.fail.fatal('yuidoc failed with code: ' + code);
            } else {
                grunt.log.ok('yuidoc build complete.');
                done();
            }
        });
    };

    // Register the yuidoc task with some aliases.
    grunt.registerTask('yuidoc', 'Run YUIDoc for the whole of Moodle', tasks.yuidoc);
    grunt.registerTask('d', ['yuidoc']);
    grunt.registerTask('doc', ['yuidoc']);

    // A combined task to run all YUI module options.
    grunt.registerTask('js', 'Run all JavaScript tasks for Moodle', ['shifter', 'yuidoc']);
};

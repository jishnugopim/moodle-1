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
 * Unit tests for \core_files\filestorage\file_system.
 *
 * @package   core_files
 * @category  phpunit
 * @copyright 2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->libdir . '/filestorage/file_system.php');

class core_files_file_system_testcase extends advanced_testcase {

    public function tearDown() {
        file_system::reset();
    }

    protected function get_stored_file_mock_for_hash($contenthash, $mockedmethods = array()) {
        // Always mock these.
        $mockedmethods[] = 'get_contenthash';

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->setMethods($mockedmethods)
            ->getMock()
            ;

        $file->expects($this->any())
            ->method('get_contenthash')
            ->willReturn($contenthash)
            ;

        return $file;
    }

    /**
     * Ensure that it is not possible to directly instantiate the file
     * system.
     */
    public function test_not_instantiable() {
        // It's not possible to catch a fatal exception in phpunit. The
        // best we can do is to ensure that no-one has changed the
        // constructor to be public.
        $reflection = new ReflectionClass('file_system');
        $constructor = $reflection->getConstructor();
        $this->assertFalse($constructor->isPublic());
    }

    public function test_not_cloneable() {
        $reflection = new ReflectionClass('file_system');
        $this->assertFalse($reflection->isCloneable());
    }

    public function test_same_instance() {
        $fs = file_system::instance();
        $this->assertEquals($fs, file_system::instance());
    }

    public function test_sync_filedir() {
        $fs = file_system::instance();
        // Note, this test is largely superflous - just trying to improve coverage a little.
        $this->assertNull($fs->sync_filedir());
    }

    public function test_reset() {
        $fs = file_system::instance();
        file_system::reset();
        $this->assertFalse($fs === file_system::instance());
    }

    public function test_default_class() {
        $this->resetAfterTest();
        global $CFG;
        $CFG->filesystem_handler_class = null;
        $fs = file_system::instance();
        $this->assertInstanceOf('file_system', $fs);
        $this->assertEquals('file_system', get_class($fs));
    }

    public function test_supplied_class() {
        global $CFG;
        $this->resetAfterTest();

        // Mock the file_system.
        // Mocks create a new child of the mocked class which is perfect for this test.
        $filesystem = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->getMock()
            ;
        $CFG->filesystem_handler_class = get_class($filesystem);

        // Setup the file_system.
        $fs = file_system::instance();

        // Yes... this test is superflous, but it's to satisfy anyone
        // coming here that the mock is *not* the actual file_system.
        $this->assertNotEquals('file_system', get_class($filesystem));
        // Ensure that we realy did get the correct mocked class and not the default.
        $this->assertInstanceOf(get_class($filesystem), $fs);
        $this->assertInstanceOf('file_system', $fs);
    }

    public function test_readonly_filesystem_filedir() {
        // Setup the filedir but remove permissions.
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedirroot'   => array(),
            'trashdirroot'  => array(),
        ));

        $vfileroot->getChild('filedirroot')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        $filedir    = \org\bovigo\vfs\vfsStream::url('root/filedirroot/filedir');
        $trashdir   = \org\bovigo\vfs\vfsStream::url('root/trashdirroot/trashdir');

        // This should generate an exception.
        $this->setExpectedExceptionRegexp('file_exception',
            '/Can not create local file pool directories, please verify permissions in dataroot./');

        file_system::instance($filedir, $trashdir, 0777, 0777);
    }

    public function test_readonly_filesystem_trashdir() {
        // Setup the filedir but remove permissions.
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedirroot'   => array(),
            'trashdirroot'  => array(),
        ));

        $vfileroot->getChild('trashdirroot')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        $filedir    = \org\bovigo\vfs\vfsStream::url('root/filedirroot/filedir');
        $trashdir   = \org\bovigo\vfs\vfsStream::url('root/trashdirroot/trashdir');

        // This should generate an exception.
        $this->setExpectedExceptionRegexp('file_exception',
            '/Can not create local file pool directories, please verify permissions in dataroot./');

        file_system::instance($filedir, $trashdir, 0777, 0777);
    }

    public function test_warnings_put_in_place() {
        // Setup the filedir but remove permissions.
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root');

        $filedir    = \org\bovigo\vfs\vfsStream::url('root/filedir');
        $trashdir   = \org\bovigo\vfs\vfsStream::url('root/trashdir');

        file_system::instance($filedir, $trashdir, 0777, 0777);
        $this->assertTrue($vfileroot->hasChild('filedir/warning.txt'));
        $this->assertEquals(
            'This directory contains the content of uploaded files and is controlled by Moodle code. Do not manually move, change or rename any of the files and subdirectories here.',
            $vfileroot->getChild('filedir/warning.txt')->getContent()
        );
    }

    public function test_readfile() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        $filepath = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(filesize($filepath))
            ;

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Note: It is currently not possible to mock readfile_allow_large
        // because file_system is in the global namespace.
        // We must therefore check for expected output. This is not ideal.
        $this->expectOutputString($filecontent);
        $fs->readfile($file);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_fullpath_from_storedfile($hash, $hashdir) {
        global $CFG;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->setMethods(array('sync_external_file', 'get_contenthash'))
            ->getMock()
            ;

        $file->expects($this->never())
            ->method('sync_external_file')
            ;

        $file->expects($this->once())
            ->method('get_contenthash')
            ->willReturn($hash)
            ;

        $method = new ReflectionMethod('file_system', 'get_fullpath_from_storedfile');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($file));

        $expected_path = sprintf('%s/filedir/%s/%s', $CFG->dataroot, $hashdir, $hash);
        $this->assertEquals($expected_path, $result);
    }

    public function test_get_fullpath_from_storedfile_with_sync() {
        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->setMethods(array('sync_external_file', 'get_contenthash'))
            ->getMock()
            ;

        $file->expects($this->once())
            ->method('sync_external_file')
            ->willReturn(null);

        $file->expects($this->once())
            ->method('get_contenthash')
            ->willReturn('eee4943847a35a4b6942c6f96daafde06bcfdfab')
            ;

        $method = new ReflectionMethod('file_system', 'get_fullpath_from_storedfile');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $method->invokeArgs($fs, array($file, true));
        $this->assertFalse(false);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_fulldir_from_storedfile($hash, $hashdir) {
        global $CFG;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->setMethods(array('sync_external_file', 'get_contenthash'))
            ->getMock()
            ;

        $file->expects($this->once())
            ->method('get_contenthash')
            ->willReturn($hash)
            ;

        $method = new ReflectionMethod('file_system', 'get_fulldir_from_storedfile');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($file));

        $expected_path = sprintf('%s/filedir/%s', $CFG->dataroot, $hashdir);
        $this->assertEquals($expected_path, $result);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_fulldir_from_hash($hash, $hashdir) {
        global $CFG;

        $method = new ReflectionMethod('file_system', 'get_fulldir_from_hash');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($hash));

        $expected_path = sprintf('%s/filedir/%s', $CFG->dataroot, $hashdir);
        $this->assertEquals($expected_path, $result);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_fullpath_from_hash($hash, $hashdir) {
        global $CFG;

        $method = new ReflectionMethod('file_system', 'get_fullpath_from_hash');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($hash));

        $expected_path = sprintf('%s/filedir/%s/%s', $CFG->dataroot, $hashdir, $hash);
        $this->assertEquals($expected_path, $result);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_contentdir_from_hash($hash, $hashdir) {
        $method = new ReflectionMethod('file_system', 'get_contentdir_from_hash');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($hash));

        $this->assertEquals($hashdir, $result);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_contentpath_from_hash($hash, $hashdir) {
        $method = new ReflectionMethod('file_system', 'get_contentpath_from_hash');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($hash));

        $expected_path = sprintf('%s/%s', $hashdir, $hash);
        $this->assertEquals($expected_path, $result);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_trash_fullpath_from_storedfile($hash, $hashdir) {
        global $CFG;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->setMethods(array('get_contenthash'))
            ->getMock()
            ;

        $file->expects($this->once())
            ->method('get_contenthash')
            ->willReturn($hash)
            ;

        $method = new ReflectionMethod('file_system', 'get_trash_fullpath_from_storedfile');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($file));

        $expected_path = sprintf('%s/trashdir/%s/%s', $CFG->dataroot, $hashdir, $hash);
        $this->assertEquals($expected_path, $result);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_trash_fullpath_from_hash($hash, $hashdir) {
        global $CFG;

        $method = new ReflectionMethod('file_system', 'get_trash_fullpath_from_hash');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($hash));

        $expected_path = sprintf('%s/trashdir/%s/%s', $CFG->dataroot, $hashdir, $hash);
        $this->assertEquals($expected_path, $result);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_trash_fulldir_from_storedfile($hash, $hashdir) {
        global $CFG;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->setMethods(array('sync_external_file', 'get_contenthash'))
            ->getMock()
            ;

        $file->expects($this->once())
            ->method('get_contenthash')
            ->willReturn($hash)
            ;

        $method = new ReflectionMethod('file_system', 'get_trash_fulldir_from_storedfile');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($file));

        $expected_path = sprintf('%s/trashdir/%s', $CFG->dataroot, $hashdir);
        $this->assertEquals($expected_path, $result);
    }

    /**
     * @dataProvider contenthash_dataprovider
     */
    public function test_get_trash_fulldir_from_hash($hash, $hashdir) {
        global $CFG;

        $method = new ReflectionMethod('file_system', 'get_trash_fulldir_from_hash');
        $method->setAccessible(true);

        $fs = file_system::instance();
        $result = $method->invokeArgs($fs, array($hash));

        $expected_path = sprintf('%s/trashdir/%s', $CFG->dataroot, $hashdir);
        $this->assertEquals($expected_path, $result);
    }

    public function test_is_readable() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array('get_fullpath_from_storedfile'))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('get_fullpath_from_storedfile')
            ->willReturn(__FILE__)
            ;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock()
            ;

        $this->assertTrue($fs->is_readable($file));
    }

    public function test_is_readable_with_failed_recovery() {
        $filedir = \org\bovigo\vfs\vfsStream::setup('filedir');
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array(
                'get_fullpath_from_storedfile',
                'try_content_recovery',
            ))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('get_fullpath_from_storedfile')
            ->willReturn(\org\bovigo\vfs\vfsStream::url('filedir/file'))
            ;

        $fs->expects($this->once())
            ->method('try_content_recovery')
            ->willReturn(false)
            ;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock()
            ;

        $this->assertFalse($fs->is_readable($file));
    }

    public function test_is_readable_with_successful_recovery() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
            ),
            'trashdir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(filesize(\org\bovigo\vfs\vfsStream::url('root/sourcedir/file')))
            ;


        $this->assertTrue($fs->is_readable($file));
    }

    public function test_is_readable_by_hash() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array('get_fullpath_from_hash'))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('get_fullpath_from_hash')
            ->willReturn(__FILE__)
            ;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock()
            ;

        $this->assertTrue($fs->is_readable_by_hash($file));
    }

    public function test_ensure_readable() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array('is_readable'))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('is_readable')
            ->willReturn(true)
            ;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock()
            ;

        $this->assertTrue($fs->ensure_readable($file));
    }

    public function test_ensure_readable_exception_on_unreadable() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array('is_readable'))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('is_readable')
            ->willReturn(false)
            ;

        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock()
            ;

        $this->setExpectedExceptionRegexp('file_exception',
            '/Can not read file, either file does not exist or there are permission problems/');
        $fs->ensure_readable($file);
    }

    public function test_ensure_readable_by_hash() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array('is_readable_by_hash'))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('is_readable_by_hash')
            ->willReturn(true)
            ;

        $this->assertTrue($fs->ensure_readable_by_hash('example'));
    }

    public function test_ensure_readable_by_hash_exception_on_unreadable() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array('is_readable_by_hash'))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('is_readable_by_hash')
            ->willReturn(false)
            ;

        $this->setExpectedExceptionRegexp('file_exception',
            '/Can not read file, either file does not exist or there are permission problems/');
        $fs->ensure_readable_by_hash('example');
    }

    public function test_copy_content_from_storedfile() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(
            ),
            'targetdir' => array(
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash);

        $result = $fs->copy_content_from_storedfile($file, \org\bovigo\vfs\vfsStream::url('root/targetdir/file'));
        $this->assertTrue($result);

        // The file should have been moved from copied to the correct path and have the same content.
        $this->assertTrue($vfileroot->hasChild('targetdir/file'));
        $this->assertTrue($vfileroot->hasChild('filedir/0f/f3/' . $contenthash));
        $this->assertEquals($filecontent, $vfileroot->getChild('targetdir/file')->getContent());
    }

    public function test_try_content_recovery_from_trash() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
            ),
            'trashdir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(filesize(\org\bovigo\vfs\vfsStream::url('root/trashdir/0f/f3/' . $contenthash)))
            ;

        // Attempt file recovery.
        $this->assertTrue($fs->try_content_recovery($file));

        // The file should have been moved from trash to the correct path
        // in filedir and have the same content.
        $this->assertFalse($vfileroot->hasChild('trashdir/0f/f3/' . $contenthash));
        $this->assertTrue($vfileroot->hasChild('filedir/0f/f3/' . $contenthash));
        $this->assertEquals($filecontent, $vfileroot->getChild('filedir/0f/f3/' . $contenthash)->getContent());
    }

    public function test_try_content_recovery_from_alt() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
            ),
            'trashdir' => array(
                $contenthash => $filecontent,
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(filesize(\org\bovigo\vfs\vfsStream::url('root/trashdir/' . $contenthash)))
            ;

        // Attempt file recovery.
        $this->assertTrue($fs->try_content_recovery($file));

        // The file should have been moved from trash to the correct path
        // in filedir and have the same content.
        $this->assertFalse($vfileroot->hasChild('trashdir/' . $contenthash));
        $this->assertTrue($vfileroot->hasChild('filedir/0f/f3/' . $contenthash));
        $this->assertEquals($filecontent, $vfileroot->getChild('filedir/0f/f3/' . $contenthash)->getContent());
    }

    public function test_try_content_recovery_not_found() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(),
            'trashdir' => array(),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(strlen($filecontent))
            ;

        // Attempt file recovery.
        $this->assertfalse($fs->try_content_recovery($file));
    }

    public function test_try_content_recovery_wrong_file_size() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
            ),
            'trashdir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(42)
            ;

        // Attempt file recovery.
        $this->assertFalse($fs->try_content_recovery($file));
    }

    public function test_try_content_recovery_wrong_hash() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $modifiedfilecontent = 'Example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
            ),
            'trashdir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $modifiedfilecontent,
                    ),
                ),
            ),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(filesize(\org\bovigo\vfs\vfsStream::url('root/sourcedir/file')))
            ;

        // Attempt file recovery.
        $this->assertFalse($fs->try_content_recovery($file));
    }

    public function test_try_content_recovery_file_already_exists() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(filesize(\org\bovigo\vfs\vfsStream::url('root/trashdir/0f/f3/' . $contenthash)))
            ;

        // Attempt file recovery.
        $this->assertTrue($fs->try_content_recovery($file));
    }

    public function test_try_content_recovery_not_writeable() {
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                ),
            ),
            'trashdir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
        ));

        // Make the target path readonly.
        $vfileroot->getChild('filedir/0f')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Get the mocked stored_file, mocking the get_filesize function.
        $file = $this->get_stored_file_mock_for_hash($contenthash, array('get_filesize'));
        $file->expects($this->any())
            ->method('get_filesize')
            ->willReturn(filesize(\org\bovigo\vfs\vfsStream::url('root/trashdir/0f/f3/' . $contenthash)))
            ;

        // Attempt file recovery.
        $this->assertFalse($fs->try_content_recovery($file));
        $this->assertFalse($vfileroot->hasChild('filedir/0f/f3'));
    }


    public function test_get_content() {
        $filecontent = 'example content';
        // Mock the filesystem.
        $filedir = \org\bovigo\vfs\vfsStream::setup('filedir');
        $vfile = \org\bovigo\vfs\vfsStream::newFile('file')
                                  ->withContent($filecontent);
        $filedir->addChild($vfile);
        $filepath = \org\bovigo\vfs\vfsStream::url('filedir/file');

        // Mock the stored file.
        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock()
            ;

        // Mock the file_system.
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array(
                'ensure_readable',
                'get_fullpath_from_storedfile',
            ))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('ensure_readable')
            ;

        $fs->expects($this->once())
            ->method('get_fullpath_from_storedfile')
            ->willReturn($filepath);

        // Note: It is currently not possible to mock readfile_allow_large
        // because file_system is in the global namespace.
        // We must therefore check for expected output. This is not ideal.
        $this->assertEquals($filecontent, $fs->get_content($file));
    }

    public function test_get_imageinfo_not_image() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array(
                'is_image',
            ))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('is_image')
            ->willReturn(false)
            ;

        // Mock the file to pass in.
        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock();

        // If the passed in file is not an image, get_imageinfo should return false.
        $this->assertFalse($fs->get_imageinfo($file));
    }

    public function test_get_imageinfo() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array(
                'is_image',
                'ensure_readable',
                'get_fullpath_from_storedfile',
                'get_imageinfo_from_path',
            ))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('is_image')
            ->willReturn(true)
            ;

        $fs->expects($this->once())
            ->method('ensure_readable')
            ;

        $fs->expects($this->once())
            ->method('get_fullpath_from_storedfile')
            ->willReturn('example')
            ;

        $fs->expects($this->once())
            ->method('get_imageinfo_from_path')
            ;

        // Mock the file to pass in.
        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock();

        // Test the file.
        // Note - we don't actually assert anything here - that is all handled by the mock expectations.
        $fs->get_imageinfo($file);
    }

    public function test_is_image_empty_filesize() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(null)
            ->getMock()
            ;

        // Mock the file to pass in.
        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->setMethods(array('get_filesize'))
            ->getMock();

        $file->expects($this->once())
            ->method('get_filesize')
            ->willReturn(0)
            ;

        $this->assertFalse($fs->is_image($file));
    }

    /**
     * @dataProvider is_image_dataprovider
     */
    public function test_is_image_mimetype($mimetype, $isimage) {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(null)
            ->getMock()
            ;

        // Mock the file to pass in.
        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->setMethods(array(
                'get_filesize',
                'get_mimetype',
            ))
            ->getMock();

        $file->expects($this->once())
            ->method('get_filesize')
            ->willReturn(512)
            ;

        $file->expects($this->once())
            ->method('get_mimetype')
            ->willReturn($mimetype)
            ;

        $this->assertEquals($isimage, $fs->is_image($file));
    }

    public function test_get_content_file_handle() {
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array(
                'ensure_readable',
                'get_fullpath_from_storedfile',
            ))
            ->getMock()
            ;

        $fs->expects($this->once())
            ->method('ensure_readable')
            ;

        $fs->expects($this->once())
            ->method('get_fullpath_from_storedfile')
            ->willReturn(__FILE__)
            ;

        // Mock the file to pass in.
        $file = $this->getMockBuilder('stored_file')
            ->disableOriginalConstructor()
            ->getMock();

        $fh = $fs->get_content_file_handle($file);
        $this->assertTrue(is_resource($fh));
        fclose($fh);
    }

    public function test_get_file_handle_for_path_invalid_type() {
        $rcm = new ReflectionMethod('file_system', 'get_file_handle_for_path');
        $rcm->setAccessible(true);
        $this->setExpectedException('coding_exception', 'Unexpected file handle type');

        $rcm->invoke(null, 'example', -42);
    }

    /**
     * Test that xsendfile is callable.
     * Note: We will not test the output of xsendfile in real use because
     * that is beyond the scope of this unit test.
     *
     * If we ever move the file_system classes to their own namespace, we
     * will instead mock xsendfile within the namespace and ensure that it
     * is called.
     */
    public function test_xsendfile_disabled() {
        $this->resetAfterTest();

        global $CFG;
        $CFG->xsendfile = null;

        // Setup the filedir.
        // This contains a virtual file which has a cache mismatch.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    )
                ),
            ),
            'trashdir' => array(),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $this->assertFalse($fs->xsendfile($contenthash));
    }

    public function test_add_file_to_pool() {
        $this->resetAfterTest();
        global $CFG;

        // Setup the filedir.
        // This contains a virtual file which has a cache mismatch.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        // Note, the vfs file system does not support locks - prevent file locking here.
        $CFG->preventfilelocking = true;

        // Attempt to add the file to the file pool.
        $result = $fs->add_file_to_pool($sourcefile);

        // Test the output.
        $this->assertEquals($contenthash, $result[0]);
        $this->assertEquals(core_text::strlen($filecontent), $result[1]);
        $this->assertTrue($result[2]);

        $this->assertEquals($filecontent, $vfileroot->getChild('filedir/0f/f3/' . $contenthash)->getContent());
    }

    public function test_add_file_to_pool_file_unavailable() {
        $this->setExpectedExceptionRegexp('file_exception',
            '/Can not read file, either file does not exist or there are permission problems/');

        $fs = file_system::instance();
        $filedir = \org\bovigo\vfs\vfsStream::setup('filedir');
        $fs->add_file_to_pool(\org\bovigo\vfs\vfsStream::url('filedir/file'));
    }

    public function test_add_file_to_pool_mismatched_hash() {
        $fs = file_system::instance();
        $filedir = \org\bovigo\vfs\vfsStream::setup('filedir');
        $vfile = \org\bovigo\vfs\vfsStream::newFile('file')
                                  ->withContent('example content');
        $filedir->addChild($vfile);
        $filepath = \org\bovigo\vfs\vfsStream::url('filedir/file');

        $fs->add_file_to_pool(
            $filepath,
            'eee4943847a35a4b6942c6f96daafde06bcfdfab'
        );
        $this->assertDebuggingCalled("Invalid contenthash submitted for file $filepath");
    }

    public function test_add_file_to_pool_false_hash() {
        $this->resetAfterTest();
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Disable debugdeveloper temporarily to test other content hash checks.
        $CFG->debugdeveloper = 0;

        $this->setExpectedException('file_exception',
            'Can not read file, either file does not exist or there are permission problems'
        );

        // Add the file to the pool.
        $fs->add_file_to_pool(\org\bovigo\vfs\vfsStream::url('root/sourcedir/file'), false);
    }

    public function test_add_file_to_pool_empty_hash() {
        $this->resetAfterTest();
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Disable debugdeveloper temporarily to test other content hash checks.
        $CFG->debugdeveloper = 0;

        // Add the file to the pool.
        $result = $fs->add_file_to_pool(\org\bovigo\vfs\vfsStream::url('root/sourcedir/file'), sha1(''));

        $this->assertEquals($contenthash, $result[0]);
        $this->assertEquals(core_text::strlen($filecontent), $result[1]);
        $this->assertTrue($result[2]);

        $this->assertEquals($filecontent, $vfileroot->getChild('filedir/0f/f3/' . $contenthash)->getContent());
    }

    public function test_add_file_to_pool_existing_valid() {
        $this->resetAfterTest();
        global $CFG;

        // Mock the filesystem.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs using the vfs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Disable debugdeveloper temporarily to test other content hash checks.
        $CFG->debugdeveloper = 0;

        // Add the file to the pool.
        $result = $fs->add_file_to_pool(\org\bovigo\vfs\vfsStream::url('root/sourcedir/file'));

        $this->assertEquals($contenthash, $result[0]);
        $this->assertEquals(core_text::strlen($filecontent), $result[1]);
        $this->assertFalse($result[2]);

        $this->assertEquals($filecontent, $vfileroot->getChild('filedir/0f/f3/' . $contenthash)->getContent());
    }

    public function test_add_file_to_pool_existing_content_invalid() {
        // Setup the filedir.
        // This contains a virtual file which has a cache mismatch.
        $filedir = \org\bovigo\vfs\vfsStream::setup('filedir', null, array(
            '0f' => array(
                'f3' => array(
                    '0ff30941ca5acd879fd809e8c937d9f9e6dd1615' => 'different example content',
                ),
            ),
        ));

        $filecontent = 'example content';
        $contenthash = '0ff30941ca5acd879fd809e8c937d9f9e6dd1615';

        // Create a new virtual file. This has a hash of.
        $vfile = \org\bovigo\vfs\vfsStream::newFile('file')
                                  ->withContent($filecontent);
        $filedir->addChild($vfile);

        $existingfilepath = \org\bovigo\vfs\vfsStream::url(
            'filedir/0f/f3/' . $contenthash
        );

        // Mock the filesystem and set it up.
        $fs = $this->getMockBuilder('file_system')
            ->disableOriginalConstructor()
            ->setMethods(array(
                'get_fulldir_from_hash',
                'get_fullpath_from_hash',
            ))
            ->getMock()
            ;

        // Have get_fulldir_from_hash return the path to the existing file
        $fs->expects($this->once())
            ->method('get_fulldir_from_hash')
            ->willReturn(\org\bovigo\vfs\vfsStream::url('filedir/0f/f3'))
            ;

        $fs->expects($this->once())
            ->method('get_fullpath_from_hash')
            ->willReturn($existingfilepath)
            ;

        // Check that we hit the jackpot.
        $result = $fs->add_file_to_pool(\org\bovigo\vfs\vfsStream::url('filedir/file'));

        // We provided a bad hash. Check that the file was replaced.
        $this->assertDebuggingCalled("Replacing invalid content file $contenthash");

        // Test the output.
        $this->assertEquals($contenthash, $result[0]);
        $this->assertEquals(core_text::strlen($filecontent), $result[1]);
        $this->assertFalse($result[2]);

        // Fetch the new file structure.
        $structure = \org\bovigo\vfs\vfsStream::inspect(
            new \org\bovigo\vfs\visitor\vfsStreamStructureVisitor()
        )->getStructure();

        $this->assertEquals($filecontent, $structure['filedir']['0f']['f3'][$contenthash]);
    }

    public function test_add_file_to_pool_existing_cannot_write_hashpath() {
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Make the target path readonly.
        $vfileroot->getChild('filedir/0f')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        $this->setExpectedException(
            'file_exception',
            "Can not create local file pool directories, please verify permissions in dataroot."
        );

        // Attempt to add the file to the file pool.
        $fs->add_file_to_pool($sourcefile);
    }

    public function test_add_file_to_pool_cannot_write_tmp_file() {
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash . '.tmp' => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Make the target path readonly.
        $vfileroot->getChild('filedir/0f/f3')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        $vfileroot->getChild('filedir/0f/f3/' . $contenthash . '.tmp')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        $this->setExpectedException(
            'file_exception',
            'Can not create local file pool file, please verify permissions in dataroot and available disk space.'
        );

        // Attempt to add the file to the file pool.
        $fs->add_file_to_pool($sourcefile);
    }

    public function test_add_file_to_pool_out_of_space() {
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup a quota on the vfs.
        \org\bovigo\vfs\vfsStream::setQuota(10);

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        $this->setExpectedException(
            'file_exception',
            'Can not create local file pool file, please verify permissions in dataroot and available disk space.'
        );

        // Attempt to add the file to the file pool.
        $fs->add_file_to_pool($sourcefile);
    }

    public function test_add_string_to_pool() {
        $this->resetAfterTest();
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(),
            'trashdir' => array(),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        // Note, the vfs file system does not support locks - prevent file locking here.
        $CFG->preventfilelocking = true;

        // Attempt to add the file to the file pool.
        $result = $fs->add_string_to_pool($filecontent);

        // Test the output.
        $this->assertEquals($contenthash, $result[0]);
        $this->assertEquals(core_text::strlen($filecontent), $result[1]);
        $this->assertTrue($result[2]);
    }

    public function test_add_string_to_pool_existing_cannot_write_hashpath() {
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Make the target path readonly.
        $vfileroot->getChild('filedir/0f')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        $this->setExpectedException(
            'file_exception',
            "Can not create local file pool directories, please verify permissions in dataroot."
        );

        // Attempt to add the file to the file pool.
        $fs->add_string_to_pool($filecontent);
    }

    public function test_add_string_to_pool_existing_matches() {
        $this->resetAfterTest();
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        // Note, the vfs file system does not support locks - prevent file locking here.
        $CFG->preventfilelocking = true;

        // Attempt to add the file to the file pool.
        $result = $fs->add_string_to_pool($filecontent);

        // Test the output.
        $this->assertEquals($contenthash, $result[0]);
        $this->assertEquals(core_text::strlen($filecontent), $result[1]);
        $this->assertFalse($result[2]);
    }

    public function test_add_string_to_pool_existing_mismatch() {
        $this->resetAfterTest();
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => 'different ' . $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        // Note, the vfs file system does not support locks - prevent file locking here.
        $CFG->preventfilelocking = true;

        // Attempt to add the file to the file pool.
        $result = $fs->add_string_to_pool($filecontent);

        // The file content differed - there will have been a debugging message.
        $this->assertDebuggingCalled("Replacing invalid content file {$contenthash}");

        // Test the output.
        $this->assertEquals($contenthash, $result[0]);
        $this->assertEquals(core_text::strlen($filecontent), $result[1]);
        $this->assertFalse($result[2]);
    }

    public function test_add_string_to_pool_overwrite_existing_write_tmp_file() {
        $this->resetAfterTest();
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash . '.tmp' => 'different ' . $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        // Note, the vfs file system does not support locks - prevent file locking here.
        $CFG->preventfilelocking = true;

        // Attempt to add the file to the file pool.
        $result = $fs->add_string_to_pool($filecontent);

        // Test the output.
        $this->assertEquals($contenthash, $result[0]);
        $this->assertEquals(core_text::strlen($filecontent), $result[1]);
        $this->assertTrue($result[2]);

        // Check that the new file content was copied in place and the tmpfile removed as normal.
        $this->assertEquals($filecontent, $vfileroot->getChild('filedir/0f/f3/' . $contenthash)->getContent());
        $this->assertFalse($vfileroot->hasChild('filedir/0f/f3/' . $contenthash . '.tmp'));
    }

    public function test_add_string_to_pool_cannot_write_tmp_file() {
        $this->resetAfterTest();
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash . '.tmp' => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Make the target path readonly.
        $vfileroot->getChild('filedir/0f/f3')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        $vfileroot->getChild('filedir/0f/f3/' . $contenthash . '.tmp')
            ->chmod(0444)
            ->chown(\org\bovigo\vfs\vfsStream::OWNER_USER_2);

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        // Note, the vfs file system does not support locks - prevent file locking here.
        $CFG->preventfilelocking = true;

        $this->setExpectedException(
            'file_exception',
            'Can not create local file pool file, please verify permissions in dataroot and available disk space.'
        );

        // Attempt to add the file to the file pool.
        $result = $fs->add_string_to_pool($filecontent);

        // The file content differed - there will have been a debugging message.
        $this->assertDebuggingCalled("Replacing invalid content file {$contenthash}");
    }

    public function test_add_string_to_pool_out_of_space() {
        $this->resetAfterTest();
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash . '.tmp' => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
            'sourcedir' => array(
                'file' => $filecontent,
            ),
        ));

        // Setup a quota on the vfs.
        \org\bovigo\vfs\vfsStream::setQuota(10);

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $sourcefile = \org\bovigo\vfs\vfsStream::url('root/sourcedir/file');

        // Note, the vfs file system does not support locks - prevent file locking here.
        $CFG->preventfilelocking = true;

        $this->setExpectedException(
            'file_exception',
            'Can not create local file pool file, please verify permissions in dataroot and available disk space.'
        );

        // Attempt to add the file to the file pool.
        $result = $fs->add_string_to_pool($filecontent);
    }

    public function test_deleted_file_cleanup() {
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $fs->deleted_file_cleanup($contenthash);

        $this->assertFalse($vfileroot->hasChild('filedir/0f/f3/' . $contenthash));
        $this->assertTrue($vfileroot->hasChild('trashdir/0f/f3/' . $contenthash));
    }

    public function test_deleted_file_cleanup_file_missing() {
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(),
            'trashdir' => array(),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $fs->deleted_file_cleanup($contenthash);

        $this->assertFalse($vfileroot->hasChild('filedir/0f/f3/' . $contenthash));
        // No file to move to trash, so the trash path will also be empty.
        $this->assertFalse($vfileroot->hasChild('trashdir/0f'));
        $this->assertFalse($vfileroot->hasChild('trashdir/0f/f3'));
        $this->assertFalse($vfileroot->hasChild('trashdir/0f/f3/' . $contenthash));
    }

    public function test_deleted_file_cleanup_existing_trash() {
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(
                '0f' => array(
                    'f3' => array(
                        // Use a file with the same hash but different content so that we can verify that the
                        // contentfile was not moved to the trash, but instead unlinked.
                        $contenthash => 'different ' . $filecontent,
                    ),
                ),
            ),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $fs->deleted_file_cleanup($contenthash);

        $this->assertFalse($vfileroot->hasChild('filedir/0f/f3/' . $contenthash));
        $this->assertTrue($vfileroot->hasChild('trashdir/0f/f3/' . $contenthash));
        $this->assertNotEquals($filecontent, $vfileroot->getChild('trashdir/0f/f3/' . $contenthash)->getContent());
    }

    public function test_cleanup_trash() {
        global $CFG;

        // Setup the filedir.
        $filecontent = 'example content';
        $contenthash = sha1($filecontent);
        $vfileroot = \org\bovigo\vfs\vfsStream::setup('root', null, array(
            'filedir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
            'trashdir' => array(
                '0f' => array(
                    'f3' => array(
                        $contenthash => $filecontent,
                    ),
                ),
            ),
        ));

        // Setup the $fs.
        $fs = file_system::instance(
            \org\bovigo\vfs\vfsStream::url('root/filedir'),
            \org\bovigo\vfs\vfsStream::url('root/trashdir'),
            $CFG->directorypermissions,
            $CFG->filepermissions
        );

        $fs->cleanup_trash();

        $this->assertTrue($vfileroot->hasChild('filedir/0f/f3/' . $contenthash));
        $this->assertFalse($vfileroot->hasChild('trashdir'));
        $this->assertFalse($vfileroot->hasChild('trashdir/0f'));
        $this->assertFalse($vfileroot->hasChild('trashdir/0f/f3'));
        $this->assertFalse($vfileroot->hasChild('trashdir/0f/f3/' . $contenthash));
    }

    public function contenthash_dataprovider() {
        return array(
            array(
                'contenthash'   => 'eee4943847a35a4b6942c6f96daafde06bcfdfab',
                'contentdir'    => 'ee/e4',
            ),
            array(
                'contenthash'   => 'aef05a62ae81ca0005d2569447779af062b7cda0',
                'contentdir'    => 'ae/f0',
            ),
        );
    }

    public function is_image_dataprovider() {
        return array(
            'Standard image'            => array('image/png', true),
            'Made up document/image'    => array('document/image', false),
        );
    }
}

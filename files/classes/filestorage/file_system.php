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

namespace core_files\filestorage;

/**
 * Core file system class definition.
 *
 * @package   core_files
 * @copyright 2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * File system class used for low level access to real files in filedir.
 *
 * @package   core_files
 * @category  files
 * @copyright 2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 * @since     Moodle 2.9
 */
class file_system {

    /**
     * @var file_storage The reference to the file storage instance.
     */
    protected $fs = null;

    /**
     * @var string The path to the local copy of the filedir.
     */
    protected $filedir = null;

    /**
     * @var string The path to the trashdir.
     */
    protected $trashdir = null;

    /**
     * @var int Permissions for new directories
     */
    protected $dirpermissions = null;

    /**
     * @var int Permissions for new files
     */
    protected $filepermissions = null;

    /**
     * @var file_system The filesystem singleton instance.
     */
    private static $instance;

    /**
     * Constructor.
     *
     * Please use file_system::instance() instead.
     *
     * @param string $filedir The path to the local filedir.
     * @param string $trashdir The path to the trashdir.
     * @param int $dirpermissions The directory permissions when creating new directories
     * @param int $filepermissions The file permissions when creating new files
     * @param file_storage $fs The instance of file_storage to instantiate the class with.
     */
    protected function __construct($filedir, $trashdir, $dirpermissions, $filepermissions, file_storage $fs = null) {
        $this->filedir          = $filedir;
        $this->trashdir         = $trashdir;
        $this->dirpermissions   = $dirpermissions;
        $this->filepermissions  = $filepermissions;

        // Make sure the file pool directory exists.
        if (!is_dir($this->filedir)) {
            if (!mkdir($this->filedir, $this->dirpermissions, true)) {
                // Permission trouble.
                throw new file_exception('storedfilecannotcreatefiledirs');
            }
            // Place warning file in file pool root.
            if (!file_exists($this->filedir.'/warning.txt')) {
                file_put_contents(
                    $this->filedir.'/warning.txt',
                    'This directory contains the content of uploaded files and is controlled by Moodle code. ' .
                    'Do not manually move, change or rename any of the files and subdirectories here.'
                );
                chmod($this->filedir . '/warning.txt', $filepermissions);
            }
        }

        // Make sure the trashdir directory exists too.
        if (!is_dir($this->trashdir)) {
            if (!mkdir($this->trashdir, $this->dirpermissions, true)) {
                // Permission trouble.
                throw new file_exception('storedfilecannotcreatefiledirs');
            }
        }

        if ($fs) {
            $this->fs = $fs;
        } else {
            $this->fs = get_file_storage();
        }
    }

    /**
     * Private clone method to prevent cloning of the instance.
     */
    protected function __clone() {
        return;
    }

    /**
     * Private wakeup method to prevent unserialising of the instance.
     */
    protected function __wakeup() {
        return;
    }

    /**
     * Reset the file system instance.
     */
    public static function reset() {
        get_file_storage(true);
        self::$instance = null;
    }

    /**
     * Return the file_system instance.
     *
     * @param string $filedir The path to the local filedir.
     * @param string $trashdir The path to the trashdir.
     * @param int $dirpermissions The directory permissions when creating new directories
     * @param int $filepermissions The file permissions when creating new files
     * @param file_storage $fs The instance of file_storage to instantiate the class with.
     */
    public static function instance($filedir = null, $trashdir = null, $dirpermissions = null, $filepermissions = null, file_storage $fs = null) {
        global $CFG;

        if (self::$instance === null) {
            if (empty($filedir)) {
                // If the filedir is not present, then the file_storage has not been instantiated. Set that up first.
                get_file_storage();
                return self::instance();
            }
            if (!empty($CFG->filesystem_handler_class)) {
                $class = $CFG->filesystem_handler_class;
            } else {
                $class = get_class();
            }
            self::$instance = new $class($filedir, $trashdir, $dirpermissions, $filepermissions, $fs);
        }

        return self::$instance;
    }

    /**
     * Synchronise the local filedir with any remote filedir.
     */
    public function sync_filedir() {
        return;
    }

    /**
     * Output the content of the specified stored file.
     *
     * Note, this is different to get_content() as it uses the built-in php
     * readfile function which is more efficient.
     *
     * @param stored_file $file The file to serve.
     * @return void
     */
    public function readfile(stored_file $file) {
        $this->ensure_readable($file);
        $path = $this->get_fullpath_from_storedfile($file, true);
        readfile_allow_large($path, $file->get_filesize());
    }

    /**
     * Get the full path for the stored file, including the path to the
     * filedir.
     *
     * Note: This function does not ensure that the file is present on disk.
     *
     * @param stored_file $file The file to serve.
     * @param bool $sync Whether to call sync_external_file first.
     * @return string full path to pool file with file content
     */
    protected function get_fullpath_from_storedfile(stored_file $file, $sync = false) {
        if ($sync) {
            $file->sync_external_file();
        }
        // This does not check that the file is present on disk.
        return $this->get_fullpath_from_hash($file->get_contenthash());
    }

    /**
     * Get the full directory to the stored file, including the path to the
     * filedir, and the directory which the file is actually in.
     *
     * Note: This function does not ensure that the file is present on disk.
     *
     * @param stored_file $file The file to fetch details for.
     * @return string The full path to the content directory
     */
    protected function get_fulldir_from_storedfile(stored_file $file) {
        return $this->get_fulldir_from_hash($file->get_contenthash());
    }

    /**
     * Get the full directory to the stored file, including the path to the
     * filedir, and the directory which the file is actually in.
     *
     * @param string $contenthash The content hash
     * @return string The full path to the content directory
     */
    protected function get_fulldir_from_hash($contenthash) {
        return $this->filedir . DIRECTORY_SEPARATOR . $this->get_contentdir_from_hash($contenthash);
    }

    /**
     * Get the full path for the specified hash, including the path to the filedir.
     *
     * @param string $contenthash The content hash
     * @return string The full path to the content file
     */
    protected function get_fullpath_from_hash($contenthash) {
        return $this->filedir . DIRECTORY_SEPARATOR . $this->get_contentpath_from_hash($contenthash);
    }

    /**
     * Get the content directory for the specified content hash.
     * This is the directory that the file will be in, but without the
     * fulldir.
     *
     * @param string $contenthash The content hash
     * @return string The directory within filedir
     */
    protected function get_contentdir_from_hash($contenthash) {
        $l1 = $contenthash[0] . $contenthash[1];
        $l2 = $contenthash[2] . $contenthash[3];
        return "$l1/$l2";
    }

    /**
     * Get the content path for the specified content hash within filedir.
     *
     * This does not include the filedir, and is often used by file systems
     * as the object key for storage and retrieval.
     *
     * @param string $contenthash The content hash
     * @return string The filepath within filedir
     */
    protected function get_contentpath_from_hash($contenthash) {
        return $this->get_contentdir_from_hash($contenthash) . "/$contenthash";
    }

    /**
     * Get the full directory to the stored file in the trash, including the path to the
     * trashdir, and the directory which the file is actually in.
     *
     * Note: This function does not ensure that the file is present on disk.
     *
     * @param stored_file $file The file to fetch details for.
     * @return string full path to the trash directory
     */
    protected function get_trash_fulldir_from_storedfile(stored_file $file) {
        return $this->get_trash_fulldir_from_hash($file->get_contenthash());
    }

    /**
     * Get the full directory for the specified hash in the trash, including the path to the
     * trashdir, and the directory which the file is actually in.
     *
     * @param string $contenthash The content hash
     * @return string The full path to the trash directory
     */
    protected function get_trash_fulldir_from_hash($contenthash) {
        return $this->trashdir . DIRECTORY_SEPARATOR . $this->get_contentdir_from_hash($contenthash);
    }

    /**
     * Get the full path for the specified file in the trash, including the path to the trashdir.
     *
     * @param stored_file $file The file to fetch details for.
     * @return string The full path to the trash file
     */
    protected function get_trash_fullpath_from_storedfile(stored_file $file) {
        return $this->get_trash_fullpath_from_hash($file->get_contenthash());
    }

    /**
     * Get the full path for the specified hash in the trash, including the path to the trashdir.
     *
     * @param string $contenthash The content hash
     * @return string The full path to the trash file
     */
    protected function get_trash_fullpath_from_hash($contenthash) {
        return $this->trashdir . DIRECTORY_SEPARATOR . $this->get_contentpath_from_hash($contenthash);
    }

    /**
     * Determine whether the file is present on the file system somewhere.
     *
     * @param stored_file $file The file to ensure is available.
     * @return bool
     */
    public function is_readable(stored_file $file) {
        $path = $this->get_fullpath_from_storedfile($file, true);
        if (!is_readable($path)) {
            if (!$this->try_content_recovery($file) or !is_readable($path)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Determine whether the file is present on the file system somewhere given
     * the contenthash.
     *
     * @param string $contenthash The contenthash of the file to check.
     * @return bool
     */
    public function is_readable_by_hash($contenthash) {
        $path = $this->get_fullpath_from_hash($contenthash);
        return is_readable($path);
    }

    /**
     * Ensure that the file really is available on the file system.
     * Often, we want to perform operations on the file which involve file
     * streams. In these instances the file may be elsewhere.
     *
     * Use this function only when you really do need the file to exist on
     * the local filesystem and cannot use a streamed copy instead.
     *
     * @param stored_file $file The file to ensure is available.
     * @return bool
     * @throws file_exception When the file could not be found at all.
     */
    public function ensure_readable(stored_file $file) {
        if (!$this->is_readable($file)) {
            throw new file_exception('storedfilecannotread', '', $this->get_fullpath_from_storedfile($file));
        }
        return true;
    }

    /**
     * Ensure that the file really is available on the file system.
     * Often, we want to perform operations on the file which involve file
     * streams. In these instances the file may be elsewhere.
     *
     * Use this function only when you really do need the file to exist on
     * the local filesystem and cannot use a streamed copy instead.
     *
     * @param string $contenthash The contenthash of the file to check.
     * @return bool
     * @throws file_exception When the file could not be found at all.
     */
    public function ensure_readable_by_hash($contenthash) {
        if (!$this->is_readable_by_hash($contenthash)) {
            throw new file_exception('storedfilecannotread', '', $this->get_fullpath_from_hash($contenthash));
        }
        return true;
    }

    /**
     * Copy content of file to given pathname.
     *
     * @param string $target real path to the new file
     * @param string $target The target path on disk
     * @return bool success
     */
    public function copy_content_from_storedfile(stored_file $file, $target) {
        $this->ensure_readable($file);
        $source = $this->get_fullpath_from_storedfile($file, true);
        return copy($source, $target);
    }

    /**
     * Tries to recover missing content of file from trash.
     *
     * @param stored_file $file stored_file instance
     * @return bool success
     */
    public function try_content_recovery(stored_file $file) {
        $contenthash    = $file->get_contenthash();
        $contentdir     = $this->get_fulldir_from_storedfile($file);
        $contentfile    = $this->get_fullpath_from_storedfile($file);
        $trashfile      = $this->get_trash_fullpath_from_storedfile($file);
        $alttrashfile   = $this->trashdir . DIRECTORY_SEPARATOR . $contenthash;

        if (!is_readable($trashfile)) {
            // The trash file was not found. Check the alternative trash file too just in case.
            if (!is_readable($alttrashfile)) {
                return false;
            }
            // The alternative trash file in trash root exists.
            $trashfile = $alttrashfile;
        }

        if (filesize($trashfile) != $file->get_filesize() or sha1_file($trashfile) != $contenthash) {
            // The files are different. Leave this one in trash - something seems to be wrong with it.
            return false;
        }

        if (file_exists($contentfile)) {
            // The file already exists on the file system. No need to recover.
            return true;
        }

        if (!is_dir($contentdir)) {
            if (!mkdir($contentdir, $this->dirpermissions, true)) {
                // Unable to create the target directory.
                return false;
            }
        }

        // Perform a rename - these are generally atomic which gives us big
        // performance wins, especially for large files.
        return rename($trashfile, $contentfile);
    }

    /**
     * Marks pool file as candidate for deleting.
     *
     * DO NOT call directly - reserved for core!!
     *
     * @param string $contenthash
     */
    public function deleted_file_cleanup($contenthash) {
        try {
            $this->ensure_readable_by_hash($contenthash);
        } catch (file_exception $e) {
            // The file wasn't found in the first place. Just ignore it.
            return;
        }

        $trashpath  = $this->get_trash_fulldir_from_hash($contenthash);
        $trashfile  = $this->get_trash_fullpath_from_hash($contenthash);
        $contentfile = $this->get_fullpath_from_hash($contenthash);

        if (!is_dir($trashpath)) {
            mkdir($trashpath, $this->dirpermissions, true);
        }

        if (file_exists($trashfile)) {
            // A copy of this file is already in the trash.
            // Remove the old version.
            unlink($contentfile);
            return;
        }

        // Move the contentfile to the trash, and fix permissions as required.
        rename($contentfile, $trashfile);
        chmod($trashfile, $this->filepermissions);
    }

    /**
     * Cleanup the trash directory.
     */
    public function cleanup_trash() {
        fulldelete($this->trashdir);
    }

    /**
     * Get the content of the specified stored file.
     *
     * Generally you will probably want to use readfile() to serve content,
     * and where possible you should see if you can use
     * get_content_file_handle and work with the file stream instead.
     *
     * @param stored_file $file The file to retrieve
     * @return string The full file content
     */
    public function get_content(stored_file $file) {
        $this->ensure_readable($file);
        $source = $this->get_fullpath_from_storedfile($file, true);
        return file_get_contents($source);

    }

    /**
     * List contents of archive.
     *
     * @param stored_file $file The archive to inspect
     * @param file_packer $packer file packer instance
     * @return array of file infos
     */
    public function list_files($file, file_packer $packer) {
        $this->ensure_readable($file);
        $archivefile = $this->get_fullpath_from_storedfile($file, true);
        return $packer->list_files($archivefile);
    }

    /**
     * Extract file to given file path (real OS filesystem), existing files are overwritten.
     *
     * @param stored_file $file The archive to inspect
     * @param file_packer $packer File packer instance
     * @param string $pathname Target directory
     * @param file_progress $progress progress indicator callback or null if not required
     * @return array|bool List of processed files; false if error
     */
    public function extract_to_pathname(stored_file $file, file_packer $packer, $pathname, file_progress $progress = null) {
        $archivefile = $this->get_fullpath_from_storedfile($file, true);
        return $packer->extract_to_pathname($archivefile, $pathname, null, $progress);
    }

    /**
     * Adds this file path to a curl request (POST only).
     *
     * @param stored_file $file The file to add to the curl request
     * @param curl $curlrequest The curl request object
     * @param string $key What key to use in the POST request
     * @return void
     */
    public function add_to_curl_request(stored_file $file, &$curlrequest, $key) {
        $path = $this->get_fullpath_from_storedfile($file, true);
        if (function_exists('curl_file_create')) {
            // As of PHP 5.5, the usage of the @filename API for file uploading is deprecated.
            $value = curl_file_create($path);
        } else {
            $value = '@' . $path;
        }
        $curlrequest->_tmp_file_post_params[$key] = $value;
    }

    /**
     * Extract file to given file path (real OS filesystem), existing files are overwritten.
     *
     * @param stored_file $file The archive to inspect
     * @param file_packer $packer file packer instance
     * @param int $contextid context ID
     * @param string $component component
     * @param string $filearea file area
     * @param int $itemid item ID
     * @param string $pathbase path base
     * @param int $userid user ID
     * @param file_progress $progress Progress indicator callback or null if not required
     * @return array|bool list of processed files; false if error
     */
    public function extract_to_storage(stored_file $file, file_packer $packer, $contextid,
            $component, $filearea, $itemid, $pathbase, $userid = null, file_progress $progress = null) {

        // The extract_to_storage function needs the file to exist on disk.
        $this->ensure_readable($file);
        $archivefile = $this->get_fullpath_from_storedfile($file, true);
        return $packer->extract_to_storage($archivefile, $contextid,
                $component, $filearea, $itemid, $pathbase, $userid, $progress);
    }

    /**
     * Add file/directory into archive.
     *
     * @param stored_file $file The file to archive
     * @param file_archive $filearch file archive instance
     * @param string $archivepath pathname in archive
     * @return bool success
     */
    public function archive_file(stored_file $file, file_archive $filearch, $archivepath) {
        if ($file->is_directory()) {
            return $filearch->add_directory($archivepath);
        } else {
            $this->ensure_readable($file);
            return $filearch->add_file_from_pathname($archivepath, $this->get_fullpath_from_storedfile($file, true));
        }
    }

    /**
     * Returns information about image.
     * Information is determined from the file content
     *
     * @param stored_file $file The file to inspect
     * @return mixed array with width, height and mimetype; false if not an image
     */
    public function get_imageinfo(stored_file $file) {
        if (!$this->is_image($file)) {
            return false;
        }

        $this->ensure_readable($file);
        $path = $this->get_fullpath_from_storedfile($file, true);

        return $this->get_imageinfo_from_path($path);
    }

    /**
     * Attempt to determine whether the specified file is likely to be an
     * image.
     * Since this relies upon the mimetype stored in the files table, there
     * may be times when this information is not 100% accurate.
     *
     * @param stored_file $file The file to check
     * @return bool
     */
    public function is_image(stored_file $file) {
        if (!$file->get_filesize()) {
            // An empty file cannot be an image.
            return false;
        }

        $mimetype = $file->get_mimetype();
        if (!preg_match('|^image/|', $mimetype)) {
            // The mimetype does not include image.
            return false;
        }

        // If it looks like an image, and it smells like an image, perhaps it's an image!
        return true;
    }

    /**
     * Returns image information relating to the specified path or URL.
     *
     * @param string $path The path to pass to getimagesize.
     * @return array Containing width, height, and mimetype.
     */
    protected function get_imageinfo_from_path($path) {
        $imageinfo = getimagesize($path);

        $image = array(
                'width'     => $imageinfo[0],
                'height'    => $imageinfo[1],
                'mimetype'  => image_type_to_mime_type($imageinfo[2]),
            );
        if (empty($image['width']) or empty($image['height']) or empty($image['mimetype'])) {
            // GD can not parse it, sorry.
            return false;
        }
        return $image;
    }

    /**
     * Returns file handle - read only mode, no writing allowed into pool files!
     *
     * When you want to modify a file, create a new file and delete the old one.
     *
     * @param stored_file $file The file to retrieve a handle for
     * @param int $type Type of file handle (FILE_HANDLE_xx constant)
     * @return resource file handle
     */
    public function get_content_file_handle($file, $type = stored_file::FILE_HANDLE_FOPEN) {
        $this->ensure_readable($file);
        $path = $this->get_fullpath_from_storedfile($file, true);
        return self::get_file_handle_for_path($path, $type);
    }

    /**
     * Return a file handle for the specified path.
     *
     * This abstraction should be used when overriding get_content_file_handle in a new file system.
     *
     * @param string $path The path to the file. This shoudl be any type of path that fopen and gzopen accept.
     * @param int $type Type of file handle (FILE_HANDLE_xx constant)
     * @return resource
     * @throws coding_exception When an unexpected type of file handle is requested
     */
    protected static function get_file_handle_for_path($path, $type = stored_file::FILE_HANDLE_FOPEN) {
        switch ($type) {
            case stored_file::FILE_HANDLE_FOPEN:
                // Binary reading.
                return fopen($path, 'rb');
                break;
            case stored_file::FILE_HANDLE_GZOPEN:
                // Binary reading of file in gz format.
                return gzopen($path, 'rb');
                break;
            default:
                throw new \coding_exception('Unexpected file handle type');
                break;
        }
    }

    /**
     * Return mimetype by given file pathname.
     *
     * If file has a known extension, we return the mimetype based on extension.
     * Otherwise (when possible) we try to get the mimetype from file contents.
     *
     * @param string $fullpath Full path to the file on disk
     * @param string $filename Correct file name with extension, if omitted will be taken from $path
     * @return string
     */
    public static function mimetype($fullpath, $filename = null) {
        if (empty($filename)) {
            $filename = $fullpath;
        }

        // The mimeinfo function determines the mimetype purely based on the file extension.
        $type = mimeinfo('type', $filename);

        if ($type === 'document/unknown') {
            // The type is unknown. Inspect the file now.
            $type = self::mimetype_from_path($fullpath);
        }
        return $type;
    }

    /**
     * Inspect a file on disk for it's mimetype.
     *
     * @param string $fullpath Path to file on disk
     * @param string $default The default mimetype to use if the file was not found.
     * @return string The mimetype
     */
    public static function mimetype_from_path($fullpath, $default = 'document/unknown') {
        $type = $default;

        if (file_exists($fullpath) && class_exists('finfo')) {
            // The type is unknown. Attempt to look up the file type now.
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            return mimeinfo_from_type('type', $finfo->file($fullpath));
        }

        return 'document/unknown';
    }

    /**
     * Inspect a file on disk for it's mimetype.
     *
     * @param string $contenthash The content hash of the file to query
     * @param string $default The default mimetype to use if the file was not found.
     * @return string The mimetype
     */
    public function mimetype_from_hash($contenthash, $filename) {
        $fullpath = $this->get_fullpath_from_hash($contenthash);
        return self::mimetype($fullpath, $filename);
    }

    /**
     * Retrieve the mime information for the specified stored file.
     *
     * @param stored_file $file The stored file to retrieve mime information for
     * @return string The MIME type.
     */
    public function mimetype_from_storedfile(stored_file $file) {
        $pathname = $this->get_fullpath_from_storedfile($file);
        $mimetype = self::mimetype($pathname, $file->get_filename());

        if (!$this->is_readable($file) && $mimetype === 'document/unknown') {
            // The type is unknown, but the full checks weren't completed because the file isn't locally available.
            // Ensure we have a local copy and try again.
            $this->ensure_readable($file);

            $mimetype = self::mimetype_from_path($pathname);
        }

        return $mimetype;
    }

    /**
     * Serve file content using X-Sendfile header.
     * Please make sure that all headers are already sent and the all
     * access control checks passed.
     *
     * @param string $contenthash The content hash of the file to be served
     * @return bool success
     */
    public function xsendfile($contenthash) {
        global $CFG;
        require_once($CFG->libdir . "/xsendfilelib.php");

        return xsendfile($this->get_fullpath_from_hash($contenthash));
    }

    /**
     * Add file content to sha1 pool.
     *
     * @param string $pathname Path to file currently on disk
     * @param string $contenthash SHA1 hash of content if known (performance only)
     * @return array (contenthash, filesize, newfile)
     */
    public function add_file_to_pool($pathname, $contenthash = null) {
        global $CFG;

        if (!is_readable($pathname)) {
            throw new file_exception('storedfilecannotread', '', $pathname);
        }

        $filesize = filesize($pathname);
        if ($filesize === false) {
            throw new file_exception('storedfilecannotread', '', $pathname);
        }

        if (is_null($contenthash)) {
            $contenthash = sha1_file($pathname);
        } else if ($CFG->debugdeveloper) {
            $filehash = sha1_file($pathname);
            if ($filehash === false) {
                throw new file_exception('storedfilecannotread', '', $pathname);
            }
            if ($filehash !== $contenthash) {
                // Hopefully this never happens, if yes we need to fix calling code.
                debugging("Invalid contenthash submitted for file $pathname", DEBUG_DEVELOPER);
                $contenthash = $filehash;
            }
        }
        if ($contenthash === false) {
            throw new file_exception('storedfilecannotread', '', $pathname);
        }

        if ($filesize > 0 and $contenthash === sha1('')) {
            // Did the file change or is sha1_file() borked for this file?
            clearstatcache();
            $contenthash = sha1_file($pathname);
            $filesize = filesize($pathname);

            if ($contenthash === false or $filesize === false) {
                throw new file_exception('storedfilecannotread', '', $pathname);
            }
            if ($filesize > 0 and $contenthash === sha1('')) {
                // This is very weird...
                throw new file_exception('storedfilecannotread', '', $pathname);
            }
        }

        $hashpath = $this->get_fulldir_from_hash($contenthash);
        $hashfile = $this->get_fullpath_from_hash($contenthash);

        $newfile = true;

        if (file_exists($hashfile)) {
            if (filesize($hashfile) === $filesize) {
                return array($contenthash, $filesize, false);
            }
            if (sha1_file($hashfile) === $contenthash) {
                // Jackpot! We have a sha1 collision.
                mkdir("$this->filedir/jackpot/", $this->dirpermissions, true);
                copy($hashfile, "$this->filedir/jackpot/{$contenthash}_1");
                copy($pathname, "$this->filedir/jackpot/{$contenthash}_2");
                throw new file_pool_content_exception($contenthash);
            }
            debugging("Replacing invalid content file $contenthash");
            unlink($hashfile);
            $newfile = false;
        }

        if (!is_dir($hashpath)) {
            if (!mkdir($hashpath, $this->dirpermissions, true)) {
                // Permission trouble.
                throw new file_exception('storedfilecannotcreatefiledirs');
            }
        }

        // Let's try to prevent some race conditions.

        $prev = ignore_user_abort(true);
        @unlink($hashfile.'.tmp');
        // Note: We must supress errors from copy here, otherwise we end up with a fatal exception which can't be caught
        // by the calling code and handled properly.
        if (!@copy($pathname, $hashfile.'.tmp')) {
            // Borked permissions or out of disk space.
            ignore_user_abort($prev);
            throw new file_exception('storedfilecannotcreatefile');
        }
        if (filesize($hashfile.'.tmp') !== $filesize) {
            // Out of disk space check.
            // This should not happen - the call to copy should fail instead.
            unlink($hashfile.'.tmp');
            ignore_user_abort($prev);
            throw new file_exception('storedfilecannotcreatefile');
        }
        rename($hashfile.'.tmp', $hashfile);
        chmod($hashfile, $this->filepermissions); // Fix permissions if needed.
        @unlink($hashfile.'.tmp'); // Just in case anything fails in a weird way.
        ignore_user_abort($prev);

        return array($contenthash, $filesize, $newfile);
    }

    /**
     * Add string content to sha1 pool.
     *
     * @param string $content file content - binary string
     * @return array (contenthash, filesize, newfile)
     */
    public function add_string_to_pool($content) {
        global $CFG;

        $contenthash = sha1($content);
        // Binary length of content.
        $filesize = strlen($content);

        $hashpath = $this->get_fulldir_from_hash($contenthash);
        $hashfile = "$hashpath/$contenthash";

        $newfile = true;

        if (file_exists($hashfile)) {
            if (filesize($hashfile) === $filesize) {
                return array($contenthash, $filesize, false);
            }
            if (sha1_file($hashfile) === $contenthash) {
                // Jackpot! We have a sha1 collision.
                mkdir("$this->filedir/jackpot/", $this->dirpermissions, true);
                copy($hashfile, "$this->filedir/jackpot/{$contenthash}_1");
                file_put_contents("$this->filedir/jackpot/{$contenthash}_2", $content);
                throw new file_pool_content_exception($contenthash);
            }
            debugging("Replacing invalid content file $contenthash");
            unlink($hashfile);
            $newfile = false;
        }

        if (!is_dir($hashpath)) {
            if (!mkdir($hashpath, $this->dirpermissions, true)) {
                // Permission trouble.
                throw new file_exception('storedfilecannotcreatefiledirs');
            }
        }

        // Hopefully this works around most potential race conditions.

        $prev = ignore_user_abort(true);

        // Note: We must supress errors from file_put_contents here, otherwise we end up with a fatal exception which
        // can't be caught by the calling code and handled properly.
        if (!empty($CFG->preventfilelocking)) {
            $newsize = @file_put_contents($hashfile.'.tmp', $content);
        } else {
            $newsize = @file_put_contents($hashfile.'.tmp', $content, LOCK_EX);
        }

        if ($newsize === false) {
            // Borked permissions most likely.
            ignore_user_abort($prev);
            throw new file_exception('storedfilecannotcreatefile');
        }
        if (filesize($hashfile.'.tmp') !== $filesize) {
            // Out of disk space check.
            // This should never get called - the call to file_put_contents should fail instead.
            unlink($hashfile.'.tmp');
            ignore_user_abort($prev);
            throw new file_exception('storedfilecannotcreatefile');
        }
        rename($hashfile.'.tmp', $hashfile);
        chmod($hashfile, $this->filepermissions); // Fix permissions if needed.
        @unlink($hashfile.'.tmp'); // Just in case anything fails in a weird way.
        ignore_user_abort($prev);

        return array($contenthash, $filesize, $newfile);
    }

}

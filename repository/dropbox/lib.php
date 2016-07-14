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
 * This plugin is used to access user's dropbox files
 *
 * @since Moodle 2.0
 * @package    repository_dropbox
 * @copyright  2012 Marina Glancy
 * @copyright  2010 Dongsheng Cai {@link http://dongsheng.org}
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
require_once($CFG->dirroot . '/repository/lib.php');

/**
 * Repository to access Dropbox files
 *
 * @package    repository_dropbox
 * @copyright  2010 Dongsheng Cai
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class repository_dropbox extends repository {
    /** @var dropbox the instance of dropbox client */
    private $dropbox;

    /** @var int maximum size of file to cache in moodle filepool */
    public $cachelimit=null;

    /**
     * Constructor of dropbox plugin
     *
     * @param int $repositoryid
     * @param stdClass $context
     * @param array $options
     */
    public function __construct($repositoryid, $context = SYSCONTEXTID, $options = array()) {
        $options['page']    = optional_param('p', 1, PARAM_INT);
        parent::__construct($repositoryid, $context, $options);

        $this->setting = 'dropbox_';

        $returnurl = new moodle_url('/repository/repository_callback.php', [
                'callback'  => 'yes',
                'repo_id'   => $repositoryid,
                'sesskey'   => sesskey(),
            ]);

        // Check whether the current user has an authentication token.
        if (isset($options['authentication_token'])) {
            $token = $options['authentication_token'];
        } else {
            $token = get_user_preferences($this->setting . 'authentication_token', '');
        }

        if (empty($token) || !$token = unserialize($token)) {
            $token = null;
        }

        // Create the dropbox API instance.
        $this->dropbox = new repository_dropbox\dropbox(
                $this->get_option('dropbox_key'),
                $this->get_option('dropbox_secret'),
                $returnurl,
                $token
            );
    }

    /**
     * Set authentication token.
     *
     * @param string $token
     */
    public function set_authentication_token($token) {
        set_user_preference($this->setting . 'authentication_token', serialize($token));
    }


    /**
     * Check if moodle has got access token and secret
     *
     * @return bool
     */
    public function check_login() {
        return $this->dropbox->is_logged_in();
    }

    /**
     * Generate dropbox login url
     *
     * @return array
     */
    public function print_login() {
        $url = $this->dropbox->get_login_url();
        if ($this->options['ajax']) {
            $ret = array();
            $popup_btn = new stdClass();
            $popup_btn->type = 'popup';
            $popup_btn->url = $url->out(false);
            $ret['login'] = array($popup_btn);
            return $ret;
        } else {
            echo html_writer::link($url, get_string('login', 'repository'), array('target' => '_blank'));
        }
    }

    /**
     * Request access token
     *
     * @return array
     */
    public function callback() {
        if ($this->dropbox->is_logged_in()) {
            $this->set_authentication_token($this->dropbox->get_authentication_token_for_storage());
        }
    }

    /**
     * Get dropbox files
     *
     * @param string $path
     * @param int $page
     * @return array
     */
    public function get_listing($path = '', $page = '1') {
        global $OUTPUT;
        if (empty($path) || $path == '/') {
            $path = '';
        } else {
            $path = file_correct_filepath($path);
        }
        $encodedpath = str_replace("%2F", "/", rawurlencode($path));

        $list = array();
        $list['list'] = array();
        $list['manage'] = 'https://www.dropbox.com/home';
        $list['dynload'] = true;
        $list['nosearch'] = true;
        $list['logouturl'] = 'https://www.dropbox.com/logout';
        $list['message'] = get_string('logoutdesc', 'repository_dropbox');
        // process breadcrumb trail
        $list['path'] = array(
            array('name'=>get_string('dropbox', 'repository_dropbox'), 'path' => '/')
        );

        $result = $this->dropbox->get_listing($encodedpath);

        if (!is_object($result) || empty($result)) {
            return $list;
        }

        if (empty($result->entries) or !is_array($result->entries)) {
            return $list;
        }

        $dirslist = array();
        $fileslist = array();
        foreach ($result->entries as $entry) {
            if ($entry->{".tag"} === "folder") {
                $dirslist[] = array(
                    'title' => $entry->name,
                    'path'  => file_correct_filepath($entry->path_lower),
                    'thumbnail' => $OUTPUT->pix_url(file_folder_icon(64))->out(false),
                    'thumbnail_height' => 64,
                    'thumbnail_width' => 64,
                    'children' => array(),
                );
            } else if ($entry->{".tag"} === "file") {
                $fileslist[] = array(
                    'title'     => $entry->name,
                    'source'    => $entry->path_lower,
                    'size'      => $entry->size,
                    'date'      => strtotime($entry->client_modified),
                    'thumbnail' => $OUTPUT->pix_url(file_extension_icon($entry->path_lower, 64))->out(false),
                    'realthumbnail'     => $this->get_thumbnail_url($entry),
                    'thumbnail_height'  => 64,
                    'thumbnail_width'   => 64,
                );
            }
        }

        $fileslist = array_filter($fileslist, array($this, 'filter'));
        $list['list'] = array_merge($dirslist, array_values($fileslist));
        return $list;
    }

    /**
     * Grab the thumbnail URL for the specified entry.
     *
     * @param   object      $entry      The file entry as retrieved from the API
     * @return  moodle_url
     */
    protected function get_thumbnail_url($entry) {
        if ($this->dropbox->supports_thumbnail($entry)) {
            $thumburl = new moodle_url('/repository/dropbox/thumbnail.php', [
                // The id field in dropbox is unique - no need to specify a revision.
                'source'    => $entry->id,
                'path'      => $entry->path_lower,

                'repo_id'   => $this->id,
                'ctx_id'    => $this->context->id,
            ]);
            return $thumburl->out(false);
        }

        return '';
    }

    /**
     * Displays a thumbnail for current user's dropbox file
     *
     * @param string $string
     */
    public function send_thumbnail($id) {
        $content = $this->dropbox->get_thumbnail($id);

        // set 30 days lifetime for the image. If the image is changed in dropbox it will have
        // different revision number and URL will be different. It is completely safe
        // to cache thumbnail in the browser for a long time
        send_file($content, basename($id), 30*24*60*60, 0, true);
    }

    /**
     * Logout from dropbox
     *
     * @return array
     */
    public function logout() {
        $this->set_authentication_token('');

        return $this->print_login();
    }

    /**
     * Set dropbox option.
     *
     * @param array $options
     * @return mixed
     */
    public function set_option($options = array()) {
        if (!empty($options['dropbox_key'])) {
            set_config('dropbox_key', trim($options['dropbox_key']), 'dropbox');
        }
        if (!empty($options['dropbox_secret'])) {
            set_config('dropbox_secret', trim($options['dropbox_secret']), 'dropbox');
        }
        if (!empty($options['dropbox_cachelimit'])) {
            $this->cachelimit = (int)trim($options['dropbox_cachelimit']);
            set_config('dropbox_cachelimit', $this->cachelimit, 'dropbox');
        }
        unset($options['dropbox_key']);
        unset($options['dropbox_secret']);
        unset($options['dropbox_cachelimit']);

        $ret = parent::set_option($options);
        return $ret;
    }

    /**
     * Get dropbox options
     * @param string $config
     * @return mixed
     */
    public function get_option($config = '') {
        if ($config==='dropbox_key') {
            return trim(get_config('dropbox', 'dropbox_key'));
        } elseif ($config==='dropbox_secret') {
            return trim(get_config('dropbox', 'dropbox_secret'));
        } elseif ($config==='dropbox_cachelimit') {
            return $this->max_cache_bytes();
        } else {
            $options = parent::get_option();
            $options['dropbox_key'] = trim(get_config('dropbox', 'dropbox_key'));
            $options['dropbox_secret'] = trim(get_config('dropbox', 'dropbox_secret'));
            $options['dropbox_cachelimit'] = $this->max_cache_bytes();
        }
        return $options;
    }

    /**
     * Fixes references in DB that contains user credentials
     *
     * @param string $reference contents of DB field files_reference.reference
     */
    protected function fix_old_style_reference($packed) {
        $ref = unserialize($packed);
        $ref = $this->dropbox->get_file_share_info($ref->path);
        if (!$ref || empty($ref->url)) {
            // Some error occurred, do not fix reference for now.
            return $packed;
        }

        $newreference = serialize($ref);
        if ($newreference !== $packed) {
            // we need to update references in the database
            global $DB;
            $params = array(
                'newreference' => $newreference,
                'newhash' => sha1($newreference),
                'reference' => $packed,
                'hash' => sha1($packed),
                'repoid' => $this->id
            );
            $refid = $DB->get_field_sql('SELECT id FROM {files_reference}
                WHERE reference = :reference AND referencehash = :hash
                AND repositoryid = :repoid', $params);
            if (!$refid) {
                return $newreference;
            }

            $existingrefid = $DB->get_field_sql('SELECT id FROM {files_reference}
                    WHERE reference = :newreference AND referencehash = :newhash
                    AND repositoryid = :repoid', $params);
            if ($existingrefid) {
                // the same reference already exists, we unlink all files from it,
                // link them to the current reference and remove the old one
                $DB->execute('UPDATE {files} SET referencefileid = :refid
                    WHERE referencefileid = :existingrefid',
                    array('refid' => $refid, 'existingrefid' => $existingrefid));
                $DB->delete_records('files_reference', array('id' => $existingrefid));
            }
            // update the reference
            $params['refid'] = $refid;
            $DB->execute('UPDATE {files_reference}
                SET reference = :newreference, referencehash = :newhash
                WHERE id = :refid', $params);
        }
        return $newreference;
    }

    /**
     * Unpack the supplied serialized reference, fixing it if required.
     *
     * @param   string  $packed The packed reference
     * @return  object  The unpacked reference
     */
    protected function unpack_reference($packed) {
        $reference = unserialize($packed);
        if (empty($reference->size) || empty($reference->url)) {
            // The reference is missing some information. Update it.
            return unserialize($this->fix_old_style_reference($packed));
        }

        return $reference;
    }

    /**
     * Converts a URL received from dropbox API function 'shares' into URL that
     * can be used to download/access file directly
     *
     * @param string $sharedurl
     * @return string
     */
    protected function get_file_download_link($sharedurl) {
        $url = new moodle_url($sharedurl);
        $url->param('dl', 1);

        return $url->out(false);
    }

    /**
     * Downloads a file from external repository and saves it in temp dir
     *
     * @throws moodle_exception when file could not be downloaded
     *
     * @param string $packged the content of files.reference field or result of
     * function {@link repository_dropbox::get_file_reference()}
     * @param string $saveas filename (without path) to save the downloaded file in the
     * temporary directory, if omitted or file already exists the new filename will be generated
     * @return array with elements:
     *   path: internal location of the file
     */
    public function get_file($packed, $saveas = '') {
        $reference = $this->unpack_reference($packed);

        $saveas = $this->prepare_file($saveas);
        $content = $this->dropbox->get_file($reference->path);
        file_put_contents($saveas, $content);

        return ['path' => $saveas];
    }
    /**
     * Add Plugin settings input to Moodle form
     *
     * @param moodleform $mform Moodle form (passed by reference)
     * @param string $classname repository class name
     */
    public static function type_config_form($mform, $classname = 'repository') {
        parent::type_config_form($mform);
        $key    = get_config('dropbox', 'dropbox_key');
        $secret = get_config('dropbox', 'dropbox_secret');

        if (empty($key)) {
            $key = '';
        }
        if (empty($secret)) {
            $secret = '';
        }

        $strrequired = get_string('required');

        $mform->addElement('text', 'dropbox_key', get_string('apikey', 'repository_dropbox'), [
                'value' => $key,
                'size' => '40',
            ]);
        $mform->setType('dropbox_key', PARAM_RAW_TRIMMED);
        $mform->addElement('text', 'dropbox_secret', get_string('secret', 'repository_dropbox'), [
                'value' => $secret,
                'size' => '40',
            ]);

        $mform->addRule('dropbox_key', $strrequired, 'required', null, 'client');
        $mform->addRule('dropbox_secret', $strrequired, 'required', null, 'client');
        $mform->setType('dropbox_secret', PARAM_RAW_TRIMMED);
        $mform->addElement('static', null, '',  get_string('instruction', 'repository_dropbox'));

        $mform->addElement('text', 'dropbox_cachelimit', get_string('cachelimit', 'repository_dropbox'), ['size' => '40']);
        $mform->addRule('dropbox_cachelimit', null, 'numeric', null, 'client');
        $mform->setType('dropbox_cachelimit', PARAM_INT);
        $mform->addElement('static', 'dropbox_cachelimit_info', '',  get_string('cachelimit_info', 'repository_dropbox'));
    }

    /**
     * Option names of dropbox plugin
     *
     * @return array
     */
    public static function get_type_option_names() {
        return array('dropbox_key', 'dropbox_secret', 'pluginname', 'dropbox_cachelimit');
    }

    /**
     * Dropbox plugin supports all kinds of files
     *
     * @return array
     */
    public function supported_filetypes() {
        return '*';
    }

    /**
     * User cannot use the external link to dropbox
     *
     * @return int
     */
    public function supported_returntypes() {
        return FILE_INTERNAL | FILE_REFERENCE | FILE_EXTERNAL;
    }

    /**
     * Return file URL for external link.
     *
     * @param string $reference the result of get_file_reference()
     * @return string
     */
    public function get_link($packed) {
        $reference = $this->unpack_reference($packed);

        return $this->get_file_download_link($reference->url);
    }

    /**
     * Prepare file reference information
     *
     * @param string $path
     * @return string file referece
     */
    public function get_file_reference($path) {
        global $USER;
        $reference = new stdClass;
        $reference->userid = $USER->id;
        $reference->username = fullname($USER);
        $reference->path = $path;

        // Determine whether we are downloading the file, or should use a file reference.
        $usefilereference = optional_param('usefilereference', false, PARAM_BOOL);
        if ($usefilereference) {
            if ($data = $this->dropbox->get_file_share_info($path)) {
                $reference = (object) array_merge((array) $data, (array) $reference);
            }
        }

        return serialize($reference);
    }

    /**
     * Performs synchronisation of an external file if the previous one has expired.
     *
     * Referenced files may optionally keep their content in Moodle filepool (for
     * thumbnail generation or to be able to serve cached copy). In this
     * case both contenthash and filesize need to be synchronized. Otherwise repositories
     * should use contenthash of empty file and correct filesize in bytes.
     *
     * Note that this function may be run for EACH file that needs to be synchronised at the
     * moment. If anything is being downloaded or requested from external sources there
     * should be a small timeout. The synchronisation is performed to update the size of
     * the file and/or to update image and re-generated image preview. There is nothing
     * fatal if syncronisation fails but it is fatal if syncronisation takes too long
     * and hangs the script generating a page.
     *
     * Note: If you wish to call $file->get_filesize(), $file->get_contenthash() or
     * $file->get_timemodified() make sure that recursion does not happen.
     *
     * Called from {@link stored_file::sync_external_file()}
     *
     * @param   stored_file     $file       The stored file to synchronise.
     * @return  bool                        Whether the file was synchronised.
     */
    public function sync_reference(stored_file $file) {
        global $CFG;

        if ($file->get_referencelastsync() + DAYSECS > time()) {
            // Only synchronise once per day
            return false;
        }

        $reference = $this->unpack_reference($file->get_reference());
        if (!isset($reference->url)) {
            // The URL to sync with is missing.
            return false;
        }

        $c = new curl;
        $url = $this->get_file_download_link($reference->url);
        if (file_extension_in_typegroup($reference->path, 'web_image')) {
            $saveas = $this->prepare_file('');
            try {
                $result = $c->download_one($url, array(), array('filepath' => $saveas, 'timeout' => $CFG->repositorysyncimagetimeout, 'followlocation' => true));
                $info = $c->get_info();
                if ($result === true && isset($info['http_code']) && $info['http_code'] == 200) {
                    $fs = get_file_storage();
                    list($contenthash, $filesize, ) = $fs->add_file_to_pool($saveas);
                    $file->set_synchronized($contenthash, $filesize);
                    return true;
                }
            } catch (Exception $e) {}
        }

        $c->get($url, null, array('timeout' => $CFG->repositorysyncimagetimeout, 'followlocation' => true, 'nobody' => true));
        $info = $c->get_info();
        if (isset($info['http_code']) && $info['http_code'] == 200 &&
                array_key_exists('download_content_length', $info) &&
                $info['download_content_length'] >= 0) {
            $filesize = (int)$info['download_content_length'];
            $file->set_synchronized(null, $filesize);
            return true;
        }
        $file->set_missingsource();
        return true;
    }

    /**
     * Cache file from external repository by reference
     *
     * Dropbox repository regularly caches all external files that are smaller than
     * {@link repository_dropbox::max_cache_bytes()}
     *
     * @param string $reference this reference is generated by
     *                          repository::get_file_reference()
     * @param stored_file $storedfile created file reference
     */
    public function cache_file_by_reference($reference, $storedfile) {
        try {
            $this->import_external_file_contents($storedfile, $this->max_cache_bytes());
        } catch (Exception $e) {}
    }

    /**
     * Return human readable reference information
     * {@link stored_file::get_reference()}
     *
     * @param string $reference
     * @param int $filestatus status of the file, 0 - ok, 666 - source missing
     * @return string
     */
    public function get_reference_details($reference, $filestatus = 0) {
        global $USER;
        $ref  = unserialize($reference);
        $detailsprefix = $this->get_name();
        if (isset($ref->userid) && $ref->userid != $USER->id && isset($ref->username)) {
            $detailsprefix .= ' ('.$ref->username.')';
        }
        $details = $detailsprefix;
        if (isset($ref->path)) {
            $details .= ': '. $ref->path;
        }
        if (isset($ref->path) && !$filestatus) {
            // Indicate this is from dropbox with path
            return $details;
        } else {
            if (isset($ref->url)) {
                $details = $detailsprefix. ': '. $ref->url;
            }
            return get_string('lostsource', 'repository', $details);
        }
    }

    /**
     * Return the source information
     *
     * @param string $source
     * @return string
     */
    public function get_file_source_info($source) {
        global $USER;
        return 'Dropbox ('.fullname($USER).'): ' . $source;
    }

    /**
     * Returns the maximum size of the Dropbox files to cache in moodle
     *
     * Note that {@link repository_dropbox::sync_reference()} will try to cache images even
     * when they are bigger in order to generate thumbnails. However there is
     * a small timeout for downloading images for synchronisation and it will
     * probably fail if the image is too big.
     *
     * @return int
     */
    public function max_cache_bytes() {
        if ($this->cachelimit === null) {
            $this->cachelimit = (int) get_config('dropbox', 'dropbox_cachelimit');
        }
        return $this->cachelimit;
    }

    /**
     * Repository method to serve the referenced file
     *
     * This method is ivoked from {@link send_stored_file()}.
     * Dropbox repository first caches the file by reading it into temporary folder and then
     * serves from there.
     *
     * @param stored_file $storedfile the file that contains the reference
     * @param int $lifetime Number of seconds before the file should expire from caches (null means $CFG->filelifetime)
     * @param int $filter 0 (default)=no filtering, 1=all files, 2=html files only
     * @param bool $forcedownload If true (default false), forces download of file rather than view in browser/plugin
     * @param array $options additional options affecting the file serving
     */
    public function send_file($storedfile, $lifetime=null , $filter=0, $forcedownload=false, array $options = null) {
        $reference = $this->unpack_reference($storedfile->get_reference());

        if (!empty($this->max_cache_bytes()) && $reference->size > $this->max_cache_bytes()) {
            \core\session\manager::write_close();
            header('Location: ' . $this->get_file_download_link($reference->url));
            die;
        }

        try {
            $this->import_external_file_contents($storedfile, $this->max_cache_bytes());
            if (!is_array($options)) {
                $options = array();
            }
            $options['sendcachedexternalfile'] = true;
            \core\session\manager::write_close();
            send_stored_file($storedfile, $lifetime, $filter, $forcedownload, $options);
        } catch (moodle_exception $e) {
            // Redirect to Dropbox, it will show the error.
            // Note: We redirect to Dropbox shared link, not to the download link here!
            \core\session\manager::write_close();
            header('Location: ' . $reference->url);
            die;
        }
    }

    /**
     * Caches all references to Dropbox files in moodle filepool
     *
     * Invoked by {@link repository_dropbox_cron()}. Only files smaller than
     * {@link repository_dropbox::max_cache_bytes()} and only files which
     * synchronisation timeout have not expired are cached.
     */
    public function cron() {
        $fs = get_file_storage();
        $files = $fs->get_external_files($this->id);
        foreach ($files as $file) {
            try {
                // This call will cache all files that are smaller than max_cache_bytes()
                // and synchronise file size of all others
                $this->import_external_file_contents($file, $this->max_cache_bytes());
            } catch (moodle_exception $e) {}
        }
    }
}

/**
 * Dropbox plugin cron task
 */
function repository_dropbox_cron() {
    $instances = repository::get_instances(array('type'=>'dropbox'));
    foreach ($instances as $instance) {
        $instance->cron();
    }
}

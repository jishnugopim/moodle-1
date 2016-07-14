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
 * Dropbox V2 API.
 *
 * @since       Moodle 3.2
 * @package     repository_dropbox
 * @copyright   Andrew Nicols <andrew@nicols.co.uk>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace repository_dropbox;

defined('MOODLE_INTERNAL') || die();

require_once($CFG->libdir.'/oauthlib.php');

/**
 * Dropbox V2 API.
 *
 * @package     repository_dropbox
 * @copyright   Andrew Nicols <andrew@nicols.co.uk>
 * @license     http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class dropbox extends \oauth2_client {

    /**
     * Create the DropBox API Client.
     *
     * @param   string      $key        The API key
     * @param   string      $secret     The API secret
     * @param   string      $callback   The callback URL
     * @param   string      $usertoken  The user token
     */
    public function __construct($key, $secret, $callback, \stdClass $usertoken = null) {
        parent::__construct($key, $secret, $callback, '');

        $this->store_token(null);
        if (!empty($usertoken)) {
            $this->store_token($usertoken);
        }
    }

    /**
     * Returns the auth url for OAuth 2.0 request.
     *
     * @return string the auth url
     */
    protected function auth_url() {
        return 'https://www.dropbox.com/oauth2/authorize';
    }

    /**
     * Returns the token url for OAuth 2.0 request.
     *
     * @return string the auth url
     */
    protected function token_url() {
        return 'https://api.dropboxapi.com/oauth2/token';
    }

    /**
     * Return the constructed API endpoint URL.
     *
     * @param   string      $endpoint   The endpoint to be contacted
     * @return  moodle_url              The constructed API URL
     */
    protected function get_api_endpoint($endpoint) {
        return new \moodle_url('https://api.dropboxapi.com/2/' . $endpoint);
    }

    /**
     * Return the constructed content endpoint URL.
     *
     * @param   string      $endpoint   The endpoint to be contacted
     * @return  moodle_url              The constructed content URL
     */
    protected function get_content_endpoint($endpoint) {
        return new \moodle_url('https://api-content.dropbox.com/2/' . $endpoint);
    }

    /**
     * Make an API call against the specified endpoint with supplied data.
     *
     * @param   string      $endpoint   The endpoint to be contacted
     * @param   array       $data       Any data to pass to the endpoint
     * @return  object                  Content decoded from the endpoint
     * TODO Throw
     */
    protected function fetch_dropbox_data($endpoint, array $data = []) {
        $url = $this->get_api_endpoint($endpoint);
        $this->cleanopt();
        $this->resetHeader();

        $options['CURLOPT_POSTFIELDS'] = json_encode($data);
        $options['CURLOPT_POST'] = 1;
        $this->setHeader('Content-Type: application/json');

        $result = $this->request($url, $options);

        return json_decode($result);
    }

    /**
     * Fetch content from the specified endpoint with the supplied data.
     *
     * @param   string      $endpoint   The endpoint to be contacted
     * @param   array       $data       Any data to pass to the endpoint
     * @return  string                  The returned data
     * TODO Throw
     */
    protected function fetch_dropbox_content($endpoint, $data = []) {
        $url = $this->get_content_endpoint($endpoint);
        $this->cleanopt();
        $this->resetHeader();

        $options['CURLOPT_POST'] = 1;
        $this->setHeader('Content-Type: ');
        $this->setHeader('Dropbox-API-Arg: ' . json_encode($data));
        return $this->request($url, $options);
    }

    /**
     * Get file listing from dropbox
     *
     * @param   string      $path       The path to query
     * @return  array                   The returned directory listing
     * TODO Throw
     */
    public function get_listing($path = '') {
        if ($path === '/') {
            $path = '';
        }

        $data = $this->fetch_dropbox_data('files/list_folder', [
                'path'                  => $path,
            ]);

        return $data;
    }

    /**
     * Whether the entry is expected to have a thumbnail.
     * See docs at https://www.dropbox.com/developers/documentation/http/documentation#files-get_thumbnail.
     *
     * @param   object      $entry      The file entry received from the DropBox API
     * @return  boolean                 Whether dropbox has a thumbnail available
     */
    public function supports_thumbnail($entry) {
        if ($entry->{".tag"} !== "file") {
            // Not a file. No thumbnail available.
            return false;
        }

        // Thumbnails are available for files under 20MB with file extensions jpg, jpeg, png, tiff, tif, gif, and bmp.
        if ($entry->size > 20 * 1024 * 1024) {
            return false;
        }

        $supportedtypes = [
                'jpg'   => true,
                'jpeg'  => true,
                'png'   => true,
                'tiff'  => true,
                'tif'   => true,
                'gif'   => true,
                'bmp'   => true,
            ];

        $extension = substr($entry->path_lower, strrpos($entry->path_lower, '.') + 1);
        return isset($supportedtypes[$extension]) && $supportedtypes[$extension];
    }

    /**
     * Retrieves the thumbnail for the content, as supplied by dropbox.
     *
     * @param   string      $path       The path to fetch a thumbnail for
     * @return  string                  Thumbnail image content
     * TODO Throw
     */
    public function get_thumbnail($path) {
        $content = $this->fetch_dropbox_content('files/get_thumbnail', [
                'path' => $path,
            ]);

        return $content;
    }

    /**
     * Downloads a file from Dropbox and saves it locally
     *
     * @param   string      $path       The path to fetch
     * @return  string                  File content
     * TODO Throw
     */
    public function get_file($path) {
        $content = $this->fetch_dropbox_content('files/download', [
                'path' => $path,
            ]);

        return $content;
    }

    /**
     * Fetch a valid public share link for the specified file.
     *
     * @param   string      $path       The path of the file to fetch a link for
     * @return  object                  An object containing the id, path, size, and URL of the entry
     */
    public function get_file_share_info($id) {
        // Attempt to fetch any existing shared link first.
        $data = $this->fetch_dropbox_data('sharing/list_shared_links', [
                'path'      => $id,
            ]);

        if (isset($data->links)) {
            $link = reset($data->links);
            if (isset($link->{".tag"}) && $link->{".tag"} === "file") {
                return $this->normalize_file_share_info($link);
            }
        }

        // No existing link available.
        // Create a new one.
        $link = $this->fetch_dropbox_data('sharing/create_shared_link_with_settings', [
                'path'      => $id,
                'settings'  => [
                    'requested_visibility'  => 'public',
                ],
            ]);

        if (isset($link->{".tag"}) && $link->{".tag"} === "file") {
            return $this->normalize_file_share_info($link);
        }

        // Some kind of error we don't know how to handle at this stage.
        return null;
    }

    /**
     * Normalize the file share info.
     *
     * @param   object $entry   Information retrieved from share endpoints
     * @return  object          Normalized entry information to store as repository information
     */
    protected function normalize_file_share_info($entry) {
        return (object) [
                'id'    => $entry->id,
                'path'  => $entry->path_lower,
                'size'  => $entry->size,
                'url'   => $entry->url,
            ];
    }

    /**
     * Fetch this user's authentication token to store for subsequent requests.
     *
     * @return  object
     */
    public function get_authentication_token_for_storage() {
        return $this->get_stored_token();
    }
}

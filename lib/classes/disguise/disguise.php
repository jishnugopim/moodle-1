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
 * Disguise.
 *
 * @package    core
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\disguise;

defined('MOODLE_INTERNAL') || die();

/**
 * Disguise.
 *
 * @package    core
 * @copyright  2015 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
abstract class disguise {

    const DISGUISE_DISABLED = 0;
    const DISGUISE_FORCED = 1;
    const DISGUISE_OPTIONAL = 2;

    /**
     * @var int $id
     */
    protected $id;

    /**
     * @var bool $showrealidentity
     */
    protected $showrealidentity;

    /**
     * @var int $disabledisguisefrom
     */
    protected $disabledisguisefrom;

    /**
     * @var bool $loganonymously
     */
    protected $loganonymously;

    /**
     * @var bool $usegradebook
     */
    protected $usegradebook;

    /**
     * @var bool $mode
     */
    protected $mode;


    public function __construct($record) {
        $this->id = $record->id;
        $this->showrealidentity    = (bool) $record->showrealidentity;
        $this->disabledisguisefrom = (int)  $record->disabledisguisefrom;
        $this->loganonymously      = (bool) $record->loganonymously;
        $this->usegradebook        = (bool) $record->usegradebook;
        $this->mode                = (int)  $record->mode;
    }

    public function is_enabled() {
        return $this->mode !== self::DISGUISE_DISABLED;
    }

    public function is_forced() {
        return $this->mode === self::DISGUISE_FORCED;
    }

    public function should_show_real_identity() {
        // TODO add a check to allow overriding of this setting based on a
        // session var + capability.
        return $this->showrealidentity;
    }

    public function fullname(\stdClass $user, $options) {
        // The 'override' setting for when we need to call fullname() too.
        $override = isset($options['firstthenlast']) && $options['firstthenlast'];

        if ($this->is_enabled()) {
            $usedisguise = $this->is_forced();
            $usedisguise = $usedisguise || isset($options['disguise']) && $options['disguise'];

            if ($usedisguise) {
                if ($this->should_show_real_identity()) {
                    $a = new \stdClass();
                    $a->disguise = $this->_fullname($user, $options);
                    $a->fullname = fullname($user, $override);
                    return get_string('disguisewithreal', 'moodle', $a);
                }

                return $this->_fullname($user, $options);
            }
        }

        return fullname($user, $override);
    }

    public function profile_url(\stdClass $user, $options, $courseid = null) {
        // The 'override' setting for when we need to call fullname() too.
        $override = isset($options['firstthenlast']) && $options['firstthenlast'];

        if ($this->is_enabled()) {
            $usedisguise = $this->is_forced();
            $usedisguise = $usedisguise || isset($options['disguise']) && $options['disguise'];

            if ($usedisguise) {
                if ($this->should_show_real_identity()) {
                    $a = new \stdClass();
                    $a->disguise = $this->_fullname($user, $options);
                    $a->fullname = fullname($user, $override);
                    return get_string('disguisewithreal', 'moodle', $a);
                }

                return $this->_profile_url($user, $options);
            }
        }

        $profileurl = new moodle_url('/user/view.php', array('id' => $user->id));
        if ($courseid) {
            $profileurl->param('course', $courseid);
        }
        return $profileurl;
    }

    protected abstract function _fullname(\stdClass $user, $options);
    protected abstract function _profile_url(\stdClass $user, $options);
}

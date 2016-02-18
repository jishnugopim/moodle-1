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
 * User disguises
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\disguise;

defined('MOODLE_INTERNAL') || die();

/**
 * Disguise Helper.
 *
 * @package    core
 * @copyright  2016 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class helper {

    /**
     * const DISGUISE_DISABLED The disguise is currently disabled.
     */
    const DISGUISE_DISABLED = 0;

    /**
     * const DISGUISE_FORCED The disguise is currently forced.
     */
    const DISGUISE_FORCED = 1;

    /**
     * const DISGUISE_OPTIONAL The disguise is currently optional. It is up to the developer to determine how this flag is handled.
     */
    const DISGUISE_OPTIONAL = 2;

    /**
     * const IDENTITY_HIDDEN The disguise is not shown alongside the real identity.
     */
    const IDENTITY_HIDDEN = 0;

    /**
     * const IDENTITY_SHOWN The disguise is shown alongside the real identity.
     */
    const IDENTITY_SHOWN = 1;

    /**
     * const IDENTITY_RESTRICTED The disguise is shown alongside the real identity for users with the showidentity capability.
     */
    const IDENTITY_RESTRICTED = 2;

    /**
     * Instantiate an instance of the disguise.
     *
     * @param \context $context
     * @return An instance of the core\disguise
     * @throws \coding_exception
     */
    public static function instance(\context $context) {
        global $DB;

        if ($record = $DB->get_record('disguises', array('id' => $context->inheritteddisguiseid))) {
            if (empty($record->type)) {
                // There was a disguise, but it has been unset.
                // todo throw exception.
                return null;
            }

            $classname = '\\disguise_' . $record->type . '\\disguise';
            if (class_exists($classname)) {
                return new $classname($record, $context);
            }
        }

        throw new \coding_exception('Disguise not found.');
    }

    /**
     * Create a new disguise instance against the specified context.
     *
     * @param context $context
     * @param string $disguisetype
     */
    protected static function create(\context $context, $disguisetype) {
        global $DB;

        if ($context->has_disguise()) {
            throw new \moodle_exception('Disguise is aready set for this context');
        }

        $classname = '\\disguise_' . $disguisetype . '\\disguise';
        if (!class_exists($classname)) {
            throw new \coding_exception('Unknown disguise type');
        }

        $record = new \stdClass();
        $record->type = $disguisetype;
        $record->id = $DB->insert_record('disguises', $record);

        $record = $DB->get_record('disguises', array('id' => $record->id));

        $disguise = new $classname($record, $context);
        $context->set_disguise($disguise);

        return $disguise;
    }

    /**
     * Whether the disguise configured for the specified user in the the specified context.
     *
     * @param \context $context The context to check.
     * @param \stdClass $user The user to check.
     * @return bool
     */
    public static function is_configured_for_user_in_context(\context $context, \stdClass $user) {
        global $USER;

        if (!$context->disguise) {
            return true;
        }

        if (null === $user) {
            $user = $USER;
        }

        return $context->disguise->is_configured_for_user($user);
    }

    /**
     * Ensure that the the user has configured their disguise within the specified context.
     *
     * @param \context $context The context to check.
     * @param \stdClass $user The user to check.
     * @return bool
     */
    public static function ensure_configured_for_user_in_context(\context $context, \stdClass $user = null) {
        global $USER;

        if (!$context->disguise) {
            return;
        }

        if (null === $user) {
            $user = $USER;
        }

        return $context->disguise->ensure_configured_for_user($user);
    }

    /**
     * Add the standard disguise form fields.
     *
     * @param $mform
     * @param \context $context The context to add the form to
     */
    public static function add_to_form(&$mform, \context $context = null) {
        $mform->addElement('header', 'userdisguises', get_string('disguisemodformtitle', 'moodle'));

        $options = array();
        foreach (\core\plugininfo\disguise::get_enabled_plugins() as $disguise) {
            $options[$disguise] = get_string('pluginname', 'disguise_' . 'basic');
        }

        $options = array(null => get_string('none')) + $options;
        $mform->addElement('select', 'disguise_type', get_string('disguise_type', 'moodle'), $options);
        if ($context && $context->has_own_disguise()) {
            $mform->hardFreeze('disguise_type');
        }

        // Enabled/Disabled/Optional.
        $options = array(
            \core\disguise\helper::DISGUISE_DISABLED => get_string('disguise_disabled', 'moodle'),
            \core\disguise\helper::DISGUISE_FORCED => get_string('disguise_forced', 'moodle'),
            \core\disguise\helper::DISGUISE_OPTIONAL => get_string('disguise_optional', 'moodle'),
        );
        $mform->addElement('select', 'disguise_mode', get_string('disguise_mode', 'moodle'), $options);
        $mform->disabledIf('disguise_mode', 'disguise_type', 'eq', null);

        // Show real identity always
        $options = array(
            \core\disguise\helper::IDENTITY_HIDDEN => get_string('disguise_identity_hidden', 'moodle'),
            \core\disguise\helper::IDENTITY_SHOWN => get_string('disguise_identity_shown', 'moodle'),
            \core\disguise\helper::IDENTITY_RESTRICTED => get_string('disguise_identity_restricted', 'moodle'),
        );
        $mform->addElement('select', 'disguise_showrealidentity', get_string('disguise_showrealidentity', 'moodle'), $options);
        $mform->disabledIf('disguise_showrealidentity', 'disguise_type', 'eq', null);

        // Always show real identity from.
        $mform->addElement(
                'date_time_selector',
                'disguise_disabledisguisefrom',
                get_string('disguise_disabledisguisefrom', 'moodle'),
                array('optional' => true)
            );
        $mform->disabledIf('disguise_disabledisguisefrom', 'disguise_type', 'eq', null);

        // Allow logging.
        $mform->addElement('checkbox', 'disguise_loganonymously', get_string('disguise_loganonymously', 'moodle'));
        $mform->disabledIf('disguise_loganonymously', 'disguise_type', 'eq', null);

        // Allow use of Gradebook
        $mform->addElement('checkbox', 'disguise_usegradebook', get_string('disguise_usegradebook', 'moodle'));
        $mform->disabledIf('disguise_usegradebook', 'disguise_type', 'eq', null);

        // Lock disguise (with warning if user is not able to disable the lock)
        if ($context && $context->disguise && !$context->disguise->can_make_changes()) {
            $type = $mform->getElement('disguise_type');
            $type->setValue($context->disguise->get_type());
            $type->freeze();

            $mform->getElement('disguise_mode')->freeze();
            $mform->getElement('disguise_showrealidentity')->freeze();
            $mform->getElement('disguise_disabledisguisefrom')->freeze();
            $mform->getElement('disguise_loganonymously')->freeze();
            $mform->getElement('disguise_usegradebook')->freeze();
        }
    }

    /**
     * Handle disguise creation and update following submission of a form
     * which includes a disguise.
     *
     * @param \context $context The context to add the form to
     * @param \stdClass $data The submitted form data
     */
    public static function handle_form_submission(\context $context, \stdClass $data) {
        if ($context->has_own_disguise()) {
            // This context has it's own disguise.
            if ($context->disguise->can_make_changes()) {
                // Update settings.
                self::update_from_form($context, $data);
            }
        } else if (!$context->has_disguise() && !empty($data->disguise_type)) {
            // There is currently no disguise at this context, or any of it's parent contexts, and a disguise type was specified.

            // Create a new instance of this type of disguise.
            self::create($context, $data->disguise_type);

            // Update settings.
            self::update_from_form($context, $data);
        }
    }

    /**
     * Get the disguise data to add to a form.
     *
     * @param context $context The context to add data for
     * @param stdClass $formdata
     * @return bool Whether changes were made
     */
    public static function add_form_values(\context $context, &$data) {
        if (!$context->has_own_disguise()) {
            return $data;
        }

        // Note: We need the raw values here, not the resultant values after other values have been considered.
        $disguisedata = $context->disguise->to_record();

        foreach ($disguisedata as $key => $value) {
            // We prefix all keys with disguise_ to namespace them within the form.
            $key = 'disguise_' . $key;
            $data->$key = $value;
        }

        return $data;
    }

    /**
     * Update the disguise with the data from the submitted form.
     *
     * @param context $context The context to add data for
     * @param stdClass $formdata
     * @return bool Whether changes were made
     */
    protected static function update_from_form(\context $context, \stdClass $form) {
        global $DB;
        if (!$context->has_own_disguise()) {
            return false;
        }

        if (!$context->disguise->can_make_changes()) {
            return false;
        }

        $disguisedata = $context->disguise->to_record();

        $record = new \stdClass();
        if ($form->disguise_type != $disguisedata) {
            $record->type = $form->disguise_type;
        }

        if ($form->disguise_mode != $disguisedata->mode) {
            $record->mode = $form->disguise_mode;
        }
        if ($form->disguise_showrealidentity != $disguisedata->showrealidentity) {
            $record->showrealidentity = $form->disguise_showrealidentity;
        }
        if ($form->disguise_disabledisguisefrom != $disguisedata->disabledisguisefrom) {
            $record->disabledisguisefrom = $form->disguise_disabledisguisefrom;
        }
        if (!empty($form->disguise_loganonymously) != (bool) $disguisedata->loganonymously) {
            $record->loganonymously = !empty($form->disguise_loganonymously);
        }
        if (!empty($form->disguise_usegradebook) != (bool) $disguisedata->usegradebook) {
            $record->usegradebook = !empty($form->disguise_usegradebook);
        }

        if (!empty((array) $record)) {
            $record->id = $context->disguiseid;
            return $DB->update_record('disguises', $record);
        }

        return false;
    }
}

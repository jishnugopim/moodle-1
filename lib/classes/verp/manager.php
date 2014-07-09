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
 * Variable Envelope Return Path management.
 *
 * @package    core
 * @category   verp
 * @copyright  2014 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace core\verp;

defined('MOODLE_INTERNAL') || die();

/**
 * Variable Envelope Return Path manager class.
 *
 * @copyright  2014 Andrew Nicols <andrew@nicols.co.uk>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class manager {

    /**
     * Load handler instances for all of the handlers defined in db/verp_handlers.php for the specified component.
     *
     * @param string $componentname - The name of the component to fetch the handlers for.
     * @return \core\verp\handler[] - List of handlers for this component.
     */
    public static function load_default_handlers_for_component($componentname) {
        $dir = \core_component::get_component_directory($componentname);

        if (!$dir) {
            return array();
        }

        $file = $dir . '/db/verp_handlers.php';
        if (!file_exists($file)) {
            return array();
        }

        $handlers = null;
        require_once($file);

        if (!isset($handlers)) {
            return array();
        }

        $handlerinstances = array();

        foreach ($handlers as $handler) {
            $record = (object) $handler;
            $record->component = $componentname;
            $handlerinstance = self::handler_from_record($record);
            $handlerinstances[] = $handlerinstance;
        }

        return $handlerinstances;
    }

    /**
     * Update the database to contain a list of handlers for a component,
     * clearing out all existing handlers for the component first.
     *
     * @param string $componentname - The frankenstyle component name.
     */
    public static function reset_verp_handlers_for_component($componentname) {
        global $DB;

        $DB->delete_records('verp_handlers', array('component' => $componentname));
        self::create_missing_verp_handlers_for_component($componentname);
    }

    /**
     * Update the database to contain a list of handlers for a component,
     * adding any handlers which do not exist in the database.
     *
     * @param string $componentname - The frankenstyle component name.
     */
    public static function create_missing_verp_handlers_for_component($componentname) {
        global $DB;

        $expectedhandlers = self::load_default_handlers_for_component($componentname);
        foreach ($expectedhandlers as $handler) {
            $recordexists = $DB->record_exists('verp_handlers', array(
                'component' => $componentname,
                'classname' => $handler->classname,
            ));

            if (!$recordexists) {
                $record = self::record_from_handler($handler);
                $record->component = $componentname;
                $DB->insert_record('verp_handlers', $record);
            }
        }
    }

    /**
     * Create a flat stdClass for the handler, appropriate for inserting
     * into the database.
     *
     * @param string $classname
     * @return \stdClass
     */
    public static function record_from_handler($handler) {
        $record = new \stdClass();
        $record->id = $handler->id;
        $record->component = $handler->component;
        $record->classname = get_class($handler);
        if (strpos($record->classname, '\\') !== 0) {
            $record->classname = '\\' . $record->classname;
        }
        $record->validate_address = $handler->validate_address;
        $record->enabled = $handler->enabled;

        return $record;
    }

    /**
     * Load the VERP handler details for a given record.
     *
     * @param string $classname
     * @return \core\verp\handler or false
     */
    public static function handler_from_record($record) {
        $classname = $record->classname;
        if (strpos($classname, '\\') !== 0) {
            $classname = '\\' . $classname;
        }
        if (!class_exists($classname)) {
            return false;
        }

        $handler = new $classname;
        if (isset($record->id)) {
            $handler->set_id($record->id);
        }
        $handler->set_component($record->component);

        // Overload fields which can be modified.
        if (isset($record->validateaddress)) {
            $handler->set_validate_address($record->validateaddress);
        }

        if (isset($record->enabled)) {
            $handler->set_enabled($record->enabled);
        }

        return $handler;
    }

    /**
     * Load the VERP handler details for a given classname.
     *
     * @param string $classname The name of the class for the handler.
     * @return \core\verp\handler or false
     */
    public static function get_handler($classname) {
        global $DB;

        if (strpos($classname, '\\') !== 0) {
            $classname = '\\' . $classname;
        }

        $record = $DB->get_record('verp_handlers', array('classname' => $classname), '*', IGNORE_MISSING);
        if (!$record) {
            return false;
        }
        return self::handler_from_record($record);
    }

    /**
     * Load the VERP handler with a given ID
     *
     * @param int $id
     * @return \core\verp\handler or false
     */
    public static function get_handler_from_id($id) {
        global $DB;

        $record = $DB->get_record('verp_handlers', array('id' => $id), '*', IGNORE_MISSING);
        if (!$record) {
            return false;
        }
        return self::handler_from_record($record);
    }

}

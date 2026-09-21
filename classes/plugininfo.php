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
 * Tiny CCEAD HTML blocks plugin integration.
 *
 * @package     tiny_cceadhtmlblocks
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class plugininfo extends plugin implements plugin_with_buttons, plugin_with_menuitems {
    /**
     * Determine whether the plugin is enabled in this editor context.
     *
     * @param context $context Editor context.
     * @param array $options Editor options.
     * @param array $fpoptions File picker options.
     * @param editor|null $editor Editor instance.
     * @return bool Whether the user can use HTML blocks.
     */
    public static function is_enabled(
        context $context,
        array $options,
        array $fpoptions,
        ?editor $editor = null
    ): bool {
        return has_capability('tiny/cceadhtmlblocks:use', $context);
    }

    /**
     * Return the toolbar button identifiers.
     *
     * @return string[] Button identifiers.
     */
    public static function get_available_buttons(): array {
        return ['tiny_cceadhtmlblocks/plugin'];
    }

    /**
     * Return the menu item identifiers.
     *
     * @return string[] Menu item identifiers.
     */
    public static function get_available_menuitems(): array {
        return ['tiny_cceadhtmlblocks/plugin'];
    }
}

<?php
// This file is part of Moodle - http://moodle.org/

namespace tiny_cceadhtmlblocks;

use context;
use editor_tiny\editor;
use editor_tiny\plugin;
use editor_tiny\plugin_with_buttons;
use editor_tiny\plugin_with_menuitems;

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

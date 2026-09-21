<?php
// This file is part of Moodle - http://moodle.org/

namespace tiny_cceadhtmlblocks\privacy;

/**
 * Privacy API implementation for a plugin that stores no personal data.
 *
 * @package     tiny_cceadhtmlblocks
 * @category    privacy
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class provider implements \core_privacy\local\metadata\null_provider {
    /**
     * Return the reason why the plugin stores no personal data.
     *
     * @return string Privacy language string identifier.
     */
    public static function get_reason(): string {
        return 'privacy:metadata';
    }
}

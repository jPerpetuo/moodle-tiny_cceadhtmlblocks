<?php
// This file is part of Moodle - http://moodle.org/

/**
 * Capabilities for Tiny CCEAD HTML blocks.
 *
 * @package     tiny_cceadhtmlblocks
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

$capabilities = [
    'tiny/cceadhtmlblocks:use' => [
        'captype' => 'read',
        'contextlevel' => CONTEXT_MODULE,
        'archetypes' => [
            'editingteacher' => CAP_ALLOW,
        ],
    ],
];

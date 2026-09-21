// This file is part of Moodle - http://moodle.org/

/**
 * TinyMCE configuration for Tiny CCEAD HTML blocks.
 *
 * @module      tiny_cceadhtmlblocks/configuration
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {addMenubarItem, addToolbarButton} from 'editor_tiny/utils';
import {buttonName, menuItemName} from './common';

export const configure = (instanceConfig) => ({
    toolbar: addToolbarButton(instanceConfig.toolbar, 'content', buttonName),
    menu: addMenubarItem(instanceConfig.menu, 'insert', menuItemName),
});

// This file is part of Moodle - http://moodle.org/

/**
 * Tiny CCEAD HTML blocks entry point.
 *
 * @module      tiny_cceadhtmlblocks/plugin
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getTinyMCE} from 'editor_tiny/loader';
import {getPluginMetadata} from 'editor_tiny/utils';
import {component, pluginName} from './common';
import {getSetup as getCommandSetup} from './commands';
import * as Configuration from './configuration';

export default Promise.all([
    getTinyMCE(),
    getPluginMetadata(component, pluginName),
    getCommandSetup(),
]).then(([tinyMCE, pluginMetadata, setupCommands]) => {
    tinyMCE.PluginManager.add(pluginName, (editor) => {
        setupCommands(editor);
        return pluginMetadata;
    });
    return [pluginName, Configuration];
});

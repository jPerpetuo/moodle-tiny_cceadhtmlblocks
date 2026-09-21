// This file is part of Moodle - http://moodle.org/

/**
 * Commands for Tiny CCEAD HTML blocks.
 *
 * @module      tiny_cceadhtmlblocks/commands
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {getButtonImage} from 'editor_tiny/utils';
import {get_string as getString} from 'core/str';
import {buttonName, component, icon, menuItemName} from './common';
import {getTarget} from './dom';
import {openDialog} from './dialog';

const canOperate = (editor) => ['new', 'existing'].includes(getTarget(editor).type);

/**
 * Get the asynchronous UI registration function.
 *
 * @returns {Promise<function(TinyMCE.editor): void>} UI registration function.
 */
export const getSetup = async() => {
    const [buttonTitle, menuItemTitle, disabledTitle, buttonImage] = await Promise.all([
        getString('button_htmlblocks', component),
        getString('menuitem_htmlblocks', component),
        getString('noselection', component),
        getButtonImage('icon', component),
    ]);

    return (editor) => {
        editor.ui.registry.addIcon(icon, buttonImage.html);
        editor.ui.registry.addButton(buttonName, {
            icon,
            tooltip: buttonTitle,
            onAction: () => openDialog(editor),
            onSetup: (api) => {
                const update = () => api.setEnabled(canOperate(editor));
                update();
                editor.on('NodeChange SelectionChange', update);
                return () => editor.off('NodeChange SelectionChange', update);
            },
        });
        editor.ui.registry.addMenuItem(menuItemName, {
            icon,
            text: menuItemTitle,
            onAction: () => openDialog(editor),
            onSetup: (api) => {
                const update = () => api.setEnabled(canOperate(editor));
                update();
                editor.on('NodeChange SelectionChange', update);
                return () => editor.off('NodeChange SelectionChange', update);
            },
            shortcut: disabledTitle,
        });
    };
};

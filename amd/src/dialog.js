// This file is part of Moodle - http://moodle.org/

/**
 * Accessible model picker for Tiny CCEAD HTML blocks.
 *
 * @module      tiny_cceadhtmlblocks/dialog
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import ModalFactory from 'core/modal_factory';
import {get_string as getString} from 'core/str';
import {component} from './common';
import {getTarget, unwrapSelection, updateSelection, wrapSelection} from './dom';
import {models} from './models';

const getCurrentModel = (target) => target.wrapper?.dataset.cceadhtmlblock || 'tip';

const getStrings = async() => {
    const keys = ['pluginname', 'dialogueintro', 'apply', 'remove', 'cancel', ...Object.values(models).map((model) => model.labelKey)];
    const values = await Promise.all(keys.map((key) => getString(key, key === 'cancel' ? 'core' : component)));
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
};

const getBody = (strings, selectedModel) => `
    <div class="tiny-cceadhtmlblocks-picker">
        <p>${strings.dialogueintro}</p>
        <div class="tiny-cceadhtmlblocks-picker__options" role="radiogroup" aria-label="${strings.pluginname}">
            ${Object.entries(models).map(([model, definition]) => `
                <button type="button" class="tiny-cceadhtmlblocks-picker__option ccead-htmlblock ccead-htmlblock--${model}"
                    data-model="${model}" role="radio" aria-checked="${model === selectedModel}"
                    style="background-color: ${definition.background}; border-color: ${definition.border};">
                    <span class="tiny-cceadhtmlblocks-picker__label">${strings[definition.labelKey]}</span>
                    <span class="tiny-cceadhtmlblocks-picker__preview">${strings.dialogueintro}</span>
                </button>`).join('')}
        </div>
    </div>`;

const getFooter = (strings, existing) => `
    <button type="button" class="btn btn-secondary" data-action="cancel">${strings.cancel}</button>
    ${existing ? `<button type="button" class="btn btn-outline-danger" data-action="remove">${strings.remove}</button>` : ''}
    <button type="button" class="btn btn-primary" data-action="apply">${strings.apply}</button>`;

/**
 * Open the model chooser for the current selection.
 *
 * @param {TinyMCE.editor} editor TinyMCE editor instance.
 * @returns {Promise<void>}
 */
export const openDialog = async(editor) => {
    const target = getTarget(editor);
    if (!['new', 'existing'].includes(target.type)) {
        return;
    }
    const strings = await getStrings();
    let selectedModel = getCurrentModel(target);
    const modal = await ModalFactory.create({
        title: strings.pluginname,
        body: getBody(strings, selectedModel),
        footer: getFooter(strings, target.type === 'existing'),
        removeOnClose: true,
    });

    const root = modal.getRoot().get(0);
    const selectModel = (model) => {
        selectedModel = model;
        root.querySelectorAll('[data-model]').forEach((option) => {
            option.setAttribute('aria-checked', String(option.dataset.model === model));
        });
    };
    root.querySelectorAll('[data-model]').forEach((option) => {
        option.addEventListener('click', () => selectModel(option.dataset.model));
    });
    root.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.hide());
    root.querySelector('[data-action="apply"]').addEventListener('click', () => {
        const label = strings[models[selectedModel].labelKey];
        if (target.type === 'existing') {
            updateSelection(editor, selectedModel, label);
        } else {
            wrapSelection(editor, selectedModel, label);
        }
        modal.hide();
    });
    const remove = root.querySelector('[data-action="remove"]');
    if (remove) {
        remove.addEventListener('click', () => {
            unwrapSelection(editor);
            modal.hide();
        });
    }
    modal.show();
};

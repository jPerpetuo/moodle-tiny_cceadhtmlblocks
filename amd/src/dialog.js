// This file is part of Moodle - http://moodle.org/

/**
 * Accessible format, colour, and preview picker for Tiny CCEAD HTML blocks.
 *
 * @module      tiny_cceadhtmlblocks/dialog
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import ModalFactory from 'core/modal_factory';
import {get_string as getString} from 'core/str';
import {component} from './common';
import {getBlockConfiguration, getTarget, unwrapSelection, updateSelection, wrapSelection} from './dom';
import {colors, formats} from './models';

const defaultConfiguration = {format: 'box', color: 'information'};

const getStrings = async() => {
    const keys = [
        'apply', 'cancel', 'choosecolor', 'chooseformat', 'dialogueintro', 'pluginname', 'preview',
        'previewdescription', 'remove', 'resizepreview',
        ...Object.values(colors).map((color) => color.labelKey),
        ...Object.values(formats).flatMap((format) => [format.labelKey, format.previewKey]),
    ];
    const values = await Promise.all(keys.map((key) => getString(key, key === 'cancel' ? 'core' : component)));
    return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
};

const getFormatOptions = (strings, selectedFormat) => Object.entries(formats).map(([format, definition]) => `
    <button type="button" class="tiny-cceadhtmlblocks-picker__choice" data-format="${format}"
        role="radio" aria-checked="${format === selectedFormat}" tabindex="${format === selectedFormat ? 0 : -1}">
        <span class="tiny-cceadhtmlblocks-picker__format-swatch tiny-cceadhtmlblocks-picker__format-swatch--${format}"></span>
        <span class="tiny-cceadhtmlblocks-picker__label">${strings[definition.labelKey]}</span>
        <span class="tiny-cceadhtmlblocks-picker__description">${strings[definition.previewKey]}</span>
    </button>`).join('');

const getColorOptions = (strings, selectedColor) => Object.entries(colors).map(([color, definition]) => `
    <button type="button" class="tiny-cceadhtmlblocks-picker__choice tiny-cceadhtmlblocks-picker__color-choice"
        data-color="${color}" role="radio" aria-checked="${color === selectedColor}"
        tabindex="${color === selectedColor ? 0 : -1}"
        style="--ccead-htmlblock-background: ${definition.background}; --ccead-htmlblock-border: ${definition.border};">
        <span class="tiny-cceadhtmlblocks-picker__color-swatch"></span>
        <span class="tiny-cceadhtmlblocks-picker__label">${strings[definition.labelKey]}</span>
    </button>`).join('');

const getBody = (strings, configuration) => `
    <div class="tiny-cceadhtmlblocks-picker" data-picker>
        <p class="tiny-cceadhtmlblocks-picker__intro">${strings.dialogueintro}</p>
        <div class="tiny-cceadhtmlblocks-picker__controls" data-controls>
            <section class="tiny-cceadhtmlblocks-picker__section" aria-labelledby="format-heading">
                <h3 id="format-heading">${strings.chooseformat}</h3>
                <div class="tiny-cceadhtmlblocks-picker__format-options" role="radiogroup" aria-label="${strings.chooseformat}">
                    ${getFormatOptions(strings, configuration.format)}
                </div>
            </section>
            <section class="tiny-cceadhtmlblocks-picker__section" aria-labelledby="color-heading">
                <h3 id="color-heading">${strings.choosecolor}</h3>
                <div class="tiny-cceadhtmlblocks-picker__color-options" role="radiogroup" aria-label="${strings.choosecolor}">
                    ${getColorOptions(strings, configuration.color)}
                </div>
            </section>
        </div>
        <div class="tiny-cceadhtmlblocks-picker__separator" data-separator tabindex="0" role="separator"
            aria-label="${strings.resizepreview}" aria-orientation="horizontal" aria-valuemin="25"
            aria-valuemax="75" aria-valuenow="50"></div>
        <section class="tiny-cceadhtmlblocks-picker__preview-section" aria-labelledby="preview-heading" data-preview-section>
            <h3 id="preview-heading">${strings.preview}</h3>
            <p class="tiny-cceadhtmlblocks-picker__preview-description">${strings.previewdescription}</p>
            <div class="tiny-cceadhtmlblocks-picker__preview" data-preview tabindex="0"></div>
        </section>
    </div>`;

const getFooter = (strings, existing) => `
    <button type="button" class="btn btn-secondary" data-action="cancel">${strings.cancel}</button>
    ${existing ? `<button type="button" class="btn btn-outline-danger" data-action="remove">${strings.remove}</button>` : ''}
    <button type="button" class="btn btn-primary" data-action="apply">${strings.apply}</button>`;

const stripPreviewIds = (element) => {
    if (element.nodeType !== Node.ELEMENT_NODE) {
        return;
    }
    element.removeAttribute('id');
    element.querySelectorAll('[id]').forEach((child) => child.removeAttribute('id'));
};

const getPreviewNodes = (target) => target.type === 'existing' ? Array.from(target.wrapper.childNodes) : target.blocks;

const updatePreview = (root, target, configuration) => {
    const previewContainer = root.querySelector('[data-preview]');
    const definition = colors[configuration.color];
    const preview = root.ownerDocument.createElement(formats[configuration.format].wrapperTag);
    preview.classList.add(
        'ccead-htmlblock',
        `ccead-htmlblock--format-${configuration.format}`,
        `ccead-htmlblock--color-${configuration.color}`,
    );
    preview.style.setProperty('--ccead-htmlblock-background', definition.background);
    preview.style.setProperty('--ccead-htmlblock-border', definition.border);
    getPreviewNodes(target).forEach((node) => {
        const clone = node.cloneNode(true);
        stripPreviewIds(clone);
        preview.append(clone);
    });
    previewContainer.replaceChildren(preview);
};

const setSelectedChoice = (root, selector, selected) => {
    root.querySelectorAll(selector).forEach((option) => {
        const identifier = option.dataset.format || option.dataset.color;
        const isSelected = identifier === selected;
        option.setAttribute('aria-checked', String(isSelected));
        option.tabIndex = isSelected ? 0 : -1;
    });
};

/**
 * Add standard radio-group keyboard navigation to a catalogue-derived group.
 *
 * @param {HTMLElement} root Modal root element.
 * @param {string} selector Option selector within the modal.
 * @returns {void}
 */
const configureRadioGroup = (root, selector) => {
    const options = Array.from(root.querySelectorAll(selector));
    options.forEach((option, index) => {
        option.addEventListener('keydown', (event) => {
            const offsets = {
                ArrowDown: 1,
                ArrowRight: 1,
                ArrowUp: -1,
                ArrowLeft: -1,
            };
            let nextIndex;
            if (Object.prototype.hasOwnProperty.call(offsets, event.key)) {
                nextIndex = (index + offsets[event.key] + options.length) % options.length;
            } else if (event.key === 'Home') {
                nextIndex = 0;
            } else if (event.key === 'End') {
                nextIndex = options.length - 1;
            } else {
                return;
            }
            event.preventDefault();
            options[nextIndex].focus();
            options[nextIndex].click();
        });
    });
};

const configureSeparator = (root) => {
    const picker = root.querySelector('[data-picker]');
    const controls = root.querySelector('[data-controls]');
    const separator = root.querySelector('[data-separator]');
    const setRatio = (ratio) => {
        const value = Math.max(25, Math.min(75, Math.round(ratio)));
        controls.style.flexBasis = `${value}%`;
        separator.setAttribute('aria-valuenow', String(value));
    };
    const ratioFromPointer = (event) => {
        const bounds = picker.getBoundingClientRect();
        setRatio(((event.clientY - bounds.top) / bounds.height) * 100);
    };

    separator.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        ratioFromPointer(event);
        const move = (pointerEvent) => ratioFromPointer(pointerEvent);
        const stop = () => {
            root.ownerDocument.removeEventListener('pointermove', move);
            root.ownerDocument.removeEventListener('pointerup', stop);
        };
        root.ownerDocument.addEventListener('pointermove', move);
        root.ownerDocument.addEventListener('pointerup', stop, {once: true});
    });
    separator.addEventListener('keydown', (event) => {
        const current = Number(separator.getAttribute('aria-valuenow'));
        const updates = {
            ArrowDown: current + 5,
            ArrowUp: current - 5,
            End: 75,
            Home: 25,
        };
        if (Object.prototype.hasOwnProperty.call(updates, event.key)) {
            event.preventDefault();
            setRatio(updates[event.key]);
        }
    });
};

/**
 * Open the highlight block format and colour picker.
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
    const initial = target.type === 'existing' ? getBlockConfiguration(target.wrapper) : defaultConfiguration;
    let selectedFormat = initial.format;
    let selectedColor = initial.color;
    const modal = await ModalFactory.create({
        title: strings.pluginname,
        body: getBody(strings, initial),
        footer: getFooter(strings, target.type === 'existing'),
        large: true,
        removeOnClose: true,
    });

    const root = modal.getRoot().get(0);
    const refreshPreview = () => updatePreview(root, target, {format: selectedFormat, color: selectedColor});
    root.querySelectorAll('[data-format]').forEach((option) => {
        option.addEventListener('click', () => {
            selectedFormat = option.dataset.format;
            setSelectedChoice(root, '[data-format]', selectedFormat);
            refreshPreview();
        });
    });
    root.querySelectorAll('[data-color]').forEach((option) => {
        option.addEventListener('click', () => {
            selectedColor = option.dataset.color;
            setSelectedChoice(root, '[data-color]', selectedColor);
            refreshPreview();
        });
    });
    configureRadioGroup(root, '[data-format]');
    configureRadioGroup(root, '[data-color]');
    root.querySelector('[data-preview]').addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            event.preventDefault();
        }
    });
    root.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.hide());
    root.querySelector('[data-action="apply"]').addEventListener('click', () => {
        const label = strings[colors[selectedColor].labelKey];
        if (target.type === 'existing') {
            updateSelection(editor, selectedFormat, selectedColor, label);
        } else {
            wrapSelection(editor, selectedFormat, selectedColor, label);
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
    configureSeparator(root);
    refreshPreview();
    modal.show();
};

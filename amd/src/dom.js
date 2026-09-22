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
 * DOM operations for Tiny CCEAD HTML blocks.
 *
 * These functions move existing DOM nodes. They never use innerHTML or text
 * extraction, so inline formatting, links, lists, and media stay intact.
 *
 * @module      tiny_cceadhtmlblocks/dom
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

import {
    blockClass,
    blockColorDataAttribute,
    blockDataAttribute,
    blockFormatDataAttribute,
} from './common';
import {colors, formats, isColor, isFormat} from './models';

const fallbackStyleProperties = [
    'backgroundColor', 'border', 'borderBottom', 'borderLeft', 'borderRadius', 'borderTop', 'fontSize', 'lineHeight',
    'margin', 'padding',
];

const fallbackCustomProperties = ['--ccead-htmlblock-background', '--ccead-htmlblock-border'];

const managedAttributeNames = new Set([
    'aria-label', 'class', 'role', 'style', blockDataAttribute, blockColorDataAttribute, blockFormatDataAttribute,
]);

const getWrapper = (node, body) => {
    const element = node && (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
    const wrapper = element?.closest(`.${blockClass}`);
    return wrapper && body.contains(wrapper) ? wrapper : null;
};

const isRangeInside = (range, container) => (
    container.contains(range.startContainer) && container.contains(range.endContainer)
);

const clearFallbackStyles = (element) => {
    fallbackStyleProperties.forEach((property) => {
        element.style[property] = '';
    });
    fallbackCustomProperties.forEach((property) => {
        element.style.removeProperty(property);
    });
    if (!element.getAttribute('style')) {
        element.removeAttribute('style');
    }
};

const setFallbackStyles = (element, format, color) => {
    const definition = colors[color];
    clearFallbackStyles(element);
    element.style.setProperty('--ccead-htmlblock-background', definition.background);
    element.style.setProperty('--ccead-htmlblock-border', definition.border);

    if (format === 'box') {
        element.style.backgroundColor = definition.background;
        element.style.border = `1px solid ${definition.border}`;
        element.style.borderRadius = '0.5rem';
        element.style.margin = '1rem 0';
        element.style.padding = '1rem';
        return;
    }

    if (format === 'sidebar') {
        element.style.borderLeft = `2px solid ${definition.border}`;
        element.style.margin = '1rem 0';
        element.style.padding = '0.25rem 0 0.25rem 1rem';
        return;
    }

    element.style.borderTop = `2px solid ${definition.border}`;
    element.style.borderBottom = `2px solid ${definition.border}`;
    element.style.fontSize = '1.2rem';
    element.style.lineHeight = '1.5';
    element.style.margin = '1.5rem 0';
    element.style.padding = '1rem 0';
};

const copyUnmanagedAttributes = (source, destination) => {
    Array.from(source.attributes).forEach((attribute) => {
        if (!managedAttributeNames.has(attribute.name)) {
            destination.setAttribute(attribute.name, attribute.value);
        }
    });
};

const copyWrapperCustomisation = (source, destination) => {
    Array.from(source.classList)
        .filter((className) => !className.startsWith(blockClass))
        .forEach((className) => destination.classList.add(className));
    if (source.getAttribute('style')) {
        destination.setAttribute('style', source.getAttribute('style'));
    }
};

const replaceWrapperTag = (element, tagName) => {
    if (element.tagName.toLowerCase() === tagName) {
        return element;
    }

    const replacement = element.ownerDocument.createElement(tagName);
    copyUnmanagedAttributes(element, replacement);
    copyWrapperCustomisation(element, replacement);
    element.before(replacement);
    while (element.firstChild) {
        replacement.append(element.firstChild);
    }
    element.remove();
    return replacement;
};

/**
 * Resolve separate format and colour values, including the legacy signature.
 *
 * @param {string} format Format identifier, or a legacy colour identifier.
 * @param {string} color Colour identifier, or a legacy accessible label.
 * @param {string} label Accessible label for the separate signature.
 * @returns {{format: string, color: string, label: string}|null} Configuration, or null when invalid.
 */
export const resolveConfiguration = (format, color, label) => {
    if (isFormat(format) && isColor(color)) {
        return {format, color, label: label || colors[color].labelKey};
    }
    if (isColor(format)) {
        return {format: 'box', color: format, label: color || colors[format].labelKey};
    }
    return null;
};

/**
 * Read a block configuration and map legacy blocks to the box format.
 *
 * @param {HTMLElement} element Highlight block wrapper.
 * @returns {{format: string, color: string}} Block configuration.
 */
export const getBlockConfiguration = (element) => {
    const format = element.getAttribute(blockFormatDataAttribute);
    const color = element.getAttribute(blockColorDataAttribute);
    const legacyColor = element.getAttribute(blockDataAttribute);
    let selectedColor = 'tip';
    if (isColor(color)) {
        selectedColor = color;
    } else if (isColor(legacyColor)) {
        selectedColor = legacyColor;
    }
    return {
        format: isFormat(format) ? format : 'box',
        color: selectedColor,
    };
};

const applyConfiguration = (element, configuration) => {
    Object.keys(formats).forEach((format) => element.classList.remove(`${blockClass}--format-${format}`));
    Object.keys(colors).forEach((color) => {
        element.classList.remove(`${blockClass}--${color}`, `${blockClass}--color-${color}`);
    });
    element.classList.add(
        blockClass,
        `${blockClass}--${configuration.color}`,
        `${blockClass}--format-${configuration.format}`,
        `${blockClass}--color-${configuration.color}`,
    );
    element.setAttribute(blockDataAttribute, '1');
    element.setAttribute(blockFormatDataAttribute, configuration.format);
    element.setAttribute(blockColorDataAttribute, configuration.color);
    if (formats[configuration.format].role) {
        element.setAttribute('role', formats[configuration.format].role);
    } else {
        element.removeAttribute('role');
    }
    element.setAttribute('aria-label', configuration.label);
    setFallbackStyles(element, configuration.format, configuration.color);
};

const updateWrapper = (wrapper, configuration) => {
    const element = replaceWrapperTag(wrapper, formats[configuration.format].wrapperTag);
    applyConfiguration(element, configuration);
    return element;
};

/**
 * Get the operation target for the active selection.
 *
 * @param {TinyMCE.editor} editor TinyMCE editor instance.
 * @returns {{type: string, wrapper?: HTMLElement, blocks?: HTMLElement[]}}
 */
export const getTarget = (editor) => {
    const body = editor.getBody();
    const range = editor.selection.getRng();
    const startWrapper = getWrapper(range.startContainer, body);
    const endWrapper = getWrapper(range.endContainer, body);

    if (startWrapper && startWrapper === endWrapper && isRangeInside(range, startWrapper)) {
        return {type: 'existing', wrapper: startWrapper};
    }
    if (range.collapsed) {
        return {type: 'none'};
    }

    const blocks = Array.from(body.children).filter((child) => range.intersectsNode(child));
    if (!blocks.length || blocks.some((block) => block.classList.contains(blockClass))) {
        return {type: 'mixed'};
    }
    return {type: 'new', blocks};
};

/**
 * Wrap selected top-level blocks without reconstructing their contents.
 *
 * @param {TinyMCE.editor} editor TinyMCE editor instance.
 * @param {string} format Format identifier, or a legacy colour identifier.
 * @param {string} color Colour identifier, or a legacy accessible label.
 * @param {string} label Accessible label for the separate signature.
 * @returns {boolean} Whether the selected nodes were wrapped.
 */
export const wrapSelection = (editor, format, color, label) => {
    const target = getTarget(editor);
    const configuration = resolveConfiguration(format, color, label);
    if (target.type !== 'new' || !configuration) {
        return false;
    }

    let wrapper;
    editor.undoManager.transact(() => {
        wrapper = editor.getDoc().createElement(formats[configuration.format].wrapperTag);
        target.blocks[0].before(wrapper);
        target.blocks.forEach((block) => wrapper.append(block));
        applyConfiguration(wrapper, configuration);
        editor.selection.select(wrapper, true);
    });
    return Boolean(wrapper);
};

/**
 * Change an existing block without rebuilding its child nodes.
 *
 * @param {TinyMCE.editor} editor TinyMCE editor instance.
 * @param {string} format Format identifier, or a legacy colour identifier.
 * @param {string} color Colour identifier, or a legacy accessible label.
 * @param {string} label Accessible label for the separate signature.
 * @returns {boolean} Whether a configuration was applied.
 */
export const updateSelection = (editor, format, color, label) => {
    const target = getTarget(editor);
    const configuration = resolveConfiguration(format, color, label);
    if (target.type !== 'existing' || !configuration) {
        return false;
    }

    editor.undoManager.transact(() => {
        const wrapper = updateWrapper(target.wrapper, configuration);
        editor.selection.select(wrapper, true);
    });
    return true;
};

/**
 * Remove an existing wrapper and retain every child node in document order.
 *
 * @param {TinyMCE.editor} editor TinyMCE editor instance.
 * @returns {boolean} Whether a wrapper was removed.
 */
export const unwrapSelection = (editor) => {
    const target = getTarget(editor);
    if (target.type !== 'existing') {
        return false;
    }
    editor.undoManager.transact(() => {
        const {wrapper} = target;
        const parent = wrapper.parentNode;
        while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper);
        }
        wrapper.remove();
    });
    return true;
};

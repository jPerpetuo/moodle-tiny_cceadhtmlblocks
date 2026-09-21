// This file is part of Moodle - http://moodle.org/

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

import {blockClass, blockDataAttribute} from './common';
import {isModel, models} from './models';

const fallbackStyleProperties = ['backgroundColor', 'border', 'borderRadius', 'margin', 'padding'];

const getWrapper = (node, body) => {
    const element = node && (node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement);
    const wrapper = element?.closest(`.${blockClass}`);
    return wrapper && body.contains(wrapper) ? wrapper : null;
};

const isRangeInside = (range, container) => container.contains(range.startContainer) && container.contains(range.endContainer);

const setFallbackStyles = (element, model) => {
    const definition = models[model];
    element.style.backgroundColor = definition.background;
    element.style.border = `1px solid ${definition.border}`;
    element.style.borderRadius = '0.5rem';
    element.style.margin = '1rem 0';
    element.style.padding = '1rem';
};

const clearFallbackStyles = (element) => {
    fallbackStyleProperties.forEach((property) => {
        element.style[property] = '';
    });
    if (!element.getAttribute('style')) {
        element.removeAttribute('style');
    }
};

const applyModel = (element, model, label) => {
    if (!isModel(model)) {
        return false;
    }
    Object.keys(models).forEach((name) => element.classList.remove(`${blockClass}--${name}`));
    element.classList.add(blockClass, `${blockClass}--${model}`);
    element.setAttribute(blockDataAttribute, model);
    element.setAttribute('role', 'note');
    element.setAttribute('aria-label', label);
    setFallbackStyles(element, model);
    return true;
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
 * @param {string} model Highlight block model.
 * @param {string} label Accessible model label.
 * @returns {boolean} Whether the selected nodes were wrapped.
 */
export const wrapSelection = (editor, model, label) => {
    const target = getTarget(editor);
    if (target.type !== 'new' || !isModel(model)) {
        return false;
    }

    let wrapper;
    editor.undoManager.transact(() => {
        wrapper = editor.getDoc().createElement('div');
        target.blocks[0].before(wrapper);
        target.blocks.forEach((block) => wrapper.append(block));
        applyModel(wrapper, model, label);
        editor.selection.select(wrapper, true);
    });
    return Boolean(wrapper);
};

/**
 * Change the model of an existing block without touching its child nodes.
 *
 * @param {TinyMCE.editor} editor TinyMCE editor instance.
 * @param {string} model Highlight block model.
 * @param {string} label Accessible model label.
 * @returns {boolean} Whether a model was applied.
 */
export const updateSelection = (editor, model, label) => {
    const target = getTarget(editor);
    if (target.type !== 'existing' || !isModel(model)) {
        return false;
    }
    editor.undoManager.transact(() => applyModel(target.wrapper, model, label));
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
        clearFallbackStyles(wrapper);
        wrapper.remove();
    });
    return true;
};

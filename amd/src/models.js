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
 * Extensible highlight block format and colour definitions.
 *
 * @module      tiny_cceadhtmlblocks/models
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

const hasOwn = (collection, identifier) => Object.prototype.hasOwnProperty.call(collection, identifier);

/**
 * Visual structures available for a highlight block.
 *
 * Each format describes only structural presentation. Colour-specific values
 * remain in the independent colours catalogue below.
 *
 * @type {Object<string, Object>}
 */
export const formats = {
    box: {
        labelKey: 'format_box',
        previewKey: 'format_box_description',
        wrapperTag: 'div',
        cssModifier: 'box',
        role: 'note',
    },
    sidebar: {
        labelKey: 'format_sidebar',
        previewKey: 'format_sidebar_description',
        wrapperTag: 'div',
        cssModifier: 'sidebar',
        role: 'note',
    },
    quote: {
        labelKey: 'format_quote',
        previewKey: 'format_quote_description',
        wrapperTag: 'blockquote',
        cssModifier: 'quote',
        role: null,
    },
};

/**
 * Semantic colour tokens available for every highlight block format.
 *
 * The background is deliberately pastel. The border remains dark enough to
 * distinguish the block without being used as the teacher's text colour.
 *
 * @type {Object<string, Object>}
 */
export const colors = {
    tip: {
        labelKey: 'tip',
        cssModifier: 'tip',
        background: '#eaf6ef',
        border: '#3f7f5a',
    },
    information: {
        labelKey: 'information',
        cssModifier: 'information',
        background: '#eaf3fb',
        border: '#356d9a',
    },
    attention: {
        labelKey: 'attention',
        cssModifier: 'attention',
        background: '#fff8df',
        border: '#987a27',
    },
    important: {
        labelKey: 'important',
        cssModifier: 'important',
        background: '#fceeee',
        border: '#9f4b4b',
    },
    concept: {
        labelKey: 'concept',
        cssModifier: 'concept',
        background: '#f3effa',
        border: '#7256a5',
    },
    example: {
        labelKey: 'example',
        cssModifier: 'example',
        background: '#e9f7f7',
        border: '#2f7d80',
    },
    activity: {
        labelKey: 'activity',
        cssModifier: 'activity',
        background: '#fff2e8',
        border: '#b7672b',
    },
    reflection: {
        labelKey: 'reflection',
        cssModifier: 'reflection',
        background: '#eef2f7',
        border: '#5d718d',
    },
};

/**
 * Check whether an identifier belongs to the formats catalogue.
 *
 * @param {string} format Format identifier.
 * @returns {boolean} Whether the format exists.
 */
export const isFormat = (format) => hasOwn(formats, format);

/**
 * Check whether an identifier belongs to the colours catalogue.
 *
 * @param {string} color Colour identifier.
 * @returns {boolean} Whether the colour exists.
 */
export const isColor = (color) => hasOwn(colors, color);

// Compatibility aliases for the initial single-dimension picker. They will be
// removed only after all consumers read the separate catalogues.
export const models = colors;
export const isModel = isColor;

// This file is part of Moodle - http://moodle.org/

/**
 * Highlight block model definitions.
 *
 * @module      tiny_cceadhtmlblocks/models
 * @copyright   2026 CCEAD
 * @license     https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

export const models = {
    tip: {
        labelKey: 'tip',
        background: '#eaf7ee',
        border: '#2f855a',
    },
    information: {
        labelKey: 'information',
        background: '#eaf3ff',
        border: '#2b6cb0',
    },
    attention: {
        labelKey: 'attention',
        background: '#fff8db',
        border: '#b7791f',
    },
    important: {
        labelKey: 'important',
        background: '#fff0f0',
        border: '#c53030',
    },
};

export const isModel = (model) => Object.prototype.hasOwnProperty.call(models, model);

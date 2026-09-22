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

/* eslint-env jest */
import {getBlockConfiguration, resolveConfiguration, unwrapSelection, updateSelection} from 'tiny_cceadhtmlblocks/dom';

const createEditor = (body, range) => ({
    getBody: () => body,
    getDoc: () => body.ownerDocument,
    selection: {
        getRng: () => range,
        select: jest.fn(),
    },
    undoManager: {
        transact: (callback) => callback(),
    },
});

describe('Tiny CCEAD HTML block DOM operations', () => {
    afterEach(() => {
        document.body.replaceChildren();
    });

    it('maps the legacy model signature to the box format', () => {
        expect(resolveConfiguration('tip', 'Tip')).toEqual({format: 'box', color: 'tip', label: 'Tip'});
        expect(resolveConfiguration('quote', 'reflection', 'Reflection')).toEqual({
            format: 'quote',
            color: 'reflection',
            label: 'Reflection',
        });
    });

    it('reads a legacy wrapper as a box with its legacy colour', () => {
        const wrapper = document.createElement('div');
        wrapper.setAttribute('data-ccead-htmlblock', 'attention');

        expect(getBlockConfiguration(wrapper)).toEqual({format: 'box', color: 'attention'});
    });

    it('converts to a quote and removes the wrapper without losing child nodes', () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'ccead-htmlblock ccead-htmlblock--tip';
        wrapper.setAttribute('data-ccead-htmlblock', 'tip');
        const paragraph = document.createElement('p');
        const link = document.createElement('a');
        link.href = 'https://moodle.org/';
        link.textContent = 'Preserved link';
        paragraph.append(link);
        wrapper.append(paragraph);
        document.body.append(wrapper);

        const range = document.createRange();
        range.selectNodeContents(paragraph);
        const editor = createEditor(document.body, range);

        expect(updateSelection(editor, 'quote', 'reflection', 'Reflection')).toBe(true);
        const quote = document.body.firstElementChild;
        expect(quote.tagName).toBe('BLOCKQUOTE');
        expect(quote.firstElementChild).toBe(paragraph);
        expect(paragraph.firstElementChild).toBe(link);
        expect(getBlockConfiguration(quote)).toEqual({format: 'quote', color: 'reflection'});
        expect(quote.style.fontSize).toBe('1.2rem');
        expect(quote.style.getPropertyValue('--ccead-htmlblock-border')).toBe('#5d718d');

        range.selectNodeContents(paragraph);
        expect(unwrapSelection(editor)).toBe(true);
        expect(document.body.firstElementChild).toBe(paragraph);
        expect(paragraph.firstElementChild).toBe(link);
    });
});

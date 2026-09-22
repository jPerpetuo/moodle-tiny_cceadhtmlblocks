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
import {colors, formats, isColor, isFormat, isModel, models} from 'tiny_cceadhtmlblocks/models';

describe('Tiny CCEAD HTML block catalogues', () => {
    it('keeps formats and colours as independent catalogues', () => {
        expect(Object.keys(formats)).toEqual(['box', 'sidebar', 'quote']);
        expect(Object.keys(colors)).toEqual([
            'tip', 'information', 'attention', 'important', 'concept', 'example', 'activity', 'reflection',
        ]);
        expect(formats.quote.wrapperTag).toBe('blockquote');
    });

    it('accepts registered identifiers and rejects unknown identifiers', () => {
        expect(isFormat('sidebar')).toBe(true);
        expect(isColor('reflection')).toBe(true);
        expect(isFormat('card')).toBe(false);
        expect(isColor('magenta')).toBe(false);
    });

    it('keeps the legacy model aliases while the current picker uses them', () => {
        expect(models).toBe(colors);
        expect(isModel('tip')).toBe(true);
        expect(isModel('quote')).toBe(false);
    });
});

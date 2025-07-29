import { Code39 } from '../src/Code_39/code_39';
import { Code39Options } from '../src/Code_39/code_39_options';

// Mock options for testing
const defaultOptions: Code39Options = {
    mod43Checksum: false,
    fullAscii: false,
    narrowBarWidth: 1,
    interCharacterGap: 1,
    quietZoneWidthMultiplier: 10,
    widthRatio: 3,
    minimumBarHeight: 15,
    labelFontSize: 12,
};

describe('Code39', () => {
    describe('Checksum algorithms', () => {
        it('should calculate MOD43 checksum for "CODE 39" example', () => {
            expect((Code39 as any).calculateMod43Checksum('CODE 39')).toBe('R');
        });
        it('should calculate correct MOD43 checksum for known values', () => {
            expect((Code39 as any).calculateMod43Checksum('CODE39')).toBe('W');
            expect((Code39 as any).calculateMod43Checksum('12345')).toBe('F');
            expect((Code39 as any).calculateMod43Checksum('HELLO')).toBe('B');
            expect((Code39 as any).calculateMod43Checksum('TEST')).toBe('E');
        });
    });

    it('should generate SVG for valid standard data', () => {
        const svg = Code39.generateSvgString('CODE39', defaultOptions);
        expect(svg).toContain('<svg');
        expect(svg).toContain('</svg>');
    });

    it('should throw error for invalid standard character', () => {
        expect(() => Code39.generateSvgString('CODE@39', defaultOptions)).toThrow();
    });

    it('should generate SVG for valid full ASCII data', () => {
        const options = { ...defaultOptions, fullAscii: true };
        const svg = Code39.generateSvgString('Code39', options);
        expect(svg).toContain('<svg');
    });

    it('should throw error for invalid full ASCII character', () => {
        const options = { ...defaultOptions, fullAscii: true };
        expect(() => Code39.generateSvgString('Code39\u2603', options)).toThrow();
    });

    it('should contain the <title> tag with input data', () => {
        const options = { ...defaultOptions, mod43Checksum: true };
        const data = 'CODE39';
        const svg = Code39.generateSvgString(data, options);
        expect(svg).toContain(`<title>${data}</title>`);
    });

    it('should uppercase input data', () => {
        const svg = Code39.generateSvgString('code39', defaultOptions);
        expect(svg).toContain('<title>CODE39</title>');
    });

    it('should strip start/stop delimiters from input', () => {
        const svg = Code39.generateSvgString('*CODE39*', defaultOptions);
        const svgNoDelimiters = Code39.generateSvgString('CODE39', defaultOptions);
        expect(svg).toBe(svgNoDelimiters);
    });

    it('should handle no options being passed', () => {
        const svg = Code39.generateSvgString('CODE39');
        expect(svg).toContain('<svg');
        expect(svg).toContain('<title>CODE39</title>');
    });
});

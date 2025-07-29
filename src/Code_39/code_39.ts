import { CONTROL_CHARACTERS } from './control_characters';
import { FULL_ASCII_ENCODING } from './full_ascii_encoding';
import { BarEncoding, BarWidth } from './encoding';
import { Code39Options, GetDefaultCode39Options } from './code_39_options';
import { Code39Error } from './errors';

const STANDARD_CHARACTERS: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*';
const FULL_ASCII_CHARACTERS: string =  CONTROL_CHARACTERS + STANDARD_CHARACTERS + 'abcdefghijklmnopqrstuvwxyz';
const DATA_DELIMITER: string = '*';
const DELIMITER_REGEX: RegExp = /^\*|\*$/g;

export class Code39 {
    public static generateSvgString(data: string, options: Code39Options = null): string {
        // Sanitize input data
        data = data.replace(DELIMITER_REGEX, '');

        if (!options) {
            options = GetDefaultCode39Options();
        } else {
            options = { ...GetDefaultCode39Options(), ...options };
        }

        // Only full ASCII encoding allows lowercase characters
        if (!options.fullAscii) {
            data = data.toUpperCase();
        }

        Code39.validateData(data, options);
        const DATA_STRING: string = data;

        if (options.fullAscii) {
            data = Code39.encodeFullAscii(data);
        }

        if (options.mod43Checksum) {
            data += Code39.calculateMod43Checksum(data);
        }

        const quietZoneWidth: number = options.quietZoneWidthMultiplier * options.narrowBarWidth;

        data = `${DATA_DELIMITER}${data}${DATA_DELIMITER}`;
        const svgWidth: number = quietZoneWidth + (options.narrowBarWidth * 6) + (options.widthRatio * options.narrowBarWidth * 3) + (options.interCharacterGap * (data.length - 1)) + quietZoneWidth;
        const svgHeight: number = Math.max(options.minimumBarHeight, svgWidth * .15) + options.labelFontSize;

        let index: number = quietZoneWidth;
        let svgString: string = `<svg xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
        svgString += `<title>${DATA_STRING}</title>`;
        for (const char of data) {
            const encoding = BarEncoding[char];
            if (!encoding) {
                throw new Code39Error(`Invalid character '${char}' in Code 39 data.`);
            }
            for (let i = 0; i < encoding.length; i++) {
                const barWidth = encoding[i];
                const width = barWidth === BarWidth.WIDE ? options.widthRatio * options.narrowBarWidth : options.narrowBarWidth;
                if (i % 2 === 0) {
                    svgString += `<rect x="${index}" y="0" width="${width}" height="${svgHeight}" fill="black"/>`;
                }
                index += width + options.interCharacterGap;
            }
        }
        const labelX: number = quietZoneWidth + (svgWidth - 2 * quietZoneWidth) / 2;
        const labelY: number = svgHeight - options.labelFontSize / 2;

        svgString += `<text x="${labelX}" y="${labelY}" font-size="${options.labelFontSize}" text-anchor="middle">${DATA_STRING}</text>`;
        svgString += '</svg>';
        return svgString;
    }   

    private static validateData(data: string, options: Code39Options): void {
        if (options.fullAscii) {
            for (const char of data) {
                if (!FULL_ASCII_CHARACTERS.includes(char)) {
                    throw new Code39Error(`Invalid character '${char}' in Code 39 data.`);
                }
            }
        }
        else {
            for (const char of data) {
                if (!STANDARD_CHARACTERS.includes(char)) {
                    throw new Code39Error(`Invalid character '${char}' in Code 39 data.`);
                }
            }
        }
    }

    private static encodeFullAscii(data: string): string {
       let encodedData: string = '';
        for (const char of data) {
            encodedData += FULL_ASCII_ENCODING[char] || char;
        }
        return encodedData;
    }

    private static calculateMod43Checksum(data: string): string {
        // Mod 43 checksum does not include any start/stop characters
        const chars = data.replace(DELIMITER_REGEX, '');
        const sum = Array.from(chars).reduce((acc, char) => acc + STANDARD_CHARACTERS.indexOf(char), 0);
        const mod43 = sum % 43;
        return STANDARD_CHARACTERS[mod43];
    }
}

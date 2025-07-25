
import { CONTROL_CHARACTERS } from './code_39_control_characters';
import { CODE_39_FULL_ASCII_ENCODING } from './code_39_full_ascii_encoding';
import { Code39BarEncoding, Code39BarWidth } from './code_39_encoding';

const CODE39_STANDARD_CHARACTERS: string = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%*';
const CODE39_FULL_ASCII_CHARACTERS: string =  CONTROL_CHARACTERS + CODE39_STANDARD_CHARACTERS + 'abcdefghijklmnopqrstuvwxyz';
const CODE39_DATA_DELIMITER: string = '*';
const CODE39_DELIMITER_REGEX: RegExp = /^\*|\*$/g;

export class Code39 {

    public static generateSvgString(data: string, options: Code39Options = null): string {
        // Sanitize input data
        data = data.replace(CODE39_DELIMITER_REGEX, '');

        if (!options) {
            options = getDefaultCode39Options();
        } else {
            options = { ...getDefaultCode39Options(), ...options };
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

        data = `${CODE39_DATA_DELIMITER}${data}${CODE39_DATA_DELIMITER}`;
        const svgWidth: number = data.length * (3 * options.widthRatio + 6) * options.narrowBarWidth + data.length * options.interCharacterGap + 2 * quietZoneWidth;
        const svgHeight: number = Math.max(options.minimumBarHeight, (svgWidth - 2 * quietZoneWidth) * .15);

        let index: number = quietZoneWidth;
        let svgString: string = `<svg xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" viewBox="0 0 ${svgWidth} ${svgHeight}">`;
        svgString += `<title>${DATA_STRING}</title>`;
        for (const char of data) {
            const encoding = Code39BarEncoding[char];
            if (!encoding) {
                throw new Code39Error(`Invalid character '${char}' in Code 39 data.`);
            }
            for (let i = 0; i < encoding.length; i++) {
                const barWidth = encoding[i];
                const width = barWidth === Code39BarWidth.WIDE ? options.widthRatio * options.narrowBarWidth : options.narrowBarWidth;
                if (i % 2 === 0) {
                    svgString += `<rect x="${index}" y="0" width="${width}" height="${svgHeight}" fill="black"/>`;
                }
                index += width + options.interCharacterGap;
            }
        }

        svgString += '</svg>';
        return svgString;
    }   

    private static validateData(data: string, options: Code39Options): void {
        if (options.fullAscii) {
            for (const char of data) {
                if (!CODE39_FULL_ASCII_CHARACTERS.includes(char)) {
                    throw new Code39Error(`Invalid character '${char}' in Code 39 data.`);
                }
            }
        }
        else {
            for (const char of data) {
                if (!CODE39_STANDARD_CHARACTERS.includes(char)) {
                    throw new Code39Error(`Invalid character '${char}' in Code 39 data.`);
                }
            }
        }
    }

    private static encodeFullAscii(data: string): string {
       let encodedData: string = '';
        for (const char of data) {
            encodedData += CODE_39_FULL_ASCII_ENCODING[char] || char;
        }
        return encodedData;
    }

    private static calculateMod43Checksum(data: string): string {
        // Mod 43 checksum does not include any start/stop characters
        const chars = data.replace(CODE39_DELIMITER_REGEX, '');
        const sum = Array.from(chars).reduce((acc, char) => acc + CODE39_STANDARD_CHARACTERS.indexOf(char), 0);
        const mod43 = sum % 43;
        return CODE39_STANDARD_CHARACTERS[mod43];
    }
}

export interface Code39Options {
    mod43Checksum: boolean;
    fullAscii: boolean;
    narrowBarWidth: number;
    interCharacterGap: number;
    quietZoneWidthMultiplier: number;
    widthRatio: number;
    minimumBarHeight: number;
}

function getDefaultCode39Options(): Code39Options {
    return {
        mod43Checksum: false,
        fullAscii: false,
        narrowBarWidth: 1,
        interCharacterGap: 1,
        quietZoneWidthMultiplier: 10,
        widthRatio: 3,
        minimumBarHeight: 15,
    };
}

export class Code39Error extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Code39Error';
    }
}
export interface Code39Options {
    mod43Checksum: boolean;
    fullAscii: boolean;
    narrowBarWidth: number;
    interCharacterGap: number;
    quietZoneWidthMultiplier: number;
    widthRatio: number;
    minimumBarHeight: number;
    labelFontSize: number;
}

export function GetDefaultCode39Options(): Code39Options {
    return {
        mod43Checksum: false,
        fullAscii: false,
        narrowBarWidth: 1,
        interCharacterGap: 1,
        quietZoneWidthMultiplier: 10,
        widthRatio: 3,
        minimumBarHeight: 15,
        labelFontSize: 12,
    };
}

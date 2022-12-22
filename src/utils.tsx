// unary operator to remove trailing zeros
export function hrToText(hr: number) {
    return toDiff(hr) + '/s';
};

export function toDiff(hr: number) {
    return toLatin(hr) + 'h';
}

export function toLatin(n: number) : string {
    let units = ['', 'K', 'M', 'G']

    let i = Math.max(0, Math.min(Math.floor(Math.log10(n) / 3), units.length - 1));
    if (i !== 0) {
        n /= Math.pow(10, i * 3);
    }
        
    return `${+(n).toPrecision(i + 2)} ${units[i]}`;
};

export function toLatinInt(n: number) {
    return Number.isInteger(n) ? toLatin(n) : "";
}

export function unixTimeToClockText(date: Date): string {
    let minutes: number = date.getMinutes();
    let minutesStr: string = minutes.toString();

    if (minutes < 10) minutesStr = "0" + minutesStr;
    return `${date.getHours()}:${minutesStr}`;
}

export function timeToText(ms: number) {
    if (ms < 1000 * 60) {
        return `${Math.floor(ms / 1000)}s`;
    } else if (ms < 1000 * 60 * 60) {
        return `${Math.floor(ms / 1000 / 60)}m`;
    }
    else if (ms < 1000 * 60 * 60 * 24) {
        return `${Math.floor(ms / 1000 / 60 / 60)}h`;
    }

    return `${Math.floor(ms / 1000 / 60 / 60 / 24)}d`;
}

export function truncateAddress(address: string) {
    return address.substring(0, 6) + "..." + address.substring(address.length - 6);
}
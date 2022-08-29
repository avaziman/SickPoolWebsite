// unary operator to remove trailing zeros
export function hrToText(hr: number) {
    return toLatin(hr) + 'H/s';
};

export function toLatin(n: number) {
    if (n < 1e3) {
        return `${+(n).toPrecision(2)} `;
    } else if (n < 1e6) {
        return `${+(n / 1e3).toPrecision(2)} K`;
    } else if (n < 1e9) {
        return `${+(n / 1e6).toPrecision(3)} M`;
    } else {
        return `${+(n / 1e9).toPrecision(4)} G`;
    }
};

export function unixTimeToClockText(i: number) {
    let date = new Date(i);
    let minutes: number = date.getMinutes();
    let minutesStr: string= minutes.toString();

    if (minutes < 10) minutesStr = "0" + minutesStr;
    return `${date.getHours()}:${minutesStr}`;
}

export function timeToText(diff: number) {
    if (diff < 1000 * 60) {
        return `${Math.floor(diff / 1000)}s`;
    } else if (diff < 1000 * 60 * 60) {
        return `${Math.floor(diff / 1000 / 60)}m`;
    }
    else if (diff < 1000 * 60 * 60 * 24) {
        return `${Math.floor(diff / 1000 / 60 / 60)}h`;
    }

    return `${Math.floor(diff / 1000 / 60 / 60 / 24)}d`;
}

export function truncateAddress(address: string) {
    return address.substring(0, 6) + "..." + address.substring(address.length - 6);
}
// unary operator to remove trailing zeros
export function hrToText(hr) {
    if (hr < 1e3) {
        return `${hr} H/s`;
    } else if (hr < 1e6) {
        return `${+(hr / 1e3).toPrecision(2)} KH/s`;
    } else if (hr < 1e9) {
        return `${+(hr / 1e6).toPrecision(3)} MH/s`;
    } else {
        return `${+(hr / 1e9).toPrecision(4)} GH/s`;
    }
};

// unary operator to remove trailing zeros
export function diffToText(diff) {
    if (diff < 1e3) {
        return `${diff}`;
    } else if (diff < 1e6) {
        return `${+(diff / 1e3).toPrecision(2)}K`;
    } else if (diff < 1e9) {
        return `${+(diff / 1e6).toPrecision(3)}M`;
    } else {
        return `${+(diff / 1e9).toPrecision(4)}G`;
    }
};

export function unixTimeToClockText(i) {
    let date = new Date(i);
    let minutes = date.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;
    return `${date.getHours()}:${minutes}`;
}

export function timeToText(diff) {
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

export function truncateAddress(address) {
    return address.substring(0, 6) + "..." + address.substring(address.length - 6);
}
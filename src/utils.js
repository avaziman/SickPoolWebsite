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
export function diffToText(hr) {
    if (hr < 1e3) {
        return `${hr}`;
    } else if (hr < 1e6) {
        return `${+(hr / 1e3).toPrecision(2)}K`;
    } else if (hr < 1e9) {
        return `${+(hr / 1e6).toPrecision(3)}M`;
    } else {
        return `${+(hr / 1e9).toPrecision(4)}G`;
    }
};

export function unixTimeToText(i) {
    let date = new Date(i);
    let minutes = date.getMinutes();
    if (minutes < 10) minutes = "0" + minutes;
    return `${date.getHours()}:${minutes}`;
}
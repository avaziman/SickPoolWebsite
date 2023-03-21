import { SickResult } from "./bindings/SickResult";
import { TableQuerySort } from "./bindings/TableQuerySort";
import { TableRes } from "./bindings/TableRes";
import { TimestampInfo } from "./bindings/TimestampInfo";

const { REACT_APP_API_URL } = process.env;

export function GetResult<Type>(url: string, coin: string): Promise<Type> {
    return new Promise((resolve, rej) => {
        fetch(`${REACT_APP_API_URL}/${url}?coin=${coin}`)
            .then(res => {
                if (!res.ok) {
                    return rej(res.statusText);
                } else {
                    return res.json();
                }
            })
            .then(res => {
                let api_res = res as SickResult<Type>;
                if (!api_res) {
                    return rej("Bad request")
                }

                if (api_res.error) {
                    return rej(api_res.error)
                } else if (api_res.result) {
                    return resolve(api_res.result)
                } else {
                    return rej("unexpected result.")
                }
            })
            .catch(e => rej(e));
    })
}

export function GetTableResult<Type>(url: string, coin: string, sort: TableQuerySort): Promise<TableRes<Type>> {
    return GetResult<TableRes<Type>>
        (url, `${coin}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.sortby}&sortdir=${sort.sortdir}`);
}

export function GetTimestampsFromRes(tsinfo: TimestampInfo) {
    const start = tsinfo.start as unknown as number;
    const interval = tsinfo.interval as unknown as number;
    const amount = tsinfo.amount as unknown as number;

    const timestamps = Array.from({ length: amount },
        (_, i) => start + (i * interval));
    return timestamps;
}
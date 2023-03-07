import { Sort, TableResult } from "./SortableTable";

const { REACT_APP_API_URL } = process.env;

interface ApiResult<Type> {
    error: any;
    result: Type;
}

export interface TimestampInfo {
    start: number;
    interval: number;
    amount: number;
}

export interface ChartResult<Type> {
    timestamps: TimestampInfo;
    values: Type;
}

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
                let api_res = res as ApiResult<Type>;
                if (!api_res) {
                    return rej("Bad request")
                }

                if (api_res.error) {
                    return rej(api_res.error)
                } else {
                    return resolve(api_res.result)
                }
            })
            .catch(e => console.log(e));
    })
}

export function GetTableResult<Type>(url: string, coin: string, sort: Sort): Promise<TableResult<Type>> {
    return GetResult<TableResult<Type>>
        (url, `${coin}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`);
}

export function GetTimestampsFromRes(tsinfo: TimestampInfo) {
    const start = tsinfo.start;
    const interval = tsinfo.interval;
    const amount = tsinfo.amount;

    const timestamps = Array.from({ length: amount }, (_, i) => start + (i * interval));
    return timestamps;
}
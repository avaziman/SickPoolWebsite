import { useState, useMemo } from "react";

export interface Fetcher {
    url: string,
    process_res(p: any): Promise<Processed[]>;
}

export interface Processed {
    timestamps: number[];
    values: number[];
}

export function DataFetcher(props: Fetcher): Promise<Processed[]> {
    return new Promise((resolve, rej) => {
        fetch(props.url)
            .then((res: Response) => {
                if (!res.ok) {
                    rej(res.statusText);
                } else {
                    return res.json();
                }
            })
            .then(res => {
                if (!res) return;
                if (res.error) { rej(res.err); }
                else {
                    resolve(props.process_res(res))
                }
            })
            .catch(err => {
                console.log(err);
                rej(err.message)
            });
    });
}
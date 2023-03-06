export interface Fetcher {
    url: string,
    process_res(p: any): Promise<Processed>;
}

export interface Processed {
    timestamps: number[];
    datasets: ChartDataSet[]; // possible multiple datasets
}

export interface ChartDataSet{
    name: string,
    borderColor: string,
    values: number[]
}

export function DataFetcher(props: Fetcher): Promise<Processed> {
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
                    resolve(props.process_res(res));
                }
            })
            .catch(err => {
                console.log(err);
                rej(err.message)
            });
    });
}

export interface TimestampInfo {
    start: number;
    interval: number;
    amount: number;
}

export function GetTimestampsFromRes(res: any) {
    const tsinfo = res.result.timestamps as TimestampInfo;
    const start = tsinfo.start;
    const interval = tsinfo.interval;
    const amount = tsinfo.amount;

    const timestamps = Array.from({ length: amount }, (_, i) => start + (i * interval));
    return timestamps;
}

export function ProcessStats(res: any, title: string): Promise<Processed> {
    return new Promise((resolve, rej) => {
        const timestamps = GetTimestampsFromRes(res)
        
        const processed: Processed = {
            timestamps: timestamps,
            datasets: [
                {
                    name: title,
                    borderColor: 'rgb(27, 121, 247)',
                    values: res.result.values
                }]
        }
        resolve(processed);
    })
}

import { GetResult, GetTimestampsFromRes as GetTimestampsFromInfo } from "./api";
import { HistoryResult } from "./bindings/HistoryResult";

export interface Fetcher {
    url: string,
    coin: string,
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

export function SingleChartFetcher(props: Fetcher): Promise<Processed> {
    return new Promise((resolve, rej) => {
        GetResult<HistoryResult<number[]>>(props.url, props.coin)
            .then(res => {
                resolve(props.process_res(res));
            })
            .catch(err => {
                console.log(err);
                rej(err.message)
            });
    });
}

export function ProcessSingleChart(res: HistoryResult<number[]>, title: string): Promise<Processed> {
    return new Promise((resolve, rej) => {
        const timestamps = GetTimestampsFromInfo(res.timestamps)
        const processed: Processed = {
            timestamps: timestamps,
            datasets: [
                {
                    name: title,
                    borderColor: 'rgb(27, 121, 247)',
                    values: res.values
                }]
        }
        resolve(processed);
    })
}

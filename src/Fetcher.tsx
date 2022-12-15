import { DataFetcher, Processed } from './LoadableChart';
import { StatsHistory } from './Solver';
const { REACT_APP_API_URL } = process.env;

// export function minerStatsFetcher(type: string, coin_symbol: string, address?: string): Promise<Processed[]> {
//     let url = `${REACT_APP_API_URL}/${type}?coin=${coin_symbol}&address=${address}`;

//     if (!address) return new Promise((resolve, rej) => { rej() });

//     return DataFetcher({
//         url: url,
//         process_res: (res) => {
//             return new Promise((resolve, rej) => {
//                 const timestamps: number[] = res.result.map((i: StatsHistory) => i.time);

//                 resolve([
//                     { timestamps: timestamps, values: res.result.map((i: StatsHistory) => i.averageHr) },
//                     { timestamps: timestamps, values: res.result.map((i: StatsHistory) => i.currentHr) },
//                     { timestamps: timestamps, values: res.result.map((i: StatsHistory) => i.invalidShares) },
//                     { timestamps: timestamps, values: res.result.map((i: StatsHistory) => i.staleShares) },
//                     { timestamps: timestamps, values: res.result.map((i: StatsHistory) => i.validShares) },
//                 ]);
//                 // console.log('resolved', [processed])
//             })
//         }
//     });
// }
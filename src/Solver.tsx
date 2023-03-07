import './solver.css'
import { useEffect, useState, useMemo, useCallback } from 'react';
import { hrToText, toLatin } from './utils';
import { useParams } from 'react-router-dom';
import ChartSVG from './components/Icon/ChartFull'
import SortableTable, { Column, Sort, TableResult } from './SortableTable';
import ToCoin from './CoinMap';
import SickChart from './SickChart';
import { ChartResult, GetResult, GetTableResult, GetTimestampsFromRes, TimestampInfo } from './api';

const COLUMNS: Column[] = [
    {
        header: 'name',
    },
    {
        header: 'current hashrate',
        headerShort: 'c. hashrate',
        sortBy: 'currentHr',
    },
    {
        header: 'average hashrate',
        headerShort: 'a. hashrate',
        sortBy: 'averageHr',
    },
    {
        header: 'valid shares',
        headerShort: 'v. shares',
        // sortBy: 'worker-count'
        sortBy: 'validShares',
    },
    {
        header: 'stale shares',
        headerShort: 's. shares',
        sortBy: 'staleShares',

        // sortBy: 'join-time'
    },
    {
        header: 'invalid shares',
        headerShort: 'i. shares',
        sortBy: 'invalidShares',

        // sortBy: 'join-time'
    }
]


interface Balance {
    mature: number;
    immature: number;
}

interface SolverOverview {
    balance: Balance;
    address: string;
    identity?: string;
}

export interface StatsHistoryValues {
    averageHashrate: number[];
    currentHashrate: number[];
    invalidShares: number[];
    staleShares: number[];
    validShares: number[];
}

interface StatsHistory {
    values: StatsHistoryValues;
    timestamps: TimestampInfo;
}

interface WorkerStats {
    worker: string,
    averageHashrate: number;
    currentHashrate: number;
    invalidShares: number;
    staleShares: number;
    validShares: number;
}

interface WorkerHistory {
    time: number;
    workers: number;
}

interface WorkersOverview {
    active: number;
    inactive: number;
}

interface SolverProps {
    isDarkMode: boolean;
    lastSearched: string[];
    setLastSearched: (a: string[]) => void;
}

function LoadWorkers(coin_symbol: string, address: string, setWorkerOverview: any, sort: Sort, oldData?: TableResult<WorkerStats>): Promise<TableResult<WorkerStats>> {
    if (!oldData) {
        return GetTableResult<WorkerStats>('miner/workers', coin_symbol + `&address=${address}`, sort)
            .then(result => {
                let active: number = result.entries.filter(i => i.currentHashrate > 0).length;

                setWorkerOverview({ active: active, inactive: result.entries.length - active })

                return result;
            });
    } else {
        return Promise.resolve({
                total: oldData.total,
                entries: [...oldData.entries].sort((a: any, b: any) => (a[sort.by] > b[sort.by]) ? 1 : -1)
        });
    }
}

export default function Solver(props: SolverProps) {
    const { address, coinPretty } = useParams();
    const coin_symbol: string = coinPretty ? ToCoin(coinPretty).symbol : 'unknown';

    const isWorker = address && address.includes('.');
    const columns = useMemo(() => COLUMNS, []);

    const [overviewRes, setOverviewRes] = useState<SolverOverview>({
        address: address ? address : "unknown",
        balance: {
            immature: 0,
            mature: 0
        }
    });


    const [statsRes, setStatsRes] = useState<StatsHistoryValues>();
    const [timestamps, setTimestamps] = useState<number[]>([]);
    
    const [error, setError] = useState<string>();
    const [workerOverview, setWorkerOverview] = useState<WorkersOverview>({ active: 0, inactive: 0 });
    const LoadWorkersCb =
        useCallback((sort: Sort, oldData?: TableResult<WorkerStats>) => LoadWorkers(coin_symbol, address ?? '', setWorkerOverview, sort, oldData), [coin_symbol, address]);

    useEffect(() => {
        setOverviewRes({
            address: address ? address : "unknown",
            balance: {
                immature: 0,
                mature: 0
            }
        });

        if (address && props.lastSearched.indexOf(address) === -1) {
            props.setLastSearched([address].concat(props.lastSearched))
        }

        GetResult<ChartResult<StatsHistoryValues>>('miner/statsHistory', coin_symbol + `&address=${address}`)
            .then(res => {
                    setTimestamps(GetTimestampsFromRes(res.timestamps))
                    setStatsRes(res.values);
            }).catch(err => {
                setError('Failed to load chart');
            });

        GetResult<SolverOverview>('solver/overview', coin_symbol + `&address=${address}`)
            .then(res => {
                setOverviewRes(res)
            }).catch(err => {

            });
    }, [address, coin_symbol, /* props */]);

    // useEffect(() => {
    //     fetch(`${REACT_APP_API_URL}/miner/workerHistory?coin=${coin_symbol}&address=${address}`)
    //         .then(res => res.json())
    //         .then(res => {
    //             let workerDataTs = [];
    //             let j = 0;

    //             setWorkerData(workerDataTs);
    //         }).catch((err) => {
    //             // setShareErr("Failed to load chart :(");
    //             console.log(err)
    //         });
    // }, [statsLabels]);

    return (
        <div>
            <div className="stats-container">
                <p className="stats-title miner-title">
                    <p>Miner Dashboard</p>
                </p>
                <p className="stats-title address-title">
                    <p>{overviewRes?.address} {overviewRes?.identity && `AKA ${overviewRes?.identity}`}</p>
                </p>
                <div className="stats-card-holder">
                    <div className="nested-card">
                        <h2>Hashrate<ChartSVG /></h2>
                        <div className="stats-sub-card-holder">
                            <div className="stats-sub-card">
                                <h4>Current</h4>
                                <h3>{hrToText(statsRes?.currentHashrate.at(-1) ?? 0)}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Average 6HR</h4>
                                <h3>{hrToText(statsRes?.averageHashrate.at(-1) ?? 0)}</h3>
                            </div>
                        </div>
                    </div>
                    {!isWorker &&
                        <div className="nested-card">
                            <h2>Balance{/*<ChartSVG />*/}</h2>
                            <div className="stats-sub-card-holder">
                                <div className="stats-sub-card">
                                    <h4>Immature</h4>
                                    <h3>{overviewRes ?
                                        (overviewRes.balance.immature / 1e8).toLocaleString(undefined, { maximumFractionDigits: 5 }) : 0}</h3>
                                </div>
                                <div className="stats-sub-card">
                                    <h4>Mature</h4>
                                    <h3>{overviewRes ?
                                        (overviewRes.balance.mature / 1e8).toLocaleString(undefined, { maximumFractionDigits: 5 }) : 0}</h3>
                                </div>
                            </div>
                        </div>
                    }
                    {!isWorker &&
                        <div className="nested-card">
                            <h2>Workers<ChartSVG /></h2>
                            <div className="stats-sub-card-holder">
                                <div className="stats-sub-card">
                                    <h4>Active</h4>
                                    <h3>{workerOverview.active}</h3>
                                </div>
                                <div className="stats-sub-card">
                                    <h4>Inactive</h4>
                                    <h3>{workerOverview.inactive}</h3>
                                </div>
                            </div>
                        </div>
                    }
                    <div className="nested-card">
                        <h2>Shares (5m)<ChartSVG /></h2>
                        <div className="stats-sub-card-holder">
                            <div className="stats-sub-card">
                                <h4>Accepted</h4>
                                <h3>{statsRes?.validShares.at(-1) ?? 0}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Stale</h4>
                                <h3>{statsRes?.staleShares.at(-1) ?? 0}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Invalid</h4>
                                <h3>{statsRes?.invalidShares.at(-1) ?? 0}</h3>
                            </div>
                        </div>
                    </div>

                </div>
                <SickChart type="line" isDarkMode={props.isDarkMode} title="Hashrate (24h)" precision={0}
                    processedData={{
                        timestamps: timestamps,
                        datasets: [
                            // TODO HANDLE UNDEFINED (LOADING OR SMT)
                            { name: 'Hashrate', borderColor: 'rgb(27, 121, 247)', values: statsRes?.currentHashrate ?? [] },
                            { name: 'Average Hashrate', borderColor: '#21ff5c', values: statsRes?.averageHashrate ?? [] }
                        ]
                    }} error={error} toText={hrToText} />
                <SickChart type="bar" isDarkMode={props.isDarkMode} title="Shares (24h)" precision={0}
                    processedData={{
                        timestamps: timestamps,
                        datasets: [
                            { name: 'Valid Shares', borderColor: 'rgb(27, 121, 247)', values: statsRes?.validShares ?? [] },
                            { name: 'Stale Shares', borderColor: '#ff8e00', values: statsRes?.staleShares ?? [] },
                            { name: 'Invalid Shares', borderColor: '#FFDB58', values: statsRes?.invalidShares ?? [] }
                        ]
                    }} error={error} toText={toLatin} />

                <p className="stats-title">Worker List</p>
                <SortableTable id="worker-table" columns={columns} showEntry={ShowEntry} loadTable={LoadWorkersCb} isPaginated={false} />
            </div>
        </div>
    )
}
// TODO: maybe add graph icon to hashrate & shares to pop the graph

function ShowEntry(worker: WorkerStats) {
    return (
        <tr key={worker.worker}>
            <td>{worker.worker}</td>
            <td>{hrToText(worker.currentHashrate)}</td>
            <td>{hrToText(worker.averageHashrate)}</td>
            <td>{worker.validShares}</td>
            <td>{worker.staleShares}</td>
            <td>{worker.invalidShares}</td>
            {/* <td>{solver.worker_count}</td>
            <td>{timeToText(Date.now() - solver.joined * 1000)} ago</td> */}
        </tr>
    )
}
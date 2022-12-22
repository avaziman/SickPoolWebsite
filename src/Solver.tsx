import { useEffect, useState, useMemo, useCallback } from 'react';
import { hrToText, toLatin } from './utils';
import { useParams } from 'react-router-dom';
import './solver.css'
import ChartSVG from './components/Icon/Chart'
import SortableTable, { Column, Sort, TableResult, ApiTableResult } from './SortableTable';
import ToCoin from './CoinMap';
import SickChart from './SickChart';

const { REACT_APP_API_URL } = process.env;
const COLUMNS: Column[] = [
    {
        header: 'name',
    },
    {
        header: 'current hashrate',
        sortBy: 'currentHr',
    },
    {
        header: 'average hashrate',
        sortBy: 'averageHr',
    },
    {
        header: 'valid shares',
        // sortBy: 'worker-count'
        sortBy: 'validShares',
    },
    {
        header: 'stale shares',
        sortBy: 'staleShares',

        // sortBy: 'join-time'
    },
    {
        header: 'invalid shares',
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

export interface StatsHistory {
    averageHr: number;
    currentHr: number;
    invalidShares: number;
    staleShares: number;
    time: number;
    validShares: number;
}

interface WorkerStats {
    worker: string,
    stats: StatsHistory;
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
}

function LoadWorkers(coin_symbol: string, address: string, setWorkerOverview: any, sort: Sort, oldData?: TableResult<WorkerStats>): Promise<ApiTableResult<WorkerStats>> {
    if (!oldData) {
        return fetch(`${REACT_APP_API_URL}/miner/workers?coin=${coin_symbol}&address=${address}`)
            .then(res => res.json()).then(res => {
                let result = res.result as TableResult<WorkerStats>;
                let active: number = result.entries.filter(i => i.stats.currentHr > 0).length;

                setWorkerOverview({ active: active, inactive: result.entries.length - active })

                return res;
            });
    } else {
        return Promise.resolve({
            result: {
                total: oldData.total,
                entries: [...oldData.entries].sort((a: any, b: any) => (a[sort.by] > b[sort.by]) ? 1 : -1)
            },
            error: null
        });
    }
}

export default function Solver(props: SolverProps) {
    const { address, coinPretty } = useParams();
    const coin_symbol: string = coinPretty ? ToCoin(coinPretty).symbol : 'unknown';

    const isWorker = address && address.includes('.');
    const columns = useMemo(() => COLUMNS, []);
    console.log(address);

    const [overviewRes, setOverviewRes] = useState<SolverOverview>({
        address: address ? address : "unknown",
        balance: {
            immature: 0,
            mature: 0
        }
    });

    const [statsRes, setStatsRes] = useState<StatsHistory[]>([]);
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

        fetch(`${REACT_APP_API_URL}/miner/statsHistory?coin=${coin_symbol}&address=${address}`)
            .then(res => res.json())
            .then(res => {
                if (res.result !== null) {
                    setStatsRes(res.result as StatsHistory[]);
                }
            }).catch(err => {
                setError('Failed to load chart');
            });

        fetch(`${REACT_APP_API_URL}/solver/overview?coin=${coin_symbol}&address=${address}`)
            .then(res => res.json())
            .then(res => {
                if (res.result !== null) {
                    setOverviewRes(res.result)
                }
            }).catch(err => {

            });
    }, [address, coin_symbol]);

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
                                <h3>{hrToText(statsRes.at(-1)?.currentHr ?? 0)}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Average 6HR</h4>
                                <h3>{hrToText(statsRes.at(-1)?.averageHr ?? 0)}</h3>
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
                                <h3>{statsRes.at(-1)?.validShares ?? 0}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Stale</h4>
                                <h3>{statsRes.at(-1)?.staleShares ?? 0}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Invalid</h4>
                                <h3>{statsRes.at(-1)?.invalidShares ?? 0}</h3>
                            </div>
                        </div>
                    </div>

                </div>
                <SickChart type="line" isDarkMode={props.isDarkMode} title="Hashrate (24h)"
                    processedData={{
                        timestamps: statsRes.map(i => i.time),
                        datasets: [
                            { name: 'Hashrate', borderColor: 'rgb(27, 121, 247)', values: statsRes.map(i => i.currentHr) },
                            { name: 'Average Hashrate', borderColor: '#21ff5c', values: statsRes.map(i => i.averageHr) }
                        ]
                    }} error={error} toText={hrToText} />
                <SickChart type="bar" isDarkMode={props.isDarkMode} title="Shares (24h)"
                    processedData={{
                        timestamps: statsRes.map(i => i.time),
                        datasets: [
                            { name: 'Valid Shares', borderColor: 'rgb(27, 121, 247)', values: statsRes.map(i => i.validShares) },
                            { name: 'Stale Shares', borderColor: '#ff8e00', values: statsRes.map(i => i.staleShares) },
                            { name: 'Invalid Shares', borderColor: '#FFDB58', values: statsRes.map(i => i.invalidShares) }
                        ]
                    }} error={error} toText={toLatin} />

                <p className="stats-title">Worker List</p>
                <SortableTable id="worker-table" columns={columns} showEntry={ShowEntry} loadTable={LoadWorkersCb} isPaginated={false} />
            </div>
        </div>
    );
}
// TODO: maybe add graph icon to hashrate & shares to pop the graph

function ShowEntry(worker: WorkerStats) {
    return (
        <tr>
            <td>{worker.worker}</td>
            <td>{hrToText(worker.stats.currentHr)}</td>
            <td>{hrToText(worker.stats.averageHr)}</td>
            <td>{worker.stats.validShares}</td>
            <td>{worker.stats.staleShares}</td>
            <td>{worker.stats.invalidShares}</td>
            {/* <td>{solver.worker_count}</td>
            <td>{timeToText(Date.now() - solver.joined * 1000)} ago</td> */}
        </tr>
    )
}
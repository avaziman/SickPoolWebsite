import React, { useEffect, useState } from 'react';
import { hrToText, unixTimeToClockText } from './utils.js';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartData,
    ChartOptions,
    TooltipItem,
    ChartDataset
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import './solver.css'
import ChartSVG from './components/Icon/Chart'
import ChartFullSVG from './components/Icon/ChartFull'
import HistoryChart from './HistoryChart';
import SortableTable, { Column, Sort, TableResult, ApiTableResult } from './SortableTable';
import { useMemo } from 'react';
import ToCoinSymbol from './ToCoinSymbol';
import HashrateChart from './HashrateChart';

const { REACT_APP_API_URL, REACT_APP_ADDRESS_LEN } = process.env;
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

interface StatsHistory {
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

export default function Solver() {
    const { address, coinPretty } = useParams();
    const coin_symbol: string = coinPretty ? ToCoinSymbol(coinPretty) : 'unknown';

    const isWorker = address && address.includes('.');
    const columns = useMemo(() => COLUMNS, []);

    const [overviewRes, setOverviewRes] = useState<SolverOverview>({
        address: address ? address : "unknown",
        balance: {
            immature: 0,
            mature: 0
        }
    });
    const [statsRes, setStatsRes] = useState<StatsHistory[]>([{
        averageHr: 0,
        currentHr: 0,
        invalidShares: 0,
        staleShares: 0,
        time: 0,
        validShares: 0,
    }]);
    const [workerOverview, setWorkerOverview] = useState<WorkersOverview>({ active: 0, inactive: 0 });

    const [statsLabels, setStatsLabels] = useState<number[]>([1]);
    const [statsErr, setStatsErr] = useState<string | undefined>(undefined);

    // const [workerData, setWorkerData] = useState<WorkerHistory[] | undefined>(undefined);

    // const [balanceLabels, setBalanceLabels] = useState([]);
    // const [balanceError, setBalanceError] = useState(null);

    const shareChartOptions: ChartOptions = {
        plugins: { legend: { display: false } },
        layout: { padding: {} },
        scales: {
            y: {
                ticks: {
                    // callback: hrToText,
                    color: "white",
                    font: {
                        size: 18
                    }
                },
                grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                }
            },
            y1: {
                beginAtZero: true,
                min: 0,
                max: workerOverview.active * 2,
                type: 'linear',
                display: true,
                position: 'right',

            },
            x: {
                stacked: true,
                ticks: {
                    callback: unixTimeToClockText,
                    color: "white",
                    font: {
                        size: 18
                    }
                }, grid: {
                    color: "rgba(255, 255, 255, 0.1)",
                }
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };


    useEffect(() => {

        fetch(`${REACT_APP_API_URL}/solver/overview?coin=${coin_symbol}&address=${address}`)
            .then(res => res.json())
            .then(res => {
                if (res.result !== null) {
                    setOverviewRes(res.result)
                }
            }).catch(err => {

            });

        fetch(`${REACT_APP_API_URL}/miner/statsHistory?coin=${coin_symbol}&address=${address}`)
            .then(res => res.json())
            .then(res => {
                if (res.result !== null) {
                    setStatsRes(res.result);
                    setStatsLabels(res.result.map((a: StatsHistory) => a.time));
                } else if (res.error !== null) {
                    setStatsErr(`Failed to fetch stats: ${res.error}`);
                }
            })
            .catch(err => {
                // setHrErr("Failed to load chart :(");
            });
    }, []);

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

    function LoadWorkers(sort: Sort, oldData?: TableResult<WorkerStats>): Promise<ApiTableResult<WorkerStats>> {
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
                    entries: oldData.entries.sort((a: any, b: any) => (a[sort.by] > b[sort.by]) ? 1 : -1)
                },
                error: null
            });
        }
    }

    // let hashrate: number[] | undefined = useMemo(() => statsRes?.map(s => s.currentHr), []);

    const hrChartData: ChartData<"line"> = {
        labels: statsLabels,
        datasets: [
            {
                type: 'line',
                label: 'Hashrate',
                data: statsRes.map(s => s.currentHr),
                borderColor: "rgb(27, 121, 247)",
                backgroundColor: "rgba(27, 121, 247, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 0,
                pointRadius: 0,
                tension: 0.35
            },
            {
                type: 'line',
                label: 'Average 6h hashrate',
                data: statsRes.map(s => s.averageHr),
                borderColor: "#FFDB58",
                backgroundColor: "#FFDB58",
                pointBorderColor: "#fff",
                pointBorderWidth: 0,
                pointRadius: 0,
                tension: 0.35
            }
        ],
    };

    const sharesChartData /*: ChartData<>*/ = {
        labels: statsLabels,
        datasets: [
            {
                label: 'Valid shares',
                data: statsRes.map(s => s.validShares),
                backgroundColor: "rgb(27, 121, 247)",
                pointBorderColor: "#fff",
                yAxisID: 'y',
                order: 3,

            },
            {
                label: 'Stale shares',
                data: statsRes.map(s => s.staleShares),
                color: "#ff8e00",
                borderColor: "#ff8e00",
                backgroundColor: "#ff8e00",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.35,
                yAxisID: 'y',
            },
            {
                label: 'Invalid shares',
                data: statsRes.map(s => s.invalidShares),
                color: "#ff5003",
                borderColor: "#ff5003",
                backgroundColor: "#ff5003",
                pointBorderColor: "#fff",
                yAxisID: 'y',
            }
            // {
            //     type: 'line',
            //     label: 'Worker count',
            //     data: workerData,
            //     color: "#FFDB58",
            //     borderColor: "#FFDB58",
            //     backgroundColor: "#FFDB58",
            //     pointBorderColor: "#fff",
            //     pointBorderWidth: 0,
            //     pointRadius: 0,
            //     tension: 0,
            //     yAxisID: 'y1',
            //     order: 2,
            // }
        ],
    };

    // const balanceChartData = {
    //     labels: balanceLabels,
    //     datasets: [
    //         {
    //             label: 'Hashrate',
    //             data: balanceData,
    //             color: "rgba(27, 121, 247, 0.55)",
    //             borderColor: "rgb(27, 121, 247)",
    //             backgroundColor: "rgba(27, 121, 247, 1)",
    //             pointBorderColor: "#fff",
    //             pointBorderWidth: 0,
    //             pointRadius: 0,
    //             tension: 0.35
    //         },
    //     ],
    // };
    return (
        <div>
            <div className="stats-container">
                <p className="stats-title">Solver {overviewRes?.address} {overviewRes?.identity && `AKA ${overviewRes?.identity}`}</p>
                <div className="stats-card-holder">
                    <div className="nested-card">
                        <h2>Hashrate<ChartSVG /></h2>
                        <div className="stats-sub-card-holder">
                            <div className="stats-sub-card">
                                <h4>Current</h4>
                                <h3>{(statsRes && statsRes.length > 0) ? hrToText(statsRes.at(-1)?.currentHr) : "?"}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Average 6HR</h4>
                                <h3>{(statsRes && statsRes.length > 0) ? hrToText(statsRes.at(-1)?.averageHr) : "?"}</h3>
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
                                        (overviewRes.balance.immature / 1e8).toPrecision(5) : '?'}</h3>
                                </div>
                                <div className="stats-sub-card">
                                    <h4>Mature</h4>
                                    <h3>{overviewRes ?
                                        (overviewRes.balance.mature / 1e8).toPrecision(5) : '?'}</h3>
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
                                <h3>{statsRes[statsRes.length - 1].validShares}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Stale</h4>
                                <h3>{statsRes[statsRes.length - 1].staleShares}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Invalid</h4>
                                <h3>{statsRes[statsRes.length - 1].invalidShares}</h3>
                            </div>
                        </div>
                    </div>

                </div>
                <HashrateChart title="Hashrate (24h)" data={hrChartData} error={statsErr} />
                <HistoryChart type="bar" title={(isWorker ? "Shares" : "Shares & Workers") + " (24h)"} data={sharesChartData} options={shareChartOptions} error={statsErr} />
                {/* <HistoryChart title="Balance" data={balanceChartData} options={shareChartOptions} err={balanceError} /> */}
                <p className="stats-title">Worker list</p>
                <SortableTable id="worker-table" columns={columns} showEntry={ShowEntry} loadTable={LoadWorkers} isPaginated={false} />
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
            {/* <td>{hrToText(solver.hashrate)}</td>
            <td>{solver.worker_count}</td>
            <td>{timeToText(Date.now() - solver.joined * 1000)} ago</td> */}
        </tr>
    )
}
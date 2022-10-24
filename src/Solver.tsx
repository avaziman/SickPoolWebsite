import { useEffect, useState, useMemo } from 'react';
import { hrToText, toLatin, unixTimeToClockText } from './utils';
import { useParams } from 'react-router-dom';
import './solver.css'
import ChartSVG from './components/Icon/Chart'
import SortableTable, { Column, Sort, TableResult, ApiTableResult } from './SortableTable';
import ToCoin from './CoinMap';
import HashrateChart from './HashrateChart';
import { ChartOptions, ChartData } from 'chart.js'

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

interface SolverProps {
    isDarkMode: boolean;
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
    
    const [statsRes, setStatsRes] = useState<StatsHistory[]>([]);
    const [workerOverview, setWorkerOverview] = useState<WorkersOverview>({ active: 0, inactive: 0 });

    const [statsLabels, setStatsLabels] = useState<Date[]>([]);
    const [statsErr, setStatsErr] = useState<string | undefined>(undefined);

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
                    callback: unixTimeToClockText as any,
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
                    setStatsLabels(res.result.map((a: StatsHistory) => new Date(a.time * 1000)));
                    setStatsRes(res.result);
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

    const hrChartData: ChartData<"line"> = {
        datasets: [
            {
                type: 'line',
                label: 'Hashrate',
                data: useMemo(() => statsRes.map(s => s.currentHr), [statsRes]),
                borderColor: "rgb(27, 121, 247)",
                backgroundColor: "rgba(27, 121, 247, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 0,
                pointRadius: 0,
                tension: 0.15,
                normalized: true
            },
            {
                type: 'line',
                label: 'Average 6h hashrate',
                data: useMemo(() => statsRes.map(s => s.averageHr), [statsRes]),
                borderColor: "#21ff5c",
                backgroundColor: "#21ff5c",
                pointBorderColor: "#fff",
                pointBorderWidth: 0,
                pointRadius: 0,
                tension: 0.15,
                normalized: true
            }
        ],
    };

    const sharesChartData /*: ChartData<>*/ = {
        labels: statsLabels,
        datasets: [
            {
                label: 'Valid shares',
                data: useMemo(() => statsRes.map(s => s.validShares), [statsRes]),
                backgroundColor: "rgb(27, 121, 247)",
                pointBorderColor: "#fff",
                yAxisID: 'y',
                order: 3,

            },
            {
                label: 'Stale shares',
                data: useMemo(() => statsRes.map(s => s.staleShares), [statsRes]),
                color: "#ff8e00",
                borderColor: "#ff8e00",
                backgroundColor: "#ff8e00",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                yAxisID: 'y',
            },
            {

                label: 'Invalid shares',
                data: useMemo(() => statsRes.map(s => s.invalidShares), [statsRes]),
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
                <p className="stats-title">Solver - {overviewRes?.address} {overviewRes?.identity && `AKA ${overviewRes?.identity}`}</p>
                <div className="stats-card-holder">
                    <div className="nested-card">
                        <h2>Hashrate<ChartSVG /></h2>
                        <div className="stats-sub-card-holder">
                            <div className="stats-sub-card">
                                <h4>Current</h4>
                                <h3>{ hrToText(statsRes[statsRes.length -1]?.currentHr ?? 0)}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Average 6HR</h4>
                                <h3>{hrToText(statsRes[statsRes.length - 1]?.averageHr ?? 0)}</h3>
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
                {/* <HashrateChart timestamps={statsLabels} type="line" isDarkMode={props.isDarkMode} title="Hashrate (24h)" data={hrChartData} error={statsErr} toText={ hrToText} />
                <HashrateChart timestamps={statsLabels} type="bar" isDarkMode={props.isDarkMode} title={(isWorker ? "Shares" : "Shares & Workers") + " (24h)"} data={sharesChartData} toText={toLatin} error={statsErr} />
                <HistoryChart title="Balance" data={balanceChartData} options={shareChartOptions} err={balanceError} /> */}
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
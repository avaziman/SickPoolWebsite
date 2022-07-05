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
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import './solver.css'
import ChartSVG from './components/Icon/Chart'
import ChartFullSVG from './components/Icon/ChartFull'
import HistoryChart from './HistroyChart.jsx';
import SortableTable from './SortableTable.jsx';
import { useMemo } from 'react';

const { REACT_APP_API_URL, REACT_APP_ADDRESS_LEN } = process.env;
const COLUMNS = [
    {
        header: 'name',
        sortBy: null,
    },
    {
        header: 'current hashrate',
        sortBy: null,
    },
    {
        header: 'average hashrate',
        sortBy: null,
    },
    {
        header: 'valid shares',
        // sortBy: 'worker-count'
        sortBy: null,
    },
    {
        header: 'stale shares',
        sortBy: null,

        // sortBy: 'join-time'
    },
    {
        header: 'invalid shares',
        sortBy: null,

        // sortBy: 'join-time'
    }
]

const hrChartOptions = {
    plugins: {
        legend: { display: false },
        tooltip: {
            intersect: false,
            mode: 'index',
            backgroundColor: 'black',
            displayColors: true,
            callbacks: {
                label: function (context) {
                    return context.dataset.label + ': ' + hrToText(parseFloat(context.parsed.y));
                }
            }
        }
    },
    layout: { padding: {} },
    scales: {
        y: {
            ticks: {
                callback: hrToText,
                color: "white",
                font: {
                    size: 18
                }
            },
            grid: {
                color: "rgba(255, 255, 255, 0.1)",
            }
        },
        x: {
            ticks: {
                callback: unixTimeToClockText,
                color: "white",
                font: {
                    size: 18
                }
            },
            grid: {
                color: "rgba(255, 255, 255, 0.1)",
            }
        }
    },
    interaction: {
        intersect: false,
        mode: 'index',
    },
};

export default function Solver(props) {
    const { addr } = useParams();
    const isWorker = addr.includes('.');
    const columns = useMemo(() => COLUMNS, []);

    const [labels, setLabels] = useState([]);
    const [hrData, setHrData] = useState(null);
    const [hrAvgData, setAvgHrData] = useState(null);
    const [hrErr, setHrErr] = useState(null);
    const [shareErr, setShareErr] = useState(null);

    const [workerData, setWorkerData] = useState([]);
    const [maxWorkers, setMaxWorkers] = useState(0);

    const [validShareData, setValidShareData] = useState(null);
    const [staleShareData, setStaleShareData] = useState(null);
    const [invalidShareData, setInvalidShareData] = useState(null);
    const [lastShares, setLastShares] = useState(['?', '?', '?']);

    const [balanceData, setBalanceData] = useState(null);
    // const [balanceLabels, setBalanceLabels] = useState([]);
    // const [balanceError, setBalanceError] = useState(null);

    const shareChartOptions = {
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
                max: maxWorkers * 2,
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
        fetch(`${REACT_APP_API_URL}/miner/statsHistory?address=${addr}`)
            .then(res => res.json())
            .then(res => {
                setLabels(res.result.map(a => a.time));

                setHrData(res.result.map(a => a.currentHr));
                setAvgHrData(res.result.map(a => a.averageHr));

                setValidShareData(res.result.map(a => a.validShares));
                setStaleShareData(res.result.map(a => a.staleShares));
                setInvalidShareData(res.result.map(a => a.invalidShares));

                let [lastValid, lastStale, lastInvalid] = [0, 0, 0];
                for (let i = Math.max(res.result.length - 12, 0); i < res.result.length; i++) {
                    lastValid += res.result[i].validShares;
                    lastStale += res.result[i].staleShares;
                    lastInvalid += res.result[i].invalidShares;
                }
                setLastShares([lastValid, lastStale, lastInvalid]);
            })
            .catch(err => {
                setHrErr("Failed to load chart :(");
            });

        fetch(`${REACT_APP_API_URL}/solver/balance?address=${addr}`)
            .then(res => res.json())
            .then(res => {
                // setBalanceLabels(res.result.map(a => a.time))
                // setBalanceData(res.result.map(a => a.balance))
                setBalanceData(res.result)
                console.log(res.result);
            }).catch(err => {
                // setBalanceError("Failed to load chart :(");
            })
    }, []);

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/miner/workerHistory?address=${addr}`)
            .then(res => res.json())
            .then(res => {
                let workerDataTs = [];
                let j = 0;
                for (const label of labels) {
                    if (res.result[j].workers > maxWorkers) {
                        setMaxWorkers(res.result[j].workers);
                    }
                    if (res.result[j + 1] && res.result[j + 1].time <= label) {

                        j = Math.min(j + 1, res.result.length - 1);
                    }

                    workerDataTs.push(res.result[j].workers);
                }
                setWorkerData(workerDataTs);
            }).catch((err) => { console.log(err) });
    }, [labels]);

    const hrChartData = {
        labels: labels,
        datasets: [
            {
                label: 'Hashrate',
                data: hrData,
                color: "rgba(27, 121, 247, 0.55)",
                borderColor: "rgb(27, 121, 247)",
                backgroundColor: "rgba(27, 121, 247, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 0,
                pointRadius: 0,
                tension: 0.35
            },
            {
                label: 'Average 6h hashrate',
                data: hrAvgData,
                color: "#FFDB58",
                borderColor: "#FFDB58",
                backgroundColor: "#FFDB58",
                pointBorderColor: "#fff",
                pointBorderWidth: 0,
                pointRadius: 0,
                tension: 0.35
            }
        ],
    };

    const sharesChartData = {
        labels: labels,
        datasets: [
            {
                type: 'bar',
                label: 'Valid shares',
                data: validShareData,
                backgroundColor: "rgb(27, 121, 247)",
                pointBorderColor: "#fff",
                yAxisID: 'y',
                order: 3,

            },
            {
                type: 'bar',
                label: 'Stale shares',
                data: staleShareData,
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
                type: 'bar',
                label: 'Invalid shares',
                data: invalidShareData,
                color: "#ff5003",
                borderColor: "#ff5003",
                backgroundColor: "#ff5003",
                pointBorderColor: "#fff",
                yAxisID: 'y',
            },
            {
                type: 'line',
                label: 'Worker count',
                data: workerData,
                color: "#FFDB58",
                borderColor: "#FFDB58",
                backgroundColor: "#FFDB58",
                pointBorderColor: "#fff",
                pointBorderWidth: 0,
                pointRadius: 0,
                tension: 0,
                yAxisID: 'y1',
                order: 2,
            }
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
                <p className="stats-title">Solver {addr}</p>
                <div className="stats-card-holder">
                    <div className="nested-card">
                        <h2>Hashrate<ChartSVG /></h2>
                        <div className="stats-sub-card-holder">
                            <div className="stats-sub-card">
                                <h4>Current</h4>
                                <h3>{!hrData ? "?" : hrToText(hrData[hrData.length - 1])}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Average 6HR</h4>
                                <h3>{!hrAvgData ? "?" : hrToText(hrAvgData[hrAvgData.length - 1])}</h3>
                            </div>
                        </div>
                    </div>
                    <div className="nested-card">
                        <h2>Shares (1h)<ChartSVG /></h2>
                        <div className="stats-sub-card-holder">
                            <div className="stats-sub-card">
                                <h4>Accepted</h4>
                                <h3>{lastShares[0]}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Stale</h4>
                                <h3>{lastShares[1]}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Invalid</h4>
                                <h3>{lastShares[2]}</h3>
                            </div>
                        </div>
                    </div>
                    {!isWorker &&
                        <div className="nested-card">
                            <h2>Workers<ChartSVG /></h2>
                            <div className="stats-sub-card-holder">
                                <div className="stats-sub-card">
                                    <h4>Online</h4>
                                    <h3>{workerData.length == 0 ? "?" : workerData[workerData.length - 1]}</h3>
                                </div>
                                <div className="stats-sub-card">
                                    <h4>Offline</h4>
                                    <h3>{workerData.length == 0 ? "?" :
                                        maxWorkers - workerData[workerData.length - 1]}</h3>
                                </div>
                            </div>
                        </div>
                    }
                    {!isWorker &&
                        <div className="nested-card">
                            <h2>Balance{/*<ChartSVG />*/}</h2>
                            <div className="stats-sub-card-holder">
                                <div className="stats-sub-card">
                                    <h4>Immature</h4>
                                    <h3>{(balanceData && balanceData.immature != null) ? balanceData.immature : '?'}</h3>
                                </div>
                                <div className="stats-sub-card">
                                    <h4>Mature</h4>
                                    <h3>?</h3>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                <HistoryChart title="Hashrate (24h)" data={hrChartData} options={hrChartOptions} err={hrErr} />
                <HistoryChart title={(isWorker ? "Shares" : "Shares & Workers") + " (24h)"} data={sharesChartData} options={shareChartOptions} err={shareErr} />
                {/* <HistoryChart title="Balance" data={balanceChartData} options={shareChartOptions} err={balanceError} /> */}
                <p className="stats-title">Worker list</p>
                <SortableTable columns={columns} entryName="Worker" showEntry={ShowEntry} defaultSortBy={columns[1].sortBy} section="miner" isPaginated={false} address={addr} />
            </div>
        </div>
    );
}
// TODO: maybe add graph icon to hashrate & shares to pop the graph

function ShowEntry(worker) {
    console.log('f' + worker)
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

export { hrChartOptions };
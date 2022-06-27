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
const { REACT_APP_API_URL } = process.env;

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
                color: "#243240"
            }
        },
        x: {
            ticks: {
                color: "white",
                font: {
                    size: 18
                }
            }
        }
    },
    interaction: {
        intersect: false,
        mode: 'index',
    },
};

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
                color: "#243240"
            }
        },
        x: {
            ticks: {
                color: "white",
                font: {
                    size: 18
                }
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
    console.log(addr);

    const [labels, setLabels] = useState([]);
    const [hrData, setHrData] = useState([]);
    const [hrAvgData, setAvgHrData] = useState([]);
    const [hrErr, setHrErr] = useState(null);
    const [shareErr, setShareErr] = useState(null);


    const [validShareData, setValidShareData] = useState([]);
    const [staleShareData, setStaleShareData] = useState([]);
    const [invalidShareData, setInvalidShareData] = useState([]);
    const [lastShares, setLastShares] = useState(['?', '?', '?']);


    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/miner/hashrateHistory?address=${addr}`)
            .then(res => res.json())
            .then(res => {
                setLabels(res.result.map(a => unixTimeToClockText(a[0])));
                setHrData(res.result.map(a => a[1]));
                setAvgHrData(res.result.map(a => a[2]));
            })
            .catch(err => {
                setHrErr("Failed to load chart :(");
            });

        fetch(`${REACT_APP_API_URL}/miner/shareHistory?address=${addr}`)
            .then(res => res.json())
            .then(res => {
                const validShares = Array(res.result.length);
                const staleShares = Array(res.result.length);
                const invalidShares = Array(res.result.length);

                // 12 * 5minutes = 1hr
                let lastHourI = res.result.length - 12 - 1;

                let [lastValid, lastStale, lastInvalid] = [0, 0, 0];
                for (let i = lastHourI; i < res.result.length; i++) {
                    lastValid += res.result[i][1];
                    lastStale += res.result[i][2];
                    lastInvalid += res.result[i][3];
                }
                setLastShares([lastValid, lastStale, lastInvalid]);
                for (let i = 0; i < res.result.length; i++) {
                    validShares[i] = res.result[i][1];
                    staleShares[i] = res.result[i][2];
                    invalidShares[i] = res.result[i][3];
                }

                setValidShareData(validShares);
                setStaleShareData(staleShares);
                setInvalidShareData(invalidShares);
            }).catch(err => {
                setShareErr("Failed to load chart :(");
            });
    }, []);

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
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.35
            },
            {
                label: 'Average 6h hashrate',
                data: hrAvgData,
                color: "#FFDB58",
                borderColor: "#FFDB58",
                backgroundColor: "#FFDB58",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
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
                color: "rgba(27, 121, 247, 1)",
                borderColor: "rgb(27, 121, 247)",
                backgroundColor: "rgba(27, 121, 247, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.35
            },
            {
                type: 'bar',
                label: 'Stale shares',
                data: staleShareData,
                color: "#FFDB58",
                borderColor: "#FFDB58",
                backgroundColor: "#FFDB58",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.35
            },
            {
                type: 'bar',
                label: 'Invalid shares',
                data: invalidShareData,
                color: "#FFDB58",
                borderColor: "#FFDB58",
                backgroundColor: "#FFDB58",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 4,
                tension: 0.35
            }
        ],
    };

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
                                <h3>{hrData.length == 0 ? "?" : hrToText(hrData[hrData.length - 1])}</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Average 6HR</h4>
                                <h3>{hrAvgData.length == 0 ? "?" : hrToText(hrAvgData[hrAvgData.length - 1])}</h3>
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
                    <div className="nested-card">
                        <h2>Balance<ChartSVG /></h2>
                        <div className="stats-sub-card-holder">
                            <div className="stats-sub-card">
                                <h4>Immature</h4>
                                <h3>10 MH/s</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Mature</h4>
                                <h3>10 MH/s</h3>
                            </div>
                        </div>
                    </div>
                    <div className="nested-card">
                        <h2>Workers<ChartSVG /></h2>
                        <div className="stats-sub-card-holder">
                            <div className="stats-sub-card">
                                <h4>Online</h4>
                                <h3>10 MH/s</h3>
                            </div>
                            <div className="stats-sub-card">
                                <h4>Offline</h4>
                                <h3>10 MH/s</h3>
                            </div>
                        </div>
                    </div>
                </div>
                <HistoryChart title="Hashrate (24h)" data={hrChartData} options={hrChartOptions} err={hrErr} />
                <HistoryChart title="Shares (24h)" data={sharesChartData} options={shareChartOptions} err={shareErr} />
            </div>
        </div>
    );
}
// TODO: maybe add graph icon to hashrate & shares to pop the graph
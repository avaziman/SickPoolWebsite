import React, { useState, setState, useEffect } from 'react';
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
import './Stats.css'
import { diffToText, hrToText, unixTimeToText } from './utils.js';
import reactDom from 'react-dom';

const primaryColor = [27, 121, 247];

const hrChartOptions = {
    plugins: {
        legend: { display: false },
        tooltip: {
            intersect: false,
            mode: 'index',
            backgroundColor: 'black',
            displayColors: false,
            callbacks: {
                label: function (context) {
                    return 'Total Hashrate: ' + hrToText(parseFloat(context.parsed.y));
                }
            }
        }
    },
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
                color: "rgba(255, 255, 255, 0.1)"
            }
        },
        x: {
            ticks: {
                color: "white",
                font: {
                    size: 18
                }
            },
            grid: {
                color: "rgba(255, 255, 255, 0.1)"
            }
        }
    },
};

const effortChartOptions = {
    plugins: {
        legend: { display: false },
        tooltip: {
            intersect: false,
            mode: 'index',
            backgroundColor: 'black',
            displayColors: false,
            callbacks: {
                label: function (context) {
                    return `Total effort: ${context.parsed.y.toFixed(2)}%`;
                }
            }
        }
    },
    scales: {
        y: {
            ticks: {
                callback: function (x) { return `${(x).toFixed(2)}%`; },
                
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
};

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export default function Stats(props) {

    const coin = props.coin;
    const [tabIndex, setTabIndex] = useState(1);

    const [poolStats, setPoolStats] = useState({ hashrate: 0, miners: 0, workers: 0, blocks: 0, effort: 0});

    const [hrHistory, setHrHistory] = useState([]);
    const [hrTs, setHrTs] = useState([]);
    const [effortHistory, setEffortHistory] = useState([]);
    const [effortTs, setEffortTs] = useState([]);
    const [netDiffHistory, setNetDiffHistory] = useState([]);
    const [netDiffTs, setNetDiffTs] = useState([]);

    const url = `http://127.0.0.1:1111/pool`;
    const period = 60 * 5;

    useEffect(() => {
        Promise.all([
            fetch(`${url}/hashrate?coin=${coin}`),
            fetch(`${url}/minerCount?coin=${coin}`),
            fetch(`${url}/workerCount?coin=${coin}`),
            fetch(`${url}/currentEffort?coin=${coin}`),
        ]).then(([hr, minerCount, workerCount, currentEffort]) => Promise.all([hr.json(), minerCount.json(), workerCount.json(), currentEffort.json()]))
            .then(([hr, minerCount, workerCount, currentEffort]) => {
                setPoolStats({
                    hashrate: hr.result,
                    miners: minerCount.result,
                    workers: workerCount.result,
                    blocks: 0,
                    effort: currentEffort.result
                });
            })
            .catch(err => console.log("Failed to fetch!"));
        // fetch(`${url}/history?coin=${coin}`)
        //     .then(res => res.json())
        //     .then((tuple) => {
        //         setHistoryTs(tuple.map(i => new Date(i[0]).toLocaleTimeString("en-US")));
        //         setHrHistory(tuple.map(i => i[1] / period / 1e6));
        //     }).catch(err => console.log("Failed to get stats!"));
    }, []);

    useEffect(() => {
        LoadChart()
    }, [tabIndex]);

    function LoadChart() {
        switch (tabIndex) {
            case 1:
                fetch(`${url}/hashrateHistory?coin=${coin}`)
                    .then(res => res.json())
                    .then(res => {
                        setHrTs(res.result.map(i => unixTimeToText(i.timestamp)));
                        setHrHistory(res.result.map(i => i.total));
                    }).catch(err => console.log("Failed to get stats!"));
                break;
            case 2:
                fetch(`${url}/hashrateHistory?coin=${coin}`)
                    .then(res => res.json())
                    .then(res => {
                        setHrTs(res.result.map(i => unixTimeToText(i.timestamp)));
                        setHrHistory(res.result.map(i => i.total));
                    }).catch(err => console.log("Failed to get stats!"));   
                break;
            case 4:
                fetch(`${url}/effortHistory?coin=${coin}`)
                    .then(res => res.json())
                    .then(res => {
                        setEffortTs(res.result.map(i => unixTimeToText(i.timestamp)));
                        setEffortHistory(res.result.map(i => i.effort));
                    }).catch(err => console.log("Failed to get stats!"));
                
                fetch(`${url}/networkDifficultyHistory?coin=${coin}`)
                    .then(res => res.json())
                    .then(res => {
                        setNetDiffTs(res.result.map(i => unixTimeToText(i.timestamp)));
                        setNetDiffHistory(res.result.map(i => i.effort));
                    }).catch(err => console.log("Failed to get stats!"));
                break;
        }
    }

    let hrChartData = {
        labels: hrTs,
        datasets: [
            {
                label: 'Hashrate history',
                borderColor: `rgb(${primaryColor})`,
                data: hrHistory,
                pointBorderWidth: 0,
                tension: 0.35,
            },
        ],
    };

    // const effortSeparator = new Array(effortHistory.length).fill(100);

    let effortChartData = {
        labels: effortTs,
        datasets: [
            {
                label: 'Effort history',
                borderColor: `rgb(${primaryColor})`,
                data: effortHistory,
                pointBorderWidth: 0,
                fill: true,
                backgroundColor: `rgba(${primaryColor},0.3)`,
                tension: 0.35,
            },
        ],
    };

    return (
        <div id="stats">
            <div id="pow-stats-container">
                <p className="stats-title">PoW Statistics</p>
                <div className="stats-card-holder">
                    <div className={tabIndex == 1 ? "stats-card stats-card-active" : "stats-card"} onClick={() => {
                        setTabIndex(1);
                        LoadChart();
                    }
                    }>
                        <p className="stats-card-key">Current Hashrate</p>
                        <p className="stats-card-val">{hrToText(poolStats.hashrate)}</p>
                    </div>
                    <div className={tabIndex == 3 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(3)}>
                        <p className="stats-card-key">Merge-mining</p>
                        <p className="stats-card-val">{poolStats.blocks} chains</p>
                    </div>
                    {/* <div className={tabIndex == 2 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(2)}>
                        <p className="stats-card-key">Miners</p>
                        <p className="stats-card-val">{poolStats.miners}/{poolStats.workers}</p>
                    </div> */}
                    <div className={tabIndex == 3 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(3)}>
                        <p className="stats-card-key">Workers</p>
                        <p className="stats-card-val">{poolStats.blocks}</p>
                    </div>
                    <div className={tabIndex == 4 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(4)}>
                        <p className="stats-card-key">Current Effort</p>
                        <p className="stats-card-val">{poolStats.effort.toFixed(2)}%</p>
                        {/* <div className="progress-bar-holder">
                        <div className="progress-bar-fill" style={{width: "65%"}}></div>
                    </div> */}
                    </div>
                    
                </div>
                <div className="chart-container" style={{ display: tabIndex == 1 ? 'block' : 'none' }}>
                    <p className="chart-title">Hashrate History (24h)</p>
                    <Line className="history-chart" data={hrChartData} options={hrChartOptions} height="100rem" />
                </div>
                <div className="chart-container" style={{ display: tabIndex == 2 ? 'block' : 'none' }}>
                    <p className="chart-title">Miner & Worker History (24h)</p>
                    <Line className="history-chart" data={hrChartData} options={hrChartOptions} height="100rem" />
                </div>
                <div className="chart-container" style={{ display: tabIndex == 4 ? 'block' : 'none' }}>
                    <p className="chart-title">Effort History (24h)</p>
                    <Line className="history-chart" data={effortChartData} options={effortChartOptions} height="100rem" />
                </div>
            </div>
        </div>
    );
}
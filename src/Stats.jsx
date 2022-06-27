import React, { useState, setState, useEffect } from 'react';
import './Stats.css'
import { diffToText, hrToText, unixTimeToClockText } from './utils.js';
import reactDom from 'react-dom';
import HistoryChart from './HistroyChart';
const { REACT_APP_API_URL } = process.env;

const primaryColor = [27, 121, 247];

const hrChartOptions = {
    plugins: {
        legend: { display: false },
        // tooltip: {
        //     intersect: false,
        //     mode: 'index',
        //     backgroundColor: 'black',
        //     displayColors: false,
        //     callbacks: {
        //         // label: function (context) {
        //             // return context.label + hrToText(parseFloat(context.parsed.y));
        //         // }
        //     }
        // }
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

export default function Stats(props) {

    const coin = props.coin;
    const [tabIndex, setTabIndex] = useState(1);

    const [poolStats, setPoolStats] = useState({ hashrate: 0, miners: 0, workers: 0, blocks: 0, effort: 0 });

    const [hrHistory, setHrHistory] = useState([]);
    const [hrTs, setHrTs] = useState([]);
    const [effortHistory, setEffortHistory] = useState([]);
    const [effortTs, setEffortTs] = useState([]);
    const [netDiffHistory, setNetDiffHistory] = useState([]);
    const [netDiffTs, setNetDiffTs] = useState([]);

    const period = 60 * 5;

    useEffect(() => {
        Promise.all([
            fetch(`${REACT_APP_API_URL}/pool/currentHashrate?coin=${coin}`),
            fetch(`${REACT_APP_API_URL}/pool/minerCount?coin=${coin}`),
            fetch(`${REACT_APP_API_URL}/pool/workerCount?coin=${coin}`),
            fetch(`${REACT_APP_API_URL}/pool/currentEffort?coin=${coin}`),
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
            .catch(err => {
                // console.log("Failed to fetch!")
            });
        // fetch(`${url}/history?coin=${coin}`)
        //     .then(res => res.json())
        //     .then((tuple) => {
        //         setHistoryTs(tuple.map(i => new Date(i[0]).toLocaleTimeString("en-US")));
        //         setHrHistory(tuple.map(i => i[1] / period / 1e6));
        //     }).catch(err => console.log("Failed to get stats!"));
    }, []);

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
            <div className="stats-container">
                <p className="stats-title">Proof-of-Work Statistics</p>
                <div className="stats-card-holder">
                    <div className={tabIndex == 1 ? "stats-card stats-card-active" : "stats-card"} onClick={() => {
                        setTabIndex(1);
                    }
                    }>
                        <h3>Current Hashrate</h3>
                        <p>{hrToText(poolStats.hashrate)}</p>
                    </div>
                    <div className={tabIndex == 3 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(3)}>
                        <h3>Merge-mining</h3>
                        <p>{poolStats.blocks} chains</p>
                    </div>
                    {/* <div className={tabIndex == 2 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(2)}>
                        <h2>Miners</h2>                        <p>{poolStats.miners}/{poolStats.workers}</p>
                    </div> */}
                    <div className={tabIndex == 3 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(3)}>
                        <h3>Workers</h3>
                        <p>{poolStats.blocks}</p>
                    </div>
                    <div className={tabIndex == 4 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(4)}>
                        <h3>Current Effort</h3>
                        <p>{poolStats.effort.toFixed(2)}%</p>
                        {/* <div className="progress-bar-holder">
                        <div className="progress-bar-fill" style={{width: "65%"}}></div>
                    </div> */}
                    </div>

                </div>
                <HistoryChart data={hrChartData} options={hrChartOptions}
                    url={`${REACT_APP_API_URL}/pool/hashrateHistory?coin=${coin}`}
                    style={{ display: tabIndex == 1 ? 'block' : 'none' }} />
                <HistoryChart data={hrChartData} options={hrChartOptions} style={{ display: tabIndex == 2 ? 'block' : 'none' }} />
                <HistoryChart data={effortChartData} options={effortChartOptions} url={`effortHistory?coin=${coin}`} style={{ display: tabIndex == 4 ? 'block' : 'none' }} />
            </div>
        </div>
    );
}
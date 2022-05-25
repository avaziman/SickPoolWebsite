import React, {useEffect, useState} from 'react';
import { hrToText, unixTimeToText } from './utils.js';
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

const hrChartOptions = {
    plugins: { legend: { display: false } },
    layout: { padding: { bottom: 100 } },
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
};

export default function Solver(props) {
    const address = window.location.href.split('/').slice(-1)[0]; // escape
    const url = `http://127.0.0.1:1111`;

    const [historyHr, setHistoryHr] = useState([]);
    const [historyTs, setHistoryTs] = useState([]);

    console.log('Address: ' + address);
    useEffect(() => {
        fetch(`${url}/miner/${address}/hashrateHistory`)
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                setHistoryTs(res.map(i => unixTimeToText(i[0])));
                setHistoryHr(res.map(i => i[1]));
            })
            .catch(err => console.log("Failed to fetch!"));
    }, []);

    const hrChartData = {
        labels: historyTs,
        datasets: [
            {
                label: 'Hashrate history',
                data: historyHr,
                fill: true,
                backgroundColor: "rgba(27, 121, 247, 0.55)",
                pointPointColor: "rgba(27, 121, 247, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointRadius: 5,
                tension: 0.35
            },
        ],
    };

    return (
        <div>
            <Line id="hr-chart" data={hrChartData} options={hrChartOptions}></Line>
        </div>
    );
}
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
const {REACT_APP_API_URL} = process.env;

const options = {
    plugins: { legend: { display: false } },
    layout: { padding: { bottom: 100 } },
    scales: {
        y: {
            ticks: {
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



export default function Verus() {

    const [hashrate, setHashrate] = useState([]);
    const [time, setTime] = useState([]);
    const period = 60 * 5;

    useEffect(() => {
        fetch(REACT_APP_API_URL)
            .then(res => res.json())
            .then((tuple) => {
                setTime(tuple.map(i => new Date(i[0]).toLocaleTimeString("en-US")));
                // setTime(tuple.map(i => i[0]));
                setHashrate(tuple.map(i => i[1] / period / 1e6));
            });
        // setHashrate([1, 2, 1]);
        // setTime([1, 2, 1]);
    }, []);

    console.table(hashrate);
    console.table(time);


    const data = {
        labels: time,
        datasets: [
            {
                label: 'Hashrate',
                data: hashrate,
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
            {/* <Line options={options} data={data} /> */}

            <div id="stats">
                <div id="round-stats">
                    <div>
                        <h5>Current Effort</h5>
                        <h5>5.121%</h5>
                    </div>
                </div>
            </div>
            <Line data={data} options={options} />

        </div>
    );
}
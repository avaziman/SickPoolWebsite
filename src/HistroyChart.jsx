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
    BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import './HistoryChart.css'
import { useEffect, useState } from 'react'

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    BarElement
);

export default function HistoryChart(props) {
    return (
        
        <div className="chart-container" style={props.style}>
            <p className="chart-title">{props.title}</p>
            {(!props.err && props.data.labels.length === 0) && <p>Loading...</p>}
            {props.err && <div className="chart-error">{props.err}</div>}
            {(!props.err && props.data.labels.length !== 0) &&
                <Line className="history-chart" data={props.data} options={props.options} height="100rem" />}
        </div>
    );
}
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
    BarElement,
    ChartOptions,
    ChartData,
    ChartTypeRegistry
} from 'chart.js';
import { Line, Bar, Chart } from 'react-chartjs-2';
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

interface HistoryChartProp{
    title: string;
    type: keyof ChartTypeRegistry;
    // type: keyof ChartTypeRegistry;
    data: ChartData;
    options: ChartOptions;
    error: string | undefined;
}

export default function HistoryChart(props: HistoryChartProp) {
    return (

        <div className="chart-container">
            <p className="chart-title">{props.title}</p>
            {(!props.error && !props.data.datasets[0].data) && <p>Loading...</p>}
            {(!props.error && props.data.datasets[0].data && props.data.datasets[0].data.length == 0) && <p>No data.</p>}
            {props.error && <div className="chart-error">{props.error}</div>}
            {(!props.error && props.data.labels && props.data.labels.length !== 0) &&
                <Chart type={props.type}/*type={props.type}*/ className="history-chart" data={props.data} options={props.options} height="100rem" />}
        </div>
    );
}
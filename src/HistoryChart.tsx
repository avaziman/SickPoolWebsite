import './HistoryChart.css'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ChartTypeRegistry,
    ChartData,
    ChartOptions,
    LineController,
    registerables as registerablesJS
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useMemo } from 'react';
ChartJS.register(...registerablesJS);

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    LineController,
);

interface HistoryChartProp {
    title: string;
    type: keyof ChartTypeRegistry;
    data: ChartData;
    options: ChartOptions;
    // loading: boolean;
    error: string | undefined;
}

export default function HistoryChart(props: HistoryChartProp) {

    let body : JSX.Element = useMemo(() => {
        if (props.error) {
            return <div className="chart-error">{props.error}</div>
        }
        // else if (props.loading) {
        //     return <p>Loading...</p>;
        // }
        else if (props.data) {
            return <Chart type={props.type}/*type={props.type}*/ className="history-chart" data={props.data} options={props.options} height="100rem" />;
        } else {
            return <p>No data.</p>
        }
    }, [props]);
    
    return (
        <div className="chart-container">
            <p className="chart-title">{props.title}</p>
            {body}
        </div>
    );
}
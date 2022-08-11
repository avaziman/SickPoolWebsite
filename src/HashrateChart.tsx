import { ChartOptions, ChartData } from 'chart.js';
import { hrToText, unixTimeToClockText } from './utils.js';
import HistoryChart from './HistoryChart';

const hrChartOptions: ChartOptions = {
    plugins: {
        legend: { display: false },
        tooltip: {
            intersect: false,
            mode: 'index',
            backgroundColor: 'black',
            displayColors: true,
            callbacks: {
                label: function (context) {
                    return context.dataset.label + ': ' + hrToText(context.parsed.y);
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

interface Props {
    title: string;
    data: ChartData<'line'>;
    error: string | undefined;

}

export default function HashrateChart(props: Props) {
    return (
        <HistoryChart type="line" title={props.title} options={ hrChartOptions} data={props.data} error={props.error}/>
    )    
}
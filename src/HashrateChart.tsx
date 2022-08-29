import { ChartOptions, ChartData, ChartTypeRegistry } from 'chart.js';
import { hrToText, unixTimeToClockText } from './utils';
import HistoryChart from './HistoryChart';

interface Props {
    title: string;
    data: ChartData<'line'>;
    error: string | undefined;
    isDarkMode: boolean;
    type: keyof ChartTypeRegistry;
    toText: (n: number) => string;
}

export default function HashrateChart(props: Props) {
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
                        return context.dataset.label + ': ' + props.toText(context.parsed.y);
                    }
                }
            }
        },
        layout: { padding: {} },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: props.toText as any,
                    color: props.isDarkMode ? "white" : "black",
                    font: {
                        size: 18
                    }
                },
                grid: {
                    color: props.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.3)",
                }
            },
            x: {
                stacked: true,
                ticks: {
                    callback: unixTimeToClockText as any,
                    color: props.isDarkMode ? "white" : "black",
                    font: {
                        size: 18
                    }
                },
                grid: {
                    color: props.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.3)",
                },
            }
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    return (
        <HistoryChart type={props.type} title={props.title} options={ hrChartOptions} data={props.data} error={props.error}/>
    )    
}
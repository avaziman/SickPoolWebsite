import { ChartOptions, ChartData, ChartTypeRegistry, TooltipItem } from 'chart.js';
import HistoryChart from './HistoryChart';
import { useEffect, useMemo, useState } from 'react'
import { format } from 'fecha'
import { createNamedExports } from 'typescript';

interface Props {
    title: string;
    data: ChartData<'line'>;
    error: string | undefined;
    isDarkMode: boolean;
    type: keyof ChartTypeRegistry;
    timestamps: Date[];
    toText: (n: number) => string;
}

export default function HashrateChart(props: Props) {
    props.data.labels = useMemo(() => props.timestamps.map(time => format(time, 'shortTime')), [props.timestamps]);

    const DEFAULT_FONT_SIZE = 18;
    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

    function UpdateChartFontSize() {
        let width = window.innerWidth;
        // console.log('width', width)

        if (width < 400) {
            setFontSize(10);
        } else if (width < 600) {
            setFontSize(12);
        } else {
            setFontSize(DEFAULT_FONT_SIZE);
        }
    }

    useEffect(() => {
        window.addEventListener('resize', UpdateChartFontSize);
        UpdateChartFontSize();
    }, []);

    const hrChartOptions: ChartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                intersect: false,
                mode: 'index',
                backgroundColor: 'black',
                displayColors: true,
                callbacks: {
                    title: function (context) {
                        return format(props.timestamps[context[0].parsed.x], 'MMM Do, HH:mm:ss');
                    },
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
                        size: fontSize
                    }
                },
                grid: {
                    color: props.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.3)",
                }
            },
            x: {
                position: 'left',
                beginAtZero: false,
                stacked: true,
                ticks: {
                    // callback:
                    //     function (value, index, ticks) {
                    //         if (index % 2 === 0) {
                    //             return format(props.timestamps[index], 'shortTime');
                    //         }
                                
                    //         return '';
                    //     },
                    color: props.isDarkMode ? "white" : "black",
                    font: {
                        size: fontSize
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
        <HistoryChart type={props.type} title={props.title} options={hrChartOptions} data={props.data} error={props.error} />
    )
}
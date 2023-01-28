import { ChartOptions, ChartData, ChartTypeRegistry } from 'chart.js';
import HistoryChart from './HistoryChart';
import { useEffect, useMemo, useState } from 'react'
import { format } from 'fecha'
import { ChartDataSet, Processed } from './LoadableChart';

interface Props {
    title: string;
    type: keyof ChartTypeRegistry;
    processedData: Processed;
    isDarkMode: boolean;
    error: string | undefined;
    toText(p: number): string;
}

export default function SickChart(props: Props) {

    const DEFAULT_FONT_SIZE = 18;
    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

    function UpdateChartFontSize() {
        let width = window.innerWidth;
        // console.log('width', width)

        if (width < 400) {
            setFontSize(12);
        } else if (width < 600) {
            setFontSize(14);
        } else {
            setFontSize(DEFAULT_FONT_SIZE);
        }
    }

    useEffect(() => {
        window.addEventListener('resize', UpdateChartFontSize);
        UpdateChartFontSize();
    }, []);

    const hrChartOptions: ChartOptions =
        useMemo(() => {
            return {
                responsive: true,
                plugins: {
                    // decimation: false,
                    legend: {
                        display: props.processedData.datasets.length > 1,
                        position: 'bottom',
                    },
                    tooltip: {
                        backgroundColor: props.isDarkMode ? 'rgba(105,105,105, 0.8)' : 'rgba(55,55,55, 0.8)',
                        displayColors: true,
                        padding: 7,
                        caretSize: 15,
                        boxPadding: 4,
                        borderWidth: 10,
                        bodyFont: {
                            size: fontSize,
                        },
                        titleFont: {
                            size: fontSize,
                        },
                        callbacks: {
                            title: function (context) {
                                return format(new Date(props.processedData.timestamps[context[0].parsed.x] * 1000), 'MMM Do, HH:mm:ss');
                            },
                            label: function (context) {
                                return context.dataset.label + ': ' + props.toText(context.parsed.y);
                            },
          
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
                            callback:
                                function (value, index, ticks) {
                                    if (index % 2 === 0) {
                                        return format(new Date(props.processedData.timestamps[index] * 1000), 'shortTime');
                                    }

                                    return '';
                                },
                            color: props.isDarkMode ? "white" : "black",
                            font: {
                                size: fontSize,
                            }
                        },
                        grid: {
                            display: false,
                            // color: props.isDarkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.3)",
                        },
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index',
                },
            }
        }, [props, fontSize]);

    let data: ChartData<'line'> = useMemo(() => {
        return {
            labels: props.processedData.timestamps,
            datasets: props.processedData.datasets.map((ds: ChartDataSet) => {
                return {
                    label: ds.name,
                    borderColor: ds.borderColor,
                    backgroundColor: ds.borderColor,
                    pointBorderColor: props.isDarkMode ? "white" : "black",
                    pointBorderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                    borderWidth: 4,
                    tension: 0.15,
                    data: ds.values,
                    normalized: true
                }
            })
        }
    }, [props.processedData, props.isDarkMode]);

    return (
        <HistoryChart type={props.type} title={props.title} options={hrChartOptions} data={data} error={props.error} />
    )
}
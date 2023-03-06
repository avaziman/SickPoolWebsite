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
    toText(p: number): string | undefined;
    precision: number;
}

export default function SickChart(props: Props) {

    const DEFAULT_FONT_SIZE = 18;
    const DEFAULT_HEIGHT = 400;
    const DEFAULT_TIMESTAMP_AMOUNT = 6;
    const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
    const [height, setHeight] = useState(DEFAULT_HEIGHT);
    const [timestampLabelAmount, setTimestampLabelAmount] = useState(DEFAULT_TIMESTAMP_AMOUNT);

    const timeRange = (props.processedData.timestamps.at(-1) ?? 0) - props.processedData.timestamps[0];

    function UpdateChartFontSize() {
        let width = window.innerWidth;
        // console.log('width', width)

        if (width < 420) {
            setFontSize(12);
            setTimestampLabelAmount(3)
            setHeight(200)
        } else if (width < 600) {
            setFontSize(14);
            setTimestampLabelAmount(4)
            setHeight(300)
        } else {
            setTimestampLabelAmount(DEFAULT_TIMESTAMP_AMOUNT)
            setFontSize(DEFAULT_FONT_SIZE);
            setHeight(DEFAULT_HEIGHT)
        }
    }

    useEffect(() => {
        window.addEventListener('resize', UpdateChartFontSize);
        UpdateChartFontSize();
    }, []);

    const hrChartOptions: ChartOptions =
        useMemo(() => {
            return {
                maintainAspectRatio: false,
                decimation: false,
                plugins: {
                    title: {
                        display: true,
                        text: props.title,
                        color: props.isDarkMode ? "white" : "black",
                        padding: {
                            bottom: fontSize - 5,
                        },
                        font: {
                            size: fontSize + 5
                        }
                    },
                    legend: {
                        // only show legends if multiple datasets
                        display: props.processedData.datasets.length > 1,
                        position: 'bottom',
                        labels: {
                            // padding: 20
                        },
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
                            precision: props.precision,
                            autoSkip: false,
                            callback: function (value, index, ticks) {
                                let res = undefined;
                                if (index % Math.max(1, Math.floor(ticks.length / (timestampLabelAmount - 1))) === 0) {
                                    res = props.toText(value as number);
                                }

                                return res
                            },
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
                            autoSkip: false,
                            maxRotation: 0,
                            minRotation: 0,
                            callback:
                                function (value, index, ticks) {
                                    // only show whole hours
                                    const timestamp = props.processedData.timestamps[index];
                                    if (index % Math.max(1, Math.floor(ticks.length / (timestampLabelAmount))) === 0) {
                                        if (timeRange < 24 * 60 * 60) {
                                            return format(new Date(timestamp * 1000), 'shortTime');
                                        }
                                        return format(new Date(timestamp * 1000), 'D-M');
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
                // applies to all datasets
                elements: {
                    point: {
                        radius: 0,
                        borderWidth: 2,
                        hoverRadius: 4,
                        hitRadius: 1,
                        borderColor: props.isDarkMode ? "white" : "black"
                    },
                    line: {
                        normalized: true, // performance, data is sorted and unique
                        tension: 0.15,
                        borderWidth: 4,
                    }
                }
            }
        }, [props, fontSize, timestampLabelAmount]);

    let data: ChartData<'line'> = useMemo(() => {
        return {
            labels: props.processedData.timestamps,
            datasets: props.processedData.datasets.map((ds: ChartDataSet) => {
                return {
                    label: ds.name,
                    borderColor: ds.borderColor,
                    backgroundColor: ds.borderColor,
                    data: ds.values,
                }
            })
        }
    }, [props.processedData]);

    return (
        <HistoryChart type={props.type} options={hrChartOptions} data={data} error={props.error} height={height} />
    )
}
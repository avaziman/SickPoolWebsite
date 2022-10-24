import { useState, useEffect, useMemo } from 'react';
import './Stats.css'
import { hrToText, timeToText, toLatin, unixTimeToClockText } from './utils';
import HashrateChart from './HashrateChart';
import ToCoin from './CoinMap';
import { useParams } from 'react-router-dom';
import { ChartData } from 'chart.js';
import { DataFetcher, Processed } from './LoadableChart';

const { REACT_APP_API_URL } = process.env;

const primaryColor = [27, 121, 247];

interface StatsProps {
    isDarkMode: boolean;
}

export let hrChartData: ChartData<'line'> = {
    datasets: [
        {
            label: 'Hashrate',
            borderColor: `rgb(${primaryColor})`,
            // pointBackgroundColor: `rgb(${primaryColor})`,
            // pointBorderWidth: 0.5,
            pointBorderWidth: 0,
            borderWidth: 3,
            tension: 0.15,
            data: [],
        },
    ],
};

export function basicFetcher(type: string, coin_symbol: string): Promise<Processed[]> {
    return DataFetcher({
        url: `${REACT_APP_API_URL}/pool/${type}?coin=${coin_symbol}`,
        process_res: (res) => {
            return new Promise((resolve, rej) => {
                const processed: Processed = {
                    timestamps: res.result.map((i: Number[]) => i[0]),
                    values: res.result.map((i: Number[]) => i[1])
                }
                resolve([processed]);
                // console.log('resolved', [processed])
            })
        }
    });
}

export default function Stats(props: StatsProps) {

    const { coinPretty } = useParams();
    const coin_symbol: string = coinPretty ? ToCoin(coinPretty).symbol : 'unknown';

    const [tabIndex, setTabIndex] = useState(0);
    const [poolStats, setPoolStats] = useState({ hashrate: 0, network_hashrate: 0, miners: 0, workers: 0 });

    const period = 60 * 5;

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/overview?coin=${coin_symbol}`)
            .then((res) => res.json())
            .then((res) => {
                setPoolStats({
                    hashrate: res.result.poolHashrate,
                    network_hashrate: res.result.networkHashrate,
                    miners: res.result.minerCount,
                    workers: res.result.workerCount,
                });
            })
            .catch(err => {
                // console.log("Failed to fetch!")
            });
    }, []);


    // const effortSeparator = new Array(effortHistory.length).fill(100);
    const tabs = [
        {
            "title": "Pool Hashrate",
            "value": hrToText(poolStats.hashrate),
            "src": `${REACT_APP_API_URL}/pool/charts/hashrateHistory.svg?coin=${coin_symbol}`,
            "component":
                <HashrateChart type="line" isDarkMode={props.isDarkMode} title="Pool Hashrate" data_fetcher={() => basicFetcher('hashrateHistory', coin_symbol)} data={hrChartData} toText={hrToText} key="0" />
        },
        {
            "title": "Network Hashrate",
            "value": hrToText(poolStats.network_hashrate),
            "src": `${REACT_APP_API_URL}/pool/charts/networkHashrateHistory.svg?coin=${coin_symbol}`,
            "component":
                <HashrateChart type="line" isDarkMode={props.isDarkMode} title="Network Hashrate" data_fetcher={() => basicFetcher('networkHashrateHistory', coin_symbol)} data={hrChartData} toText={hrToText} key="1" />
        },
        {
            "title": "Miners",
            "value": poolStats.miners,
            "src": `${REACT_APP_API_URL}/pool/charts/minerCountHistory.svg?coin=${coin_symbol}`,
            "component":
                <HashrateChart type="line" isDarkMode={props.isDarkMode} title="Miners Count History" data_fetcher={() => basicFetcher('minerCountHistory', coin_symbol)} data={hrChartData} toText={toLatin} key="2" />
        },
        {
            "title": "Workers",
            "value": poolStats.workers,
            "src": `${REACT_APP_API_URL}/pool/charts/workerCountHistory.svg?coin=${coin_symbol}`,
            "component":
                <HashrateChart type="line" isDarkMode={props.isDarkMode} title="Workers Count History" data_fetcher={() => basicFetcher('workerCountHistory', coin_symbol)} data={hrChartData} toText={toLatin} key="3" />
        },
    ]

    return (
        <div id="stats">
            <div className="stats-container">
                <p className="stats-title">Proof-of-Work Statistics</p>
                <div className="stats-card-holder">
                    {tabs.map((t, i) => {
                        const title = `7d ${t.title} chart`;
                        return (
                            <div className={tabIndex === i ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(i)} key={i}>
                                <div>
                                    <h3>{t.title}</h3>
                                    <p>{t.value}</p>
                                </div>
                                <img loading="lazy" alt={title} title={title} src={t.src}></img>
                            </div>
                        );
                    })}
                </div>
                {tabs[tabIndex].component}
                {/*<HistoryChart data={hrChartData} options={hrChartOptions} style={{ display: tabIndex == 2 ? 'block' : 'none' }} />
                <HistoryChart data={effortChartData} options={effortChartOptions} url={`effortHistory?coin=${coin_symbol}`} style={{ display: tabIndex == 4 ? 'block' : 'none' }} /> */}
            </div>
        </div>
    );
}
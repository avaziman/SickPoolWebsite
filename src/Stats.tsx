import { useState, useEffect } from 'react';
import './Stats.css'
import { hrToText, toLatin } from './utils';
import ToCoin from './CoinMap';
import { DataFetcher, Processed, ProcessStats } from './LoadableChart';
import SickChart from './SickChart';

const { REACT_APP_API_URL } = process.env;

const primaryColor = [27, 121, 247];

interface StatsProps {
    coinPretty: string,
    isDarkMode: boolean;
}


export default function Stats(props: StatsProps) {

    const coin_symbol = ToCoin(props.coinPretty).symbol;

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

    const [processedData, setProcessedData] = useState<Processed>({ timestamps: [], datasets: [] });
    const [error, setError] = useState<string>();

    useEffect(() => {
        setError(undefined);
        tabs[tabIndex].data_fetcher().then((r: Processed) => { setProcessedData(r); }).catch((e) => setError(e));
    }, [tabIndex]);

    function StatChart(title: string, toText: (n: number) => string) {
        return <SickChart type="line" isDarkMode={props.isDarkMode} title={title}
            processedData={processedData} error={error} toText={(n: any) => toText(n)} />;
    }
    // const effortSeparator = new Array(effortHistory.length).fill(100);
    const tabs = [
        {
            "title": "Pool Hashrate",
            "value": hrToText(poolStats.hashrate),
            "src": `${REACT_APP_API_URL}/pool/charts/hashrateHistory.svg?coin=${coin_symbol}`,
            "component": StatChart('Pool Hashrate', hrToText),
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/pool/hashrateHistory?coin=${coin_symbol}`,
                process_res: (r) => ProcessStats(r, 'Hashrate')
            })
        },
        {
            "title": "Network Hashrate",
            "value": hrToText(poolStats.network_hashrate),
            "src": `${REACT_APP_API_URL}/pool/charts/networkHashrateHistory.svg?coin=${coin_symbol}`,
            "component": StatChart('Network Hashrate', hrToText),
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/pool/networkHashrateHistory?coin=${coin_symbol}`,
                process_res: (r) => ProcessStats(r, 'Hashrate')
            })
        },
        {
            "title": "Miners",
            "value": poolStats.miners,
            "src": `${REACT_APP_API_URL}/pool/charts/minerCountHistory.svg?coin=${coin_symbol}`,
            "component":
                StatChart('Miner Count', toLatin),
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/pool/minerCountHistory?coin=${coin_symbol}`,
                process_res: (r) => ProcessStats(r, 'Miners')
            })
        },
        {
            "title": "Workers",
            "value": poolStats.workers,
            "src": `${REACT_APP_API_URL}/pool/charts/workerCountHistory.svg?coin=${coin_symbol}`,
            "component":
                StatChart('Worker Count', toLatin),
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/pool/workerCountHistory?coin=${coin_symbol}`,
                process_res: (r) => ProcessStats(r, 'Workers')
            })
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
                                <img loading="lazy" alt={title} title={title} src={t.src} onError={(e) => (e.target as HTMLElement).style.display = 'none'}></img>
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
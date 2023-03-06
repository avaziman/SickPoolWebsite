import './Home.css'
import './Stats.css'
import { useState, useEffect, useMemo } from 'react';
import { hrToText, toLatin } from './utils';
import ToCoin from './CoinMap';
import { DataFetcher, Processed, ProcessStats } from './LoadableChart';
import SickChart from './SickChart';

const { REACT_APP_API_URL } = process.env;

interface StatsProps {
    coinPretty: string,
    isDarkMode: boolean;
}

interface Stats {
    poolHashrate: number;
    networkHashrate: number;
    minerCount: number;
    workerCount: number
}

export default function Stats(props: StatsProps) {

    const coin_symbol = ToCoin(props.coinPretty).symbol;

    const [tabIndex, setTabIndex] = useState(0);
    const [poolStats, setPoolStats] = useState({ poolHashrate: 0, networkHashrate: 0, minerCount: 0, workerCount: 0 });

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/overview?coin=${coin_symbol}`)
            .then((res) => res.json())
            .then((res) => {
                setPoolStats(res.result as Stats);
            })
            .catch(err => {
                // console.log("Failed to fetch!")
            });
    }, [coin_symbol]);

    const [processedData, setProcessedData] = useState<Processed>({ timestamps: [], datasets: [] });
    const [error, setError] = useState<string>();

    // const effortSeparator = new Array(effortHistory.length).fill(100);
    const tabs = useMemo(() => [
        {
            "title": "Pool Hashrate",
            "value": hrToText(poolStats.poolHashrate),
            "src": `${REACT_APP_API_URL}/pool/charts/hashrateHistory.svg?coin=${coin_symbol}`,
            "component": <SickChart type="line" isDarkMode={props.isDarkMode} title='Pool Hashrate'
                processedData={processedData} error={error} toText={hrToText} precision={0}/>,
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/pool/history/hashrate?coin=${coin_symbol}`,
                process_res: (r) => ProcessStats(r, 'Hashrate')
            })
        },
        {
            "title": "Network Hashrate",
            "value": hrToText(poolStats.networkHashrate),
            "src": `${REACT_APP_API_URL}/pool/charts/networkHashrateHistory.svg?coin=${coin_symbol}`,
            "component": <SickChart type="line" isDarkMode={props.isDarkMode} title='Network Hashrate'
                processedData={processedData} error={error} toText={hrToText} precision={0}/>,
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/network/history/hashrate?coin=${coin_symbol}`,
                process_res: (r) => ProcessStats(r, 'Hashrate')
            })
        },
        {
            "title": "Miners",
            "value": poolStats.minerCount,
            "src": `${REACT_APP_API_URL}/pool/charts/minerCountHistory.svg?coin=${coin_symbol}`,
            "component":
                <SickChart type="line" isDarkMode={props.isDarkMode} title='Miner Count'
                    processedData={processedData} error={error} toText={toLatin} precision={0}/>,
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/pool/history/miner-count?coin=${coin_symbol}`,
                process_res: (r) => ProcessStats(r, 'Miners')
            })
        },
        {
            "title": "Workers",
            "value": poolStats.workerCount,
            "src": `${REACT_APP_API_URL}/pool/charts/workerCountHistory.svg?coin=${coin_symbol}`,
            "component":
                <SickChart type="line" isDarkMode={props.isDarkMode} title='Worker Count'
                    processedData={processedData} error={error} toText={toLatin} precision={0}/>,
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/pool/history/worker-count?coin=${coin_symbol}`,
                process_res: (r) => ProcessStats(r, 'Workers')
            })
        },
    ], [coin_symbol, poolStats, error, processedData, props.isDarkMode])

    useEffect(() => {
        setError(undefined);
        tabs[tabIndex].data_fetcher().then((r: Processed) => { setProcessedData(r); }).catch((e) => setError(e));
    }, [tabIndex]);

    return (
        <div id="stats">
            <div className="stats-container">
                <p className="stats-title">Proof-of-Work Statistics</p>
                <div className="stats-card-holder">
                    {tabs.map((t, i) => {
                        const title = `7d ${t.title} chart`;
                        return (
                            <div className={tabIndex === i ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(i)} key={t.title}>
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
            </div>
        </div>
    );
}
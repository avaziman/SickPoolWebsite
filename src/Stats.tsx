import { useState, useEffect } from 'react';
import './Stats.css'
import { hrToText } from './utils';
import HashrateChart from './HashrateChart';
import ToCoinSymbol from './CoinMap';
import { useParams } from 'react-router-dom';

const { REACT_APP_API_URL } = process.env;

const primaryColor = [27, 121, 247];

interface StatsProps {
    isDarkMode: boolean;
}

export default function Stats(props: StatsProps) {

    const { coinPretty } = useParams();
    const coin_symbol: string = coinPretty ? ToCoinSymbol(coinPretty).symbol : 'unknown';
    
    const [tabIndex, setTabIndex] = useState(1);

    const [poolStats, setPoolStats] = useState({ hashrate: 0, network_hashrate: 0, miners: 0, workers: 0 });

    const [hrHistory, setHrHistory] = useState([]);
    const [hrTs, setHrTs] = useState([]);
    const [effortHistory, setEffortHistory] = useState([]);
    const [effortTs, setEffortTs] = useState([]);
    const [netDiffHistory, setNetDiffHistory] = useState([]);
    const [netDiffTs, setNetDiffTs] = useState([]);

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

    useEffect(() => {
        if (tabIndex === 1) {
            fetch(`${REACT_APP_API_URL}/pool/hashrateHistory?coin=${coin_symbol}`)
                .then(res => res.json())
                .then((res) => {
                    setHrTs(res.result.map((i: number[]) => i[0]));
                    setHrHistory(res.result.map((i: number[]) => i[1]));
                }).catch(err => console.log("Failed to get stats!"));
        }
    }, [tabIndex])

    let hrChartData = {
        labels: hrTs,
        datasets: [
            {
                label: 'hashrate',
                borderColor: `rgb(${primaryColor})`,
                data: hrHistory,
                pointBorderWidth: 0,
                tension: 0.35,
            },
        ],
    };

    // const effortSeparator = new Array(effortHistory.length).fill(100);

    let effortChartData = {
        labels: effortTs,
        datasets: [
            {
                label: 'Effort history',
                borderColor: `rgb(${primaryColor})`,
                data: effortHistory,
                pointBorderWidth: 0,
                fill: true,
                backgroundColor: `rgba(${primaryColor},0.3)`,
                tension: 0.35,
            },
        ],
    };

    return (
        <div id="stats">
            <div className="stats-container">
                <p className="stats-title">Proof-of-Work Statistics</p>
                <div className="stats-card-holder">
                    <div className={tabIndex === 1 ? "stats-card stats-card-active" : "stats-card"} onClick={() => {
                        setTabIndex(1);
                    }
                    }>
                        <h3>Pool Hashrate</h3>
                        <p>{hrToText(poolStats.hashrate)}</p>
                    </div>
                    <div className={tabIndex === -1 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(3)}>
                        <h3>Network Hashrate</h3>
                        <p>{hrToText(poolStats.network_hashrate)}</p>
                    </div>
                    {/* <div className={tabIndex == 2 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(2)}>
                        <h2>Miners</h2>                        <p>{poolStats.miners}/{poolStats.workers}</p>
                    </div> */}
                    <div className={tabIndex === -1 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(3)}>
                        <h3>Miners</h3>
                        <p>{poolStats.miners}</p>
                    </div>
                    <div className={tabIndex === -1 ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(4)}>
                        <h3>Workers</h3>
                        {/* <p>{poolStats.effort.toFixed(2)}%</p> */}
                        <p>{poolStats.workers}</p>

                        {/* <div className="progress-bar-holder">
                        <div className="progress-bar-fill" style={{width: "65%"}}></div>
                    </div> */}
                    </div>

                </div>
                {tabIndex === 1 && <HashrateChart type="line" isDarkMode={props.isDarkMode} title="Pool Hashrate" data={hrChartData} error='' toText={hrToText} />}
                {/*<HistoryChart data={hrChartData} options={hrChartOptions} style={{ display: tabIndex == 2 ? 'block' : 'none' }} />
                <HistoryChart data={effortChartData} options={effortChartOptions} url={`effortHistory?coin=${coin_symbol}`} style={{ display: tabIndex == 4 ? 'block' : 'none' }} /> */}
            </div>
        </div>
    );
}
import { useMemo, useState } from "react";
import { ApiTableResult, Column, Sort } from "./SortableTable"
import './GetStarted.css'
import ToCoin from "./CoinMap";

interface Server {
    endpoint: string,
    country: string,
}

const COLUMNS: Column[] = [
    {
        header: 'Country',
    },
    {
        header: 'Endpoint'
    },
]

let servers: Server[] = [
    {
        country: 'Germany',
        endpoint: 'eu.sickpool.io:4444'
    }
];

interface Miner {
    name: string;
    getConfig(addr: string, url: string, worker: string, algo: string): string;
}

let trexMiner: Miner = {
    name: 'T-Rex Miner',
    getConfig: getConfigTrex,
};

let ttminer: Miner = {
    name: 'TT-Miner',
    getConfig: getConfigTrex,

}

function getConfigTrex(addr: string, url: string, worker: string, algo: string): string {
    return `t-rex -a ${algo} -o stratum+tcp://${url} -u ${addr} -w ${worker}`;
}

interface Props {
    coinPretty: string,
}

export default function GetStarted(props: Props) {
    const coinData = ToCoin(props.coinPretty);
    const coin = coinData.name;
    const default_addr = 'ADDRESS';
    const default_worker = 'WORKER1';
    const [url, setUrl] = useState(servers[0].endpoint);
    const [addr, setAddr] = useState(default_addr);
    const [worker, setWorker] = useState(default_worker);

    return (
        <div className="stats-container">
            <p className="stats-title">Get started mining: {coin}</p>
            <p>Follow these simple steps to mine at SickPool</p>
            <ol className="steps-list">
                <li>
                    <h3>Get your {coin} wallet address</h3>

                    <p className="step-desc">
                        Download the official <a href="https://github.com/hyle-team/zano/releases" target="_blank" rel="noopener noreferrer">Zano wallet</a> and follow the <a href="https://docs.zano.org/docs/getting-started-1#download-and-install-zano-app" target="_blank" rel="noopener noreferrer">instructions</a> to install it.
                    </p>

                    <p className="step-desc">This address will be used to send your payouts and to acceses your statistics dashboard.</p>
                    <p className="step-desc">Wallet Address: </p>
                    <input className="wallet-address" type="text" placeholder={default_addr} onChange={(e) => setAddr(e.target.value)} />
                </li>
                <li>
                    <h3>Choose your worker name</h3>
                    <p className="step-desc">The worker name will show up in your miner dashboard along with its statistics.</p>
                    <p className="step-desc">Worker name:</p>
                    <input className="wallet-address" type="text" placeholder={default_worker} onChange={(e) => setWorker(e.target.value)} />

                </li>
                <li>
                    <h3>Choose a mining server</h3>
                    
                    <p className="step-desc">Choose the mining server closest to your worker for the best latency. </p>
                    <p className="step-desc">Stratum Server:</p>
                    <select className="server-select" onChange={(e) => setUrl(e.target.value)}>
                        {servers.map(s => {
                            return <option key={s.endpoint } value={s.endpoint}>{`${s.country} (${s.endpoint})`}</option>
                        })}
                    </select>
                </li>
                <li>
                    <h3>Pick mining software</h3>
                    <p>Download your preferred mining software, enter your auto-generated configuration and let's get started!</p>
                        <p className="step-desc">Worker Name: </p>

                    {
                        [trexMiner].map(miner => {
                            return <div className="mining-software" key={miner.name}>
                                <h4>{miner.name}</h4>
                                <p>
                                    {miner.getConfig(addr, url, worker, coinData.algo)}
                                </p>
                            </div>;
                        })
                    }
                </li>
            </ol>
        </div>
    )
}
import { useMemo, useRef, useState } from "react";
import { Column } from "./SortableTable"
import './GetStarted.css'
import './Stats.css'
import './Home.css'
import ToCoin from "./CoinMap";
import GIcon from "./GIcon";

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

const wallet_instruction: { [pretty: string]: JSX.Element } = {
    "VRSC": (<>
        Download the official <a href="https://verus.io/wallet" target="_blank" rel="noopener noreferrer">Verus wallet</a> and follow the instructions to install it.</>),
    "ZANO": (<>
        Download the official <a href="https://github.com/hyle-team/zano/releases" target="_blank" rel="noopener noreferrer">Zano wallet</a> and follow the <a href="https://docs.zano.org/docs/getting-started-1#download-and-install-zano-app" target="_blank" rel="noopener noreferrer">instructions</a> to install it.</>)
}

export default function GetStarted(props: Props) {
    const coinData = ToCoin(props.coinPretty);
    const default_addr = 'ADDRESS';
    const default_worker = 'WORKER1';
    const [url, setUrl] = useState(servers[0].endpoint);
    const [addr, setAddr] = useState(default_addr);
    const [worker, setWorker] = useState(default_worker);
    const [currentStep, setCurrentStep] = useState(0);
    const [handshakeText, setHandshakeText] = useState('');

    const copyIconRef = useRef<HTMLInputElement>(null);
    const workerNameRef = useRef<HTMLInputElement>(null);
    const serverSelectRef = useRef<HTMLSelectElement>(null);
    const steps = useMemo(() => {
        return [
            {
                icon: 'account_balance_wallet',
                title: `Get your ${coinData.name} wallet address`,
                component: (<>
                    <p className="step-desc">
                        {wallet_instruction[coinData.symbol]}
                    </p>

                    <p className="step-desc">This address will be used to send your payouts and to acceses your statistics dashboard.</p>
                    <p className="step-desc">Wallet Address: </p>
                    <input className="wallet-address" type="text" placeholder={default_addr}
                        onChange={(e) => setAddr(e.target.value)} onBlur={(e) => {
                            setCurrentStep(1);
                            workerNameRef.current?.focus()  
                        }} />
                </>)
            },
            {
                icon: 'badge',
                title: "Choose your worker name",
                component: (<>
                    <p className="step-desc">The worker name will show up in your miner dashboard along with its statistics.</p>
                    <p className="step-desc">Worker name:</p>
                    <input className="wallet-address" ref={workerNameRef} type="text" placeholder={default_worker} onChange={(e) => setWorker(e.target.value)} onBlur={() => { setCurrentStep(2); serverSelectRef.current?.focus() }} />
                </>)
            },
            {
                icon: 'dns',
                title: 'Choose a mining server',
                component: <>
                    <p className="step-desc">Choose the mining server closest to your worker for the best latency. </p>
                    <p className="step-desc">Stratum Server:</p>
                    <select className="server-select" ref={serverSelectRef} onChange={(e) => { setUrl(e.target?.value); setCurrentStep(3); }}>
                        <option disabled selected> Select a server </option>

                        {servers.map(s => {
                            return <option key={s.endpoint} value={s.endpoint}>{`${s.country} (${s.endpoint})`}</option>
                        })}
                    </select>
                </>
            },
            {
                icon: 'terminal',
                title: 'Choose mining software',
                component:
                    <>
                        <p>Download your preferred mining software, enter your auto-generated configuration and let's get started!</p>
                        <p className="step-desc">Worker Name: </p>

                        {
                            [trexMiner].map(miner => {
                                const config = miner.getConfig(addr, url, worker, coinData.algo);
                                return <div className="mining-software" key={miner.name} onClick={(e) => {
                                    setCurrentStep(4);
                                    copyIconRef.current?.classList.add('step-done');
                                    navigator.clipboard.writeText(config)
                                    setHandshakeText("Good luck mining!");
                                }} >
                                    <div className="mining-software-header">
                                        <h4>{miner.name}</h4>
                                        <div ref={copyIconRef} className={"copy-holder" + (currentStep === 4 ? " step-done" : "")} onAnimationEnd={(e) => (e.target as HTMLElement).classList.remove("step-done")}>
                                            <GIcon name="content_copy" />
                                        </div>
                                    </div>
                                    <p>
                                        {config}
                                    </p>
                                </div>;
                            })
                        }
                    </>
            },
            {
                icon: 'handshake',
                title:  handshakeText
            }
        ]
    }, [coinData, worker, url, addr, currentStep])

    return (
        <div className="stats-container steps-container">
            <p className="stats-title">Get started mining: {coinData.name}</p>
            <p>Follow these simple steps to mine at SickPool</p>

            <ol className="steps-list">
                {
                    steps.map((step, i) => {
                        let isStepDone = i < currentStep;
                        return (
                            <li key={step.icon}>
                                <div className="step-gap">
                                    <GIcon name={step.icon} classNameAddition={i <= currentStep ? "step-done" : ""} />
                                    <div className={"step-gap-line" + (isStepDone ? " gap-done" : "")}/>
                                    <div className={"step-gap-line" + (isStepDone ? " gap-done" : "")}/>
                                </div>
                                <div className="step">
                                    <div className="step-title">
                                        <h3>{step.title}</h3>
                                    </div>
                                    {step.component}
                                </div>
                            </li>
                        )
                    })
                }
            </ol>
        </div>
    )
}
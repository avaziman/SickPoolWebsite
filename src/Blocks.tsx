import { useState, useEffect, useMemo } from 'react';
import SortableTable, { Sort, Column, ApiTableResult } from './SortableTable';
import { toLatin, timeToText, truncateAddress } from './utils'
import { Link, useParams } from 'react-router-dom';
import ToCoin from './CoinMap';
import HashrateChart from './HashrateChart';
import { basicFetcher, hrChartData } from './Stats';
import { hrToText } from './utils';

const { REACT_APP_API_URL } = process.env;


require('./Blocks.css')

const COLUMNS: Column[] =
    [
        {
            header: 'No.',
            sortBy: 'number'
        },
        {
            header: 'Depth',
        },
        {
            header: 'Chain',
        },
        {
            header: 'Type',
        },
        {
            header: 'Height',
        },
        {
            header: 'Reward',
            sortBy: 'reward'
        },
        {
            header: 'Solver',
        },
        {
            header: 'Difficulty',
            sortBy: 'difficulty'
        },
        {
            header: 'Effort',
            sortBy: 'effort'
        },
        {
            header: 'Duration',
            sortBy: 'duration'
        },
        {
            header: 'Date',
            //same order as number
        },
    ];

interface Block {
    confirmations: number;
    blockType: number;
    reward: number;
    time: number;
    duration: number;
    height: number;
    number: number;
    difficulty: number;
    effortPercent: number;
    chain: string;
    solver: string;
    worker: string;
    hash: string;
}

interface Props {
    isDarkMode: boolean;
}

export default function Blocks(props: Props) {

    const { coinPretty } = useParams();
    const coinData = ToCoin(coinPretty ?? '');
    const coinSymbol: string = coinData.symbol;
    
    // remove chain column if there is only one chain...
    !coinData.multi_chain && COLUMNS.splice(2, 1);
    
    let columns = useMemo(() => COLUMNS, []);
    // let columns = useMemo(() => coinData.multi_chain ? COLUMNS : COLUMNS, []);
    let [blockStats, setBlockStats] = useState({ effortPercent: 0, start: Date.now() });
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/roundOverview?coin=${coinSymbol}`).then(res => res.json()).then(res => {
            setBlockStats({
                effortPercent: res.result.effortPercent,
                start: res.result.start,
            });
        }).catch(err => { });

    }, []);


    
    function ShowEntry(block: Block) {

        function GetBlockType(type: number) {
            return <td></td>;
        }

        return (<tr>
            <td>
                <a href={`${coinData.explorer_url}/block/${block.hash}`} target="_blank" rel="noreferrer">
                    {block.number}
                </a>
            </td>
            <td>{block.confirmations}</td>
            
            { coinData.multi_chain && <td>{block.chain} </td>}
            <td>
                {(block.blockType & 0b1) > 0 && "PoW"}
                {(block.blockType & 0b100) > 0 && " + Payment"}
            </td>
            <td>{block.height}</td>
            <td>{block.reward / 1e8}</td>
            <td><Link to={`/${coinPretty}/solver/${block.solver}`}>
                {truncateAddress(block.solver)}</Link>
            </td>
            <td>{toLatin(block.difficulty)}</td>
            <td>{block.effortPercent.toPrecision(4)} %</td>
            <td>{timeToText(block.duration)}</td>
            <td>{timeToText(Date.now() - block.time)} ago</td>
        </tr>)
    }

    function LoadBlocks(sort: Sort): Promise<ApiTableResult<Block>> {
        return fetch(`${REACT_APP_API_URL}/pool/blocks?coin=${coinSymbol}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`)
            .then(res => res.json());
    }

    const tabs = [
        {
            "title": "Block",
            "value": "Lifetime history",
            "img":
                (<span className="material-symbols-outlined stats-card-preview" style={{ opacity: "0.85" }}>
                    history
                </span>),
            "component": (
                <div className="table-section">
                    <div id="filter">
                        {/* <div id="chain-selection">
                            <p>Chain: </p>
                        </div> */}
                    </div>
                    <SortableTable id="block-table" columns={columns} showEntry={ShowEntry} defaultSortBy='number' isPaginated={true} loadTable={LoadBlocks} />
                </div>)
        },
        {
            "title": "Difficulty",
            "value": toLatin(1),
            "img":
                (<img loading="lazy" alt={`Difficulty chart`} src={`${REACT_APP_API_URL}/pool/charts/difficultyHistory.svg?coin=${coinSymbol}`} />),
            "component": <HashrateChart type="line" isDarkMode={props.isDarkMode} title="Difficulty History" data_fetcher={() => basicFetcher('difficultyHistory', coinSymbol)} data={hrChartData} toText={(n) => toLatin(n) + "H"} key="1" />
        },
        {
            "title": "Blocks mined",
            "value": "Soon",
            "img":
                (<img loading="lazy" alt={`Difficulty chart`} src={`${REACT_APP_API_URL}/pool/charts/blockCountHistory.svg?coin=${coinSymbol}`} />),
            "component":
                <HashrateChart type="line" isDarkMode={props.isDarkMode} title="Mined Blocks History" data_fetcher={() => basicFetcher('blockCountHistory', coinSymbol)} data={hrChartData} toText={(n) => toLatin(n)} key="2" />
        },
        {
            "title": "Round Effort",
            "value": blockStats.effortPercent.toFixed(3),
            "img":
                (<img loading="lazy" alt={`Block effort chart`} src={`${REACT_APP_API_URL}/pool/charts/blockEffortHistory.svg?coin=${coinSymbol}`} />),
            "component":
                <HashrateChart type="line" isDarkMode={props.isDarkMode} title="Blcok Effort History" data_fetcher={() => basicFetcher('blockEffortHistory', coinSymbol)} data={hrChartData} toText={(n) => n + '%'} key="3" />
        },
    ]


    return (
        <div id="blocks">
            <div className="stats-container">
                <p className="stats-title">Block Statistics: Proof-of-Work</p>
                <div className="stats-card-holder">
                    {/* make selector of time */}
                    {tabs.map((t, i) => {
                        return (
                            <div className={tabIndex === i ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(i)} key={i}>
                                <div>
                                    <h3>{t.title}</h3>
                                    <p>{t.value}</p>
                                </div>
                                {t.img}
                            </div>
                        );
                    })}
                </div>
                {tabs[tabIndex].component}

            </div>
        </div>
    );
}
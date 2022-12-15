import { useState, useEffect, useMemo } from 'react';
import SortableTable, { Sort, Column, ApiTableResult } from './SortableTable';
import { toLatin, timeToText, truncateAddress, toDiff } from './utils'
import { Link, useParams } from 'react-router-dom';
import ToCoin from './CoinMap';
import SickChart from './SickChart';
import { hrToText } from './utils';
import { DataFetcher, Processed, ProcessStats } from './LoadableChart';

const { REACT_APP_API_URL } = process.env;


require('./Blocks.css')

function GetColumns(multi_chain: boolean): Column[] {
    let arr = [
        {
            header: 'No.',
            sortBy: 'id'
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
            sortBy: 'effort_percent'
        },
        {
            header: 'Duration',
            sortBy: 'duration_ms'
        },
        {
            header: 'Date',
            //same order as number
        }
    ];

    multi_chain || arr.splice(2, 1);
    return arr;
}

interface Block {
    id: number;
    confirmations: number;
    blockType: number;
    reward: number;
    timeMs: number;
    durationMs: number;
    height: number;
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

    let columns = useMemo(() => GetColumns(coinData.multi_chain), []);
    let [blockStats, setBlockStats] = useState({ effortPercent: 0, start: Date.now() });
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        // remove chain column if there is only one chain...



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
                    {block.id}
                </a>
            </td>
            <td>{block.confirmations}</td>

            {coinData.multi_chain && <td>{block.chain} </td>}
            <td>
                {(block.blockType & 0b1) > 0 && "PoW"}
                {(block.blockType & 0b100) > 0 && " + Payment"}
            </td>
            <td>{block.height}</td>
            <td>{block.reward / 1e8}</td>
            <td><Link to={`/${coinPretty}/miner/${block.solver}`}>
                {truncateAddress(block.solver)}</Link>
            </td>
            <td>{toLatin(block.difficulty)}</td>
            <td>{block.effortPercent.toPrecision(4)} %</td>
            <td>{timeToText(block.durationMs)}</td>
            <td>{timeToText(Date.now() - block.timeMs)} ago</td>
        </tr>)
    }

    function LoadBlocks(sort: Sort): Promise<ApiTableResult<Block>> {
        return fetch(`${REACT_APP_API_URL}/pool/blocks?coin=${coinSymbol}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`)
            .then(res => res.json());
    }

    function svg(alt: string, loc: string) {
        return (<img loading="lazy" alt={alt} src={`${REACT_APP_API_URL}${loc}?coin=${coinSymbol}`} onError={(e) => (e.target as HTMLElement).style.display = 'none'} />)
    }


    const [processedData, setProcessedData] = useState<Processed>({ timestamps: [], datasets: [] });
    const [error, setError] = useState<string>();

    useEffect(() => {
        setError(undefined);
        tabs[tabIndex].data_fetcher().then((r: Processed) => setProcessedData(r)).catch((e) => setError(e));

    }, [tabIndex]);

    function StatChart(title: string, toText: (n: number) => string) {
        return <SickChart type="line" isDarkMode={props.isDarkMode} title={title}
            processedData={processedData} error={error} toText={(n: any) => toText(n)} />;
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
                    <SortableTable id="block-table" columns={columns} showEntry={ShowEntry} defaultSortBy='id' isPaginated={true} loadTable={LoadBlocks} />
                </div>),
            "data_fetcher": (): Promise<Processed> => new Promise<Processed>(() => { })
        },
        {
            "title": "Difficulty",
            "value": toDiff(1),
            "img":
                svg('Difficulty chart', '/pool/charts/difficultyHistory.svg'),
            "component": StatChart("Difficulty History", (n: number) => toLatin(n) + "H"),
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/pool/difficultyHistory?coin=${coinData.symbol}`,
                process_res: (r) => ProcessStats(r, 'Difficulty')
            })
        },
        {
            "title": "Blocks mined",
            "value": "Soon",
            "img":
                svg('Blocks mined chart', '/pool/charts/blocksMinedHistory.svg'),
            "component":
                StatChart("Mined Blocks History", (n: number) => toLatin(n)),
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/blocksMinedHistory?coin=${coinData.symbol}`,
                process_res: (r) => ProcessStats(r, 'Block count')
            })
        },
        {
            "title": "Round Effort / Duration",
            "value": blockStats.effortPercent.toFixed(3) + '%',
            "img":
                svg('Block effort chart', '/pool/charts/blockEffortHistory.svg'),
            "component":
                StatChart("Block Effort History", (n: number) => toLatin(n)),
            "data_fetcher": () => DataFetcher({
                url: `${REACT_APP_API_URL}/blockEffortHistory?coin=${coinData.symbol}`,
                process_res: (r) => ProcessStats(r, 'Block effort')
            })
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
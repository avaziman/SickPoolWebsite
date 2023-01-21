import { useState, useEffect, useMemo, useCallback } from 'react';
import SortableTable, { Sort, Column, ApiTableResult } from './SortableTable';
import { toLatin, timeToText, truncateAddress, toDiff, toLatinInt } from './utils'
import { Link } from 'react-router-dom';
import ToCoin, { Coin } from './CoinMap';
import SickChart from './SickChart';
import { DataFetcher, Processed, ProcessStats } from './LoadableChart';
import { toCoinStr } from './Payouts';

const { REACT_APP_API_URL } = process.env;


require('./Blocks.css')

function GetColumns(multi_chain: boolean): Column[] {
    let arr = [
        {
            header: 'No.',
            sortBy: 'id',
            width: '0'
        },
        {
            header: 'Status',
            sortBy: 'status',
            width: '0'
        },
        {
            header: 'Chain',
        },
        // {
        //     header: 'Type',
        // },
        {
            header: 'Height',
            // width: '4rem'
        },
        {
            header: 'Reward',
            sortBy: 'reward',
            // width: '4rem'
        },
        {
            header: 'Solver Hash',
            // width: '10rem'
        },
        {
            header: 'Difficulty',
            sortBy: 'difficulty',
            // width: '4rem'

        },
        {
            header: 'Effort',
            sortBy: 'effort_percent',
            // width: '4rem'
        },
        {
            header: 'Duration',
            sortBy: 'duration_ms',
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
    status: number;
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
    coinPretty: string;
}

interface RoundOverview {
    effortPercent: number;
    startTime: number;
}

interface BlocksOverview {
    currentRound: RoundOverview;
    height: number;
    orphans: number;
    mined: number;
    averageEffort: number;
    averageDuration: number;
    mined24h: number;
    difficulty: number;
    confirmations: number;
}

function ShowEntry(block: Block, coinData: Coin) {
    return (
        <tr key={block.hash}>
            <td>
                <a href={`${coinData.explorer_url}/block/${block.hash}`} target="_blank" rel="noreferrer">
                    {block.id}
                </a>
            </td>

            {coinData.multi_chain && <td>{block.chain} </td>}
            <td>
                <span className="material-symbols-outlined notranslate">
                    {block.status === 0b1 && 'hourglass_empty'}  {/* pending */}
                    {(block.status & 0b10) > 0 && 'done'}        {/* confirmed */}
                    {(block.status & 0b100) > 0 && 'error'}      {/* orphaned */}
                </span>
            </td>
            {/* <td>
                {(block.blockType & 0b1) > 0 && "PoW"}
                {(block.blockType & 0b100) > 0 && " + Payment"}
            </td> */}
            <td>{block.height.toLocaleString()}</td>
            <td>{toCoinStr(block.reward, coinData)}</td>
            <td className='primary-color'>
                {/* <Link to={`/${coinData.name}/miner/${block.solver}`}>
                {truncateAddress(block.solver)}
            </Link> */}
                {block.solver}
            </td>
            <td>{toLatin(block.difficulty)}</td>
            <td>{block.effortPercent.toLocaleString(undefined, { maximumFractionDigits: 2 })} %</td>
            <td>{timeToText(block.durationMs)}</td>
            <td>{timeToText(Date.now() - block.timeMs)} ago</td>
        </tr>)
}

function toLatinPercent(n: number) {
    return toLatin(n) + '%';
}

function LoadBlocks(sort: Sort, coinSymbol: string): Promise<ApiTableResult<Block>> {
    return fetch(`${REACT_APP_API_URL}/pool/blocks?coin=${coinSymbol}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`)
        .then(res => res.json());
}

export default function Blocks(props: Props) {

    const coinData = ToCoin(props.coinPretty);
    const coinSymbol: string = coinData.symbol;

    let columns = useMemo(() => GetColumns(coinData.multi_chain), [coinData]);

    let [blockStats, setBlockStats] = useState<BlocksOverview>({
        currentRound: { startTime: Date.now(), effortPercent: 0 },
        height: 0,
        orphans: 0,
        mined: 0,
        averageEffort: 0,
        averageDuration: 0,
        mined24h: 0,
        difficulty: 0,
        confirmations: 0
    });

    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        // remove chain column if there is only one chain...



        fetch(`${REACT_APP_API_URL}/pool/blockOverview?coin=${coinSymbol}`).then(res => res.json()).then(res => {
            if (!res.error) {
                setBlockStats(res.result as BlocksOverview);
            }
        }).catch(err => { });

    }, [coinSymbol]);


    function svg(alt: string, loc: string) {
        return (<img loading="lazy" alt={alt} src={`${REACT_APP_API_URL}${loc}?coin=${coinSymbol}`} onError={(e) => (e.target as HTMLElement).style.display = 'none'} />)
    }

    const [processedData, setProcessedData] = useState<Processed>({ timestamps: [], datasets: [] });
    const [error, setError] = useState<string>();

    const ShowBlock = useCallback((block: Block) => ShowEntry(block, coinData), [coinData])
    const LoadBlocksCb = useCallback((sort: Sort) => LoadBlocks(sort, coinData.symbol), [coinData])

    const tabs = useMemo(() => {
        return [
            {
                "title": "Block",
                "value": "Lifetime history",
                "img":
                    (<span className="material-symbols-outlined notranslate stats-card-preview" style={{ opacity: "0.85" }}>
                        history
                    </span>),
                "component": (
                    <div className="table-section">
                        <div id="filter">
                            {/* <div id="chain-selection">
                            <p>Chain: </p>
                        </div> */}
                        </div>
                        <SortableTable id="block-table" columns={columns} showEntry={ShowBlock} defaultSortBy='id' isPaginated={true} loadTable={LoadBlocksCb} />
                    </div>),
                "data_fetcher": (): Promise<Processed> => new Promise<Processed>(() => { })
            },
            {
                "title": "Difficulty",
                "value": toDiff(blockStats.difficulty),
                "img":
                    svg('Difficulty chart', '/pool/charts/difficultyHistory.svg'),
                "component": <SickChart type={'line'} isDarkMode={props.isDarkMode} title='Difficulty History'
                    processedData={processedData} error={error} toText={toDiff} />,
                "data_fetcher": () => DataFetcher({
                    url: `${REACT_APP_API_URL}/network/history/difficulty?coin=${coinData.symbol}`,
                    process_res: (r) => ProcessStats(r, 'Difficulty')
                })
            },
            {
                "title": "Blocks mined 24H",
                "value": toLatin(blockStats.mined24h),
                "img":
                    svg('Blocks mined 24H chart', '/pool/charts/blocksMinedHistory.svg'),
                "component":
                    <SickChart type={'bar'} isDarkMode={props.isDarkMode} title='Mined Blocks History'
                        processedData={processedData} error={error} toText={toLatinInt} />,
                "data_fetcher": () => DataFetcher({
                    url: `${REACT_APP_API_URL}/pool/history/blocks-mined?coin=${coinData.symbol}`,
                    process_res: (r) => ProcessStats(r, 'Block count')
                })
            },
            {
                "title": "Round Effort & Duration",
                "value": `${blockStats.currentRound.effortPercent.toLocaleString(undefined, { maximumFractionDigits: 2 })}% / ${timeToText(Date.now() - blockStats.currentRound.startTime)}`,
                "img":
                    svg('Block effort chart', '/pool/charts/blockEffortHistory.svg'),
                "component":
                    <SickChart type={'bar'} isDarkMode={props.isDarkMode} title='Block Effort History'
                        processedData={processedData} error={error} toText={toLatinPercent} />,
                "data_fetcher": () => DataFetcher({
                    url: `${REACT_APP_API_URL}/pool/history/round-effort?coin=${coinData.symbol}`,
                    process_res: (r) => ProcessStats(r, 'Block effort')
                })
            },
        ]
    }, [coinData.symbol, columns, blockStats, processedData, error]);

    useEffect(() => {
        setError(undefined);
        tabs[tabIndex].data_fetcher().then((r: Processed) => setProcessedData(r)).catch((e) => setError(e));

    }, [tabIndex]);



    return (
        <div id="blocks">
            <div className="stats-container">
                <p className="stats-title">Block Statistics: Proof-of-Work</p>

                <div className="stats-card stats-list">
                    <span>Current Height: {blockStats.height.toLocaleString()}</span>
                    <span>Confirmations needed: {blockStats.confirmations}</span>
                    {/* <span>Block reward: {blockStats.confirmations}</span>
                    <span>Block time: {blockStats.confirmations}</span> */}
                    <span>Total blocks mined: {blockStats.mined}</span>
                    <span>Orphans: {blockStats.orphans} ({
                        (blockStats.orphans / (blockStats.mined === 0 ? 1 : blockStats.mined) * 100)
                            .toLocaleString(undefined, { maximumFractionDigits: 3 })
                    }%)</span>
                    <span>Average block effort: {blockStats.averageEffort.toLocaleString(undefined, { maximumFractionDigits: 2 })}%</span>
                    <span>Average round duration: {timeToText(blockStats.averageDuration)}</span>
                </div>
                <div className="stats-card-holder">
                    {/* make selector of time */}
                    {tabs.map((t, i) => {
                        return (
                            <div className={tabIndex === i ? "stats-card stats-card-active" : "stats-card"} onClick={() => setTabIndex(i)} key={t.title}>
                                <div>
                                    <h3>{t.title}</h3>
                                    <p>{t.value}</p>
                                </div>
                                {/* {t.img} */} {/* TODO: FIX */}
                            </div>
                        );
                    })}
                </div>
                {tabs[tabIndex].component}
            </div>
        </div>
    );
}
import { useState, useEffect, useMemo, useCallback } from 'react';
import SortableTable, { Column } from './SortableTable';
import { toLatin, timeToText, truncateAddress, toDiff } from './utils'
import { Link } from 'react-router-dom';
import ToCoin, { Coin } from './CoinMap';
import SickChart from './SickChart';
import { SingleChartFetcher, Processed, ProcessSingleChart } from './LoadableChart';
import { toCoinStr } from './Payouts';
import { GetResult, GetTableResult } from './api';
import GIcon from './GIcon';
import { BlockOverview } from './bindings/BlockOverview'
import { BlockSubmission } from './bindings/BlockSubmission';
import { TableRes } from './bindings/TableRes';
import { TableQuerySort } from './bindings/TableQuerySort';

const { REACT_APP_API_URL } = process.env;


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

interface Props {
    isDarkMode: boolean;
    coinPretty: string;
}

function GetBlockStatusIcon(block: BlockSubmission) {
    if (block.status === 0b1) { return 'hourglass_empty'; /* pending */ }
    else if ((block.status & 0b10) > 0) { return 'done'; /* confirmed */ }
    // else if ((block.status & 0b100) > 0) { return 'error' /* orphaned */ }
    return 'error';/* orphaned */;
}

function ShowEntry(block: BlockSubmission, coinData: Coin) {
    return (
        <tr key={block.hash}>
            <td>
                <a href={`${coinData.explorer_url}/block/${block.hash}`} target="_blank" rel="noreferrer">
                    {block.id}
                </a>
            </td>

            {coinData.multi_chain && <td>{block.chain} </td>}
            <td>
                <GIcon name={GetBlockStatusIcon(block)} />
            </td>
            {/* <td>
                {(block.blockType & 0b1) > 0 && "PoW"}
                {(block.blockType & 0b100) > 0 && " + Payment"}
            </td> */}
            <td>{block.height.toLocaleString()}</td>
            <td>{toCoinStr(block.reward as unknown as number, coinData)}</td>
            <td className='primary-color'>
                {/* <Link to={`/${coinData.name}/miner/${block.solver}`}>
                {truncateAddress(block.solver)}
            </Link> */}
                {block.solver}
            </td>
            <td>{toLatin(block.difficulty)}</td>
            <td>{block.effortPercent.toLocaleString(undefined, { maximumFractionDigits: 2 })} %</td>
            <td>{timeToText(block.durationMs as unknown as number)}</td>
            <td>{timeToText(Date.now() - (block.timeMs as unknown as number))} ago</td>
        </tr>)
}

function toLatinPercent(n: number) {
    return toLatin(n) + '%';
}

function LoadBlocks(sort: TableQuerySort, coinSymbol: string): Promise<TableRes<BlockSubmission>> {
    return GetTableResult<BlockSubmission>('pool/blocks', coinSymbol, sort);
}

function svg(coinSymbol: string, alt: string, loc: string) {
    return (<img loading="lazy" alt={alt} src={`${REACT_APP_API_URL}${loc}?coin=${coinSymbol}`} onError={(e) => (e.target as HTMLElement).style.display = 'none'} />)
}

export default function Blocks(props: Props) {

    const coinData = ToCoin(props.coinPretty);

    let columns = useMemo(() => GetColumns(coinData.multi_chain), [coinData]);

    let [blockStats, setBlockStats] = useState<BlockOverview>({
        currentRound: { startTime: BigInt(Date.now()), effortPercent: 0 },
        height: 0,
        orphans: 0,
        mined: 0,
        averageEffort: 0,
        averageDuration: 0,
        mined24H: 0,
        difficulty: 0,
        confirmations: 0
    });

    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        // remove chain column if there is only one chain...



        GetResult<BlockOverview>('pool/blockOverview', coinData.symbol)
            .then(res => {
                setBlockStats(res);
            }).catch(() => { });

    }, [coinData.symbol]);


    const [processedData, setProcessedData] = useState<Processed>({ timestamps: [], datasets: [] });
    const [error, setError] = useState<string>();

    const ShowBlock = useCallback((block: BlockSubmission) => ShowEntry(block, coinData), [coinData])
    const LoadBlocksCb = useCallback((sort: TableQuerySort) => LoadBlocks(sort, coinData.symbol), [coinData])

    const tabsHeaders = useMemo(() => {
        return [
            {
                "title": "Block",
                "value": "Lifetime history",
                "img":
                    (<GIcon classNameAddition='stats-card-preview' name="history" /* style={{ opacity: "0.85" }} */ />)
            },
            {
                "title": "Difficulty",
                "value": toDiff(blockStats.difficulty),
                "img":
                    svg(coinData.symbol, 'Difficulty chart', '/pool/charts/difficultyHistory.svg'),
            },
            {
                "title": "Blocks mined 24H",
                "value": toLatin(blockStats.mined24H),
                "img":
                    svg(coinData.symbol, 'Blocks mined 24H chart', '/pool/charts/blocksMinedHistory.svg'),
            },
            {
                "title": "Round Effort & Duration",
                "value": `${blockStats.currentRound.effortPercent.toLocaleString(undefined, { maximumFractionDigits: 2 })}% / ${timeToText(Date.now() - (Number(blockStats.currentRound.startTime)))}`,
                "img":
                    svg(coinData.symbol, 'Block effort chart', '/pool/charts/blockEffortHistory.svg'),
            },
        ]
    }, [coinData.symbol, blockStats]);

    const tabComponents = useMemo(() => [
        { component: <SortableTable id="block-table" columns={columns} showEntry={ShowBlock} defaultSortBy='id' loadTable={LoadBlocksCb} isPaginated={true} /> },
        {
            component: <SickChart type={'line'} isDarkMode={props.isDarkMode} title='Difficulty History' processedData={processedData} error={error} toText={toDiff} precision={0} />, data_fetcher: () => SingleChartFetcher({
                url: 'pool/history/difficulty',
                coin: coinData.symbol,
                process_res: (r) => ProcessSingleChart(r, 'Block difficulty')
            })
        },
        {
            component: <SickChart type={'bar'} isDarkMode={props.isDarkMode} title='Mined Blocks History' processedData={processedData} error={error} toText={toLatin} precision={0} />, data_fetcher: () => SingleChartFetcher({
                url: 'pool/history/blocks-mined',
                coin: coinData.symbol,
                process_res: (r) => ProcessSingleChart(r, 'Block count')
            })
        },
        {
            component: <SickChart type={'bar'} isDarkMode={props.isDarkMode} title='Block Effort History' processedData={processedData} error={error} toText={toLatinPercent} precision={2} />, data_fetcher: () => SingleChartFetcher({
                url: 'pool/history/round-effort',
                coin: coinData.symbol,
                process_res: (r) => ProcessSingleChart(r, 'Block effort')
            })
        }

    ], [coinData.symbol, processedData, error, props.isDarkMode, columns, ShowBlock, LoadBlocksCb])

    useEffect(() => {
        setError(undefined);
        let fetchFn = tabComponents[tabIndex].data_fetcher;
        if (fetchFn) {
            fetchFn()?.then((r: Processed) => setProcessedData(r)).catch((e) => setError(e));
        }

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
                    {tabsHeaders.map((t, i) => {
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
                {tabComponents[tabIndex].component}
            </div>
        </div>
    );
}
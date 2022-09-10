import { useState, useEffect, useMemo } from 'react';
import SortableTable, { Sort, Column, ApiTableResult } from './SortableTable';
import { toLatin, timeToText, truncateAddress } from './utils'
import { Link, useParams } from 'react-router-dom';
import ToCoinSymbol from './CoinMap';

const { REACT_APP_API_URL } = process.env;


require('./Blocks.css')

const COLUMNS: Column[] =
    [
        {
            header: 'No.',
            sortBy: 'number'
        },
        {
            header: 'Confirmations',
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
    block_type: number;
    reward: number;
    time: number;
    duration: number;
    height: number;
    number: number;
    difficulty: number;
    effort_percent: number;
    chain: string;
    solver: string;
    worker: string;
    hash: string;
}

export default function Blocks() {

    const { coinPretty } = useParams();
    let columns = useMemo(() => COLUMNS, []);
    let [blockStats, setBlockStats] = useState({ effortPercent: 0, start: Date.now() });

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/roundOverview?coin=${coinSymbol}`).then(res => res.json()).then(res => {
            setBlockStats({
                effortPercent: res.result.effortPercent,
                start: res.result.start,
            });
        }).catch(err => { });

    }, []);

    if (!coinPretty) {
        alert('No coin.');
        return <div></div>;
    }

    const coinData = ToCoinSymbol(coinPretty);
    const coinSymbol: string = coinData.symbol;


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
            <td>{block.chain} </td>
            <td>
                {(block.block_type & 0b1) > 0 && "PoW"}
                {(block.block_type & 0b100) > 0 && " + Payment"}
            </td> 
            <td>{block.height}</td>
            <td>{block.reward / 1e8}</td>
            <td><Link to={`/${coinPretty}/solver/${block.solver}`}>
                {truncateAddress(block.solver)}</Link>
            </td>
            <td>{toLatin(block.difficulty)}</td>
            <td>{block.effort_percent.toPrecision(4)} %</td>
            <td>{timeToText(block.duration)}</td>
            <td>{timeToText(Date.now() - block.time)} ago</td>
        </tr>)
    }

    function LoadBlocks(sort: Sort) : Promise<ApiTableResult<Block>> {
        return fetch(`${REACT_APP_API_URL}/pool/blocks?coin=${coinSymbol}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`)
            .then(res => res.json());
    }

    return (
        <div id="blocks">
            <div className="stats-container">
                <p className="stats-title">Block Statistics: Proof-of-Work</p>
                <div className="stats-card-holder">
                    {/* make selector of time */}
                    <div className="stats-card">
                        <h3>Round Effort</h3>
                        <p>{blockStats.effortPercent.toFixed(3)}%</p>
                    </div>
                    <div className="stats-card">
                        <h3>Round Time</h3>
                        <p>{timeToText(Date.now() - blockStats.start)}</p>
                    </div>
                    <div className="stats-card">
                        <h3>Blocks</h3>
                        {/* <p>500 / 500</p> */}
                        <p>Soon</p>
                    </div>
                    <div className="stats-card">
                        <h3>Avg. Effort</h3>
                        <p>Soon</p>
                    </div>
                    {/* <div className="stats-card">
                        <h3>PoS Blocks Effort</h3>
                        <p>Soon</p>
                    </div>
                    <div className="stats-card">
                        <h3>PoS Blocks</h3>
                        <p>Soon</p>
                    </div> */}
                </div>

                <div className="table-section">
                    <div id="filter">
                        {/* <div id="chain-selection">
                            <p>Chain: </p>
                        </div> */}
                    </div>
                    <SortableTable id="block-table" columns={columns} showEntry={ShowEntry} defaultSortBy='number' isPaginated={true} loadTable={LoadBlocks} />
                </div>
            </div>
        </div>
    );
}
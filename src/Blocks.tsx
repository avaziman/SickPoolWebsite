import { useState, useEffect, useMemo } from 'react';
import { DropDownArrow, SortDown, SortUp } from './components/Icon';
import SortableTable, { Sort, Column, ApiTableResult } from './SortableTable';
import { diffToText, timeToText, unixTimeToClockText, truncateAddress } from './utils'
import { Link, useParams } from 'react-router-dom';
import ToCoinSymbol from './ToCoinSymbol';

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

    const coin_symbol: string = coinPretty ? ToCoinSymbol(coinPretty) : 'unknown';

    let columns = useMemo(() => COLUMNS, []);

    let [blockStats, setBlockStats] = useState({ pow_effort: 0, pow_blocks: 0, pos_effort: 0, pos_blocks: 0 });

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/currentEffortPoW`).then(res => res.json()).then(res => {
            setBlockStats({
                pow_effort: res.result * 100,
                pow_blocks: 0,
                pos_effort: 0,
                pos_blocks: 0
            });
        }).catch(err => { });

    }, []);

    function ShowEntry(block: Block) {
        return (<tr>
            <td>{block.number}</td>
            <td>{block.confirmations}</td>
            <td>{block.chain} </td>
            <td>{block.block_type == 1 ? "PoW" : "PoS"} </td>
            <td>{block.height}</td>
            <td>{block.reward / 1e8}</td>
            <td><Link to={`/verus/solver/${block.solver}`}>
                {truncateAddress(block.solver)}</Link>
            </td>
            <td>{diffToText(block.difficulty)}</td>
            <td>{block.effort_percent.toPrecision(4)} %</td>
            <td>{timeToText(block.duration)}</td>
            <td>{timeToText(Date.now() - block.time)} ago</td>
        </tr>)
    }

    function LoadBlocks(sort: Sort) : Promise<ApiTableResult<Block>> {
        return fetch(`${REACT_APP_API_URL}/pool/blocks?coin=${coin_symbol}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`)
            .then(res => res.json());
    }

    return (
        <div id="blocks">
            <div className="stats-container">
                <p className="stats-title">Block Statistics</p>
                <div className="stats-card-holder">
                    <div className="stats-card">
                        <h3>PoW Round Effort</h3>
                        <p>{blockStats.pow_effort.toFixed(3)}%</p>
                    </div>
                    <div className="stats-card">
                        <h3>PoW Blocks</h3>
                        <p>Soon</p>
                    </div>
                    <div className="stats-card">
                        <h3>PoS Blocks Effort</h3>
                        <p>Soon</p>
                    </div>
                    <div className="stats-card">
                        <h3>PoS Blocks</h3>
                        <p>Soon</p>
                    </div>
                </div>

                <div className="table-section">
                    <div id="filter">
                        {/* <div id="chain-selection">
                            <p>Chain: </p>
                        </div> */}
                    </div>
                    <SortableTable id="block-table" columns={columns} showEntry={ShowEntry} isPaginated={true} loadTable={LoadBlocks} />
                </div>
            </div>
        </div>
    );
}
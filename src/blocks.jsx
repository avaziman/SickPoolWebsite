import { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table/dist/react-table.development';
import { DropDownArrow, SortDown, SortUp } from './components/Icon';
import SortableTable from './SortableTable';
import { diffToText, timeToText, unixTimeToClockText, truncateAddress } from './utils'
import { Link } from 'react-router-dom';

const { REACT_APP_API_URL } = process.env;


require('./Blocks.css')

const COLUMNS =
    [
        {
            header: 'No.',
            sortBy: 'number'
        },
        {
            header: 'Confirmations',
            sortBy: null,
        },
        {
            header: 'Chain',
            sortBy: null,
        },
        {
            header: 'Type',
            sortBy: null,
        },
        {
            header: 'Height',
            sortBy: null,
        },
        {
            header: 'Reward',
            sortBy: 'reward'
        },
        {
            header: 'Solver',
            sortBy: null,
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
            sortBy: null //'number' //same order as number
        },
    ];

export default function Blocks() {

    let columns = useMemo(() => COLUMNS, []);

    let [blockStats, setBlockStats] = useState({ pow_effort: 0, pow_blocks: 0, pos_effort: 0, pos_effort: 0 });

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/currentEffortPoW`).then(res => res.json()).then(powEffort => {
            setBlockStats({
                pow_effort: powEffort * 100,
                pow_blocks: 0,
                pos_effort: 0,
                pos_blocks: 0
            });
        }).catch(err => { });

    }, []);

    function ShowEntry(block) {
        return (<tr>
            <td>{block.number}</td>
            <td>{block.confirmations}</td>
            <td>{block.chain} </td>
            <td>{block.block_type} </td>
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
                    <SortableTable id="block-table" columns={columns} showEntry={ShowEntry} entryName="Block" section="pool" isPaginated={true} defaultSortBy={columns[0].sortBy} />
                </div>
            </div>
        </div>
    );
}
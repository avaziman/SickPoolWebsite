import { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table/dist/react-table.development';
import { DropDownArrow, SortDown, SortUp } from './components/Icon';
import { diffToText, timeToText, unixTimeToClockText, truncateAddress } from './utils'

require('./Blocks.css')

const COLUMNS =
    [
        {
            header: 'No.',
            sortBy: 'number'
        },
        {
            header: 'Status',
            sortBy: 'accepted'
        },
        {
            header: 'Chain',
            sortBy: 'chain'
        },
        {
            header: 'Type',
            sortBy: 'type'
        },
        {
            header: 'Height',
            sortBy: 'height'
        },
        {
            header: 'Reward',
            sortBy: 'reward'
        },
        {
            header: 'Solver',
            sortBy: 'solver'
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
            sortBy: 'duration'
        },
        {
            header: 'Date',
            sortBy: 'number' //same order as number
        },
    ];

export default function Blocks() {

    let columns = useMemo(() => COLUMNS, []);
    let [blocks, setBlocks] = useState([]);
    let [totalEntries, setTotalEntries] = useState(0);
    let [sort, setSort] = useState({ page: 0, limit: 10, by: "number", dir: "desc" });
    let [error, setError] = useState(null);

    const url = "http://127.0.0.1:8080/verus";
    useEffect(() => {
        fetch(`${url}/pool/blocks?page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`)
            .then(res => res.json())
            .then(data => {
                setBlocks(data.blocks);
                setTotalEntries(data.total);
                setError(null);
            })
            .catch(err => {
                console.log(err);
                setError("Failed to retrieve blocks");
            });
    }, [sort]);

    // let tableInstance = useTable({
    //     columns,
    //     blocks
    // });

    // const {
    //     getTableProps,
    //     getTableBodyProps,
    //     headerGroups,
    //     rows,
    //     prepareRow,
    // } = tableInstance;

    function onTableHeaderClick(column) {
        if (!column) return;

        let dir = "desc";
        if (sort.by === column) {
            dir = sort.dir === "desc" ? "asc" : "desc";
        }

        setSort({
            page: 0, // reset the page count if the sortby changes
            limit: sort.limit,
            dir: dir,
            by: column
        });
    }

    function onLimitChange(e) {
        let newLimit = e.target.value;
        let newPage = sort.page;
        if (sort.page * sort.limit + newLimit > totalEntries) {
            newPage = Math.floor(totalEntries / newLimit);
        }
        setSort({
            page: newPage,
            limit: newLimit,
            dir: sort.dir,
            by: sort.by
        });
    }

    function onPageChange(e) {
        let newPage = e.target.value;
        setSort({
            page: newPage,
            limit: sort.limit,
            dir: sort.dir,
            by: sort.by
        });
    }

    return (
        <div id="blocks">
            <div className="stats-card-holder">
                <div className="stats-card">
                    <p className="stats-card-key">PoW Round Effort</p>
                    <p className="stats-card-val">{111}%</p>
                </div>
                <div className="stats-card">
                    <p className="stats-card-key">PoW Round Effort</p>
                    <p className="stats-card-val">{111}%</p>
                </div>
                <div className="stats-card">
                    <p className="stats-card-key">PoW Round Effort</p>
                    <p className="stats-card-val">{111}%</p>
                </div>
                <div className="stats-card">
                    <p className="stats-card-key">PoW Round Effort</p>
                    <p className="stats-card-val">{111}%</p>
                </div>
            </div>
            <div id="table-container">
                <div id="table-wrapper">
                    <div id="table-section">
                        <div id="filter">
                            {/* <div id="chain-selection">
                            <p>Chain: </p>
                        </div> */}
                        </div>
                        <table id="block-table">
                            <thead>
                                <tr>
                                    {columns.map(column => {
                                        return (
                                            <th onClick={(e) => onTableHeaderClick(column.sortBy)}>
                                                {column.header} {sort.by != column.sortBy ? ""
                                                    : sort.dir == "desc" ? "\u25be" : "\u25b4"}
                                            </th>
                                        )
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {!error && !blocks.length && <td id="loading" colSpan={COLUMNS.length}>Loading...</td>}
                                {error && <tr><td id="error" colSpan={COLUMNS.length}>{error} :(</td></tr>}
                                {
                                    blocks.map((block, index) => {
                                        return (
                                            <tr>
                                                <td>{block.number}</td>
                                                <td>{block.is_accepted ? "OK" : "ORPHANED"}</td>
                                                <td>{block.chain} </td>
                                                <td>{block.block_type} </td>
                                                <td>{block.height}</td>
                                                <td>{block.reward / 1e8}</td>
                                                <td>{truncateAddress(block.solver)}</td>
                                                <td>{diffToText(block.difficulty)}</td>
                                                <td>{block.effort_percent} %</td>
                                                <td>{timeToText(block.duration)}</td>
                                                <td>{timeToText(Date.now() - block.time)} ago</td>
                                                {/* <td>{block.chain}</td> */}
                                                {/* <td>{block.height}</td>
                                <td>{block.reward}</td>
                                <td>{block.worker}</td>
                                <td>{block.difficulty}</td>
                                <td>{block.effort_percent}%</td> */}
                                            </tr>)
                                    })
                                }
                            </tbody>

                        </table>
                    </div>
                    <div id="table-navigator">
                        <div id="table-navigator-left">
                            <span>Blocks per page: </span>
                            <select value={sort.limit} onChange={(e) => { onLimitChange(e); }}>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                        </div>
                        <div id="table-navigator-center">
                            <span>Page: </span>
                            <select value={sort.page} onChange={(e) => { onPageChange(e); }}>
                                {

                                    //todo: check
                                    Array.from(Array(Math.ceil(totalEntries / sort.limit) + 1).keys())
                                        .map((pageIndex) => { return <option value={pageIndex}>{pageIndex + 1}</option>; })
                                }
                            </select>
                        </div>
                        <div id="table-navigator-right">
                            <span>Showing {sort.limit * sort.page}-{Math.min(sort.limit * (+sort.page + 1), totalEntries)} of {totalEntries} blocks</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
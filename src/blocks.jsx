import { useState, useEffect, useMemo } from 'react';
import { useTable } from 'react-table/dist/react-table.development';

require('./Blocks.css')

const COLUMNS =
    [
        {
            Header: 'Status',
            accessor: 'is_accepted'
        },
        // {
        //     Header: 'Chain',
        //     accessor: 'chain'
        // },
        {
            Header: 'Height',
            accessor: 'height'
        },
        {
            Header: 'Reward',
            accessor: 'reward'
        },
        {
            Header: 'Miner',
            accessor: 'worker'
        },
        {
            Header: 'Difficulty',
            accessor: 'difficulty'
        },
        {
            Header: 'Effort',
            accessor: 'effort_percent'
        },
        {
            Header: 'Duration',
            accessor: 'duration'
        },
        {
            Header: 'Date',
            accessor: 'time'
        },
    ];

export default function Blocks() {

    let columns = useMemo(() => COLUMNS, []);
    let [blocks, setBlocks] = useState([]);

    useEffect(() => {
        fetch(`http://127.0.0.1:8080/verus/pool/blocks?page=15&limit=1`).then(res => res.json()).then(data => setBlocks(data)).catch(err => console.log(err));
    }, []);

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

    console.log("data", blocks);
    return (
        <div>
            <div id="filter">
                <div id="chain-selection">
                    <p>Chain: </p>
                </div>
            </div>
            <table id="block-table">
                <tr>
                    {/* <th>Number</th> */}
                    <th>#</th>
                    <th>Status</th>
                    <th>Chain</th>
                    <th>Height</th>
                    <th>Reward</th>
                    <th>Miner</th>
                    <th>Difficulty</th>
                    <th>Effort</th>
                    <th>Duration</th>
                    <th>Date</th>
                </tr>
            </table>
        </div>
    );
}
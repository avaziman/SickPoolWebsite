import { useMemo } from 'react'
import { Link } from 'react-router-dom';
import SortableTable from "./SortableTable";
import { timeToText, hrToText } from './utils';

const COLUMNS = [
    {
        header: 'Address',
        sortBy: null
    },
    {
        header: 'Staking/balance',
        sortBy: 'balance'
    },
    {
        header: 'Hashrate',
        sortBy: 'hashrate'
    },
    {
        header: 'Workers',
        sortBy: 'worker-count'
    },
    {
        header: 'Joined',
        sortBy: 'join-time'
    }
]

export default function Solvers() {

    const columns = useMemo(() => COLUMNS, []);

    function ShowEntry(solver) {
        return (
            <tr>
                <td><Link to={`/verus/solver/${solver.address}`}>{solver.address}</Link></td>
                <td>{solver.balance}</td>
                <td>{hrToText(solver.hashrate)}</td>
                <td>{solver.worker_count}</td>
                <td>{timeToText(Date.now() - solver.joined * 1000)} ago</td>
            </tr>
        )
    }

    return (
        <div id="table-section">
            <div id="filter">
                {/* <div id="chain-selection">
                            <p>Chain: </p>
                        </div> */}
            </div>
            <div className="stats-container">
                <p className="stats-title">Solvers table</p>
                <SortableTable columns={columns} entryName="Solver" showEntry={ShowEntry} defaultSortBy={ columns[1].sortBy} />
            </div>
        </div>
    );
}
import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom';
import SortableTable, { Column, Sort, TableResult, ApiTableResult } from "./SortableTable";
import ToCoinSymbol from './CoinMap';
import { timeToText, hrToText } from './utils';
const { REACT_APP_API_URL } = process.env;

const COLUMNS: Column[] = [
    {
        header: 'Address',
    },
    {
        header: 'Balance',
        sortBy: 'mature-balance'
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

interface Solver {
    address: string;
    hashrate: number;
    worker_count: number;
    balance: number;
    joined: number;
}

export default function Solvers() {
    const { coinPretty } = useParams();
    const coin_symbol: string = coinPretty ? ToCoinSymbol(coinPretty).symbol : 'unknown';

    const columns = useMemo(() => COLUMNS, []);

    function ShowEntry(solver: Solver) : JSX.Element {
        return (
            <tr>
                <td><Link to={`/${coinPretty}/solver/${solver.address}`}>{solver.address}</Link></td>
                <td>{solver.balance}</td>
                <td>{hrToText(solver.hashrate)}</td>
                <td>{solver.worker_count}</td>
                <td>{timeToText(Date.now() - solver.joined * 1000)} ago</td>
            </tr>
        )
    }

    function LoadSolvers(sort: Sort): Promise<ApiTableResult<Solver>> {
        return fetch(`${REACT_APP_API_URL}/pool/solvers?coin=${coin_symbol}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`)
            .then(res => res.json());
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
                <SortableTable id="solver-table" columns={columns} loadTable={LoadSolvers} showEntry={ShowEntry} isPaginated={true} defaultSortBy="hashrate"/>
            </div>
        </div>
    );
}
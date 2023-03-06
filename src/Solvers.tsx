import { useCallback, useMemo } from 'react'
import SortableTable, { Column, Sort, ApiTableResult } from "./SortableTable";
import ToCoin from './CoinMap';
import { timeToText, hrToText, truncateAddress } from './utils';
const { REACT_APP_API_URL } = process.env;

const COLUMNS: Column[] = [
    {
        header: 'Address hash',
    },
    {
        header: 'Balance',
        sortBy: 'mature_balance'
    },
    {
        header: 'Hashrate',
        sortBy: 'hashrate'
    },
    // {
    //     header: 'Workers',
    //     sortBy: 'worker-count'
    // },
    {
        header: 'Round Effort',
        sortBy: 'round-effort'
    },
    {
        header: 'Joined',
        sortBy: 'join_time'
    }
]

interface Solver {
    address: string;
    hashrate: number;
    // worker_count: number;
    roundEffort: number;
    matureBalance: number;
    joined: number;
}


interface Props { 
    coinPretty: string;
}

function ShowEntry(solver: Solver, coinPretty: string): JSX.Element {
    return (
        <tr key={solver.address}>
            <td className="primary-color">{/* <Link to={`/${coinPretty}/miner/${solver.address}`}>{truncateAddress(solver.address)}</Link> */}{ solver.address}</td>
            <td>{(solver.matureBalance / 1e8).toPrecision(5)}</td>
            <td>{hrToText(solver.hashrate)}</td>
            <td>{(solver.roundEffort * 100).toPrecision(4)}%</td>
            <td>{timeToText(Date.now() - (solver.joined))} ago</td>
        </tr>
    )
}
function LoadSolvers(sort: Sort, coin_symbol: string): Promise<ApiTableResult<Solver>> {
    return fetch(`${REACT_APP_API_URL}/pool/miners?coin=${coin_symbol}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`)
        .then(res => res.json());
}


export default function Solvers(props: Props) {
    const coin_symbol: string = ToCoin(props.coinPretty).symbol;

    const columns = useMemo(() => COLUMNS, []);



    const ShowSolver = useCallback((s: Solver) => ShowEntry(s, props.coinPretty), [props]);
    const LoadSolversCb = useCallback((s: Sort) => LoadSolvers(s, coin_symbol), [coin_symbol]);

    return (
        <div id="table-section">
            <div className="stats-container">
                <p className="stats-title">Miners Table</p>
                {/* <p>
                    Hashes of miner addresses are shown, to respect and prolong Zano's confidential nature by keeping mining addresses private.
                </p> */}
                <SortableTable id="solver-table" columns={columns} loadTable={LoadSolversCb} showEntry={ShowSolver} isPaginated={true} defaultSortBy="hashrate"/>
            </div>
        </div>
    );
}
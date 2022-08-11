import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom';
import SortableTable, { Column, TableResult, Sort, ApiTableResult } from "./SortableTable";
import ToCoinSymbol from './ToCoinSymbol';
import { timeToText, hrToText } from './utils';
const { REACT_APP_API_URL } = process.env;

const COLUMNS: Column[] = [
    {
        header: 'TxId',
    },
    {
        header: 'Amount',
        sortBy: 'mature-balance'
    },
    {
        header: 'Payees',
        sortBy: 'worker-count'
    },
    {
        header: 'Time',
        sortBy: 'join-time'
    }
]

interface Payout {
    txId: string;
    txFee: number;
    amount: number;
    payeeAmount: number;
}

export default function Payouts() {
    const { coinPretty } = useParams();

    const coin_symbol: string = coinPretty ? ToCoinSymbol(coinPretty) : 'unknown';


    const columns = useMemo(() => COLUMNS, []);

    function ShowEntry(payout: Payout) : JSX.Element{
        return (
            <tr>
                <td>{payout.txId}</td>
                <td>{payout.amount}</td>
                <td>{hrToText(payout.txFee)}</td>
                <td>{payout.payeeAmount}</td>
            </tr>
        )
    }

    function LoadPayments(sort: Sort) : Promise<ApiTableResult<Payout>>{
        return fetch(`${REACT_APP_API_URL}/pool/solvers?coin=${coin_symbol}&page=${sort.page}&limit=${sort.limit}&sortby=${sort.by}&sortdir=${sort.dir}`).
            then(res => res.json());
    }

    return (
        <div id="table-section">
            <div id="filter">
                {/* <div id="chain-selection">
                            <p>Chain: </p>
                        </div> */}
            </div>
            <div className="stats-container">
                <p className="stats-title">Payouts Table</p>
                <SortableTable id="payouts-table" columns={columns}  showEntry={ShowEntry} isPaginated={true} loadTable={LoadPayments} />
            </div>
        </div>
    );
}
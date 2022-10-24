import { useMemo } from 'react'
import { useParams } from 'react-router-dom';
import SortableTable, { Column, Sort, ApiTableResult } from "./SortableTable";
import ToCoin from './CoinMap';
import { timeToText } from './utils';
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
        header: 'Tx Fee',
        // sortBy: 'join-time'
    },
    {
        header: 'Time',
        sortBy: 'join-time'
    }
]

interface Payout {
    txId: string;
    txFee: number;
    paidAmount: number;
    payeeAmount: number;
    timeMs: number;
}

export default function Payouts() {
    const { coinPretty } = useParams();
    const columns = useMemo(() => COLUMNS, []);

    if (!coinPretty) {
        alert('No coin.');
        return <div></div>;
    }

    const coinData = ToCoin(coinPretty);
    const coin_symbol: string = coinPretty ? ToCoin(coinPretty).symbol : 'unknown';


    function ShowEntry(payout: Payout): JSX.Element {
        return (
            <tr>
                <td>
                    <a href={`${coinData.explorer_url}/tx/${payout.txId}`} target="_blank">
                        {payout.txId}
                    </a>
                </td>
                <td>{(payout.paidAmount / 1e8)} { coinData.symbol}</td>
                <td>{payout.payeeAmount}</td>
                <td>{payout.txFee}</td>
                <td>{timeToText(Date.now() - payout.timeMs)} ago</td>
            </tr>
        )
    }

    function LoadPayments(sort: Sort): Promise<ApiTableResult<Payout>> {
        return fetch(`${REACT_APP_API_URL}/pool/payouts?coin=${coin_symbol}&page=${sort.page}&limit=${sort.limit}`).
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
                {/* <section>
                    <p className="stats-title">Payout Policy</p>

                </section> */}
                <p className="stats-title">Payouts Table</p>
                <SortableTable id="payouts-table" columns={columns} showEntry={ShowEntry} isPaginated={true} loadTable={LoadPayments} />
            </div>
        </div>
    );
}
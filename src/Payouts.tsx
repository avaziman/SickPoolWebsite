import { useCallback, useEffect, useMemo, useState } from 'react'
import SortableTable, { Column, Sort, ApiTableResult } from "./SortableTable";
import ToCoin, { Coin } from './CoinMap';
import { timeToText } from './utils';
import { format } from 'fecha'
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

interface PayoutOverview {
    fee: number;
    scheme: string;
    next_payout: number;
    minimum_threshold: number;
    total_paid: number;
    total_payouts: number;
}

function ShowEntry(payout: Payout, coinData: Coin): JSX.Element {
    return (
        <tr>
            <td>
                <a href={`${coinData.explorer_url}/tx/${payout.txId}`} target="_blank" rel="noreferrer">
                    {payout.txId}
                </a>
            </td>
            <td>{(payout.paidAmount / 1e8)} {coinData.symbol}</td>
            <td>{payout.payeeAmount}</td>
            <td>{payout.txFee}</td>
            <td>{timeToText(Date.now() - payout.timeMs)} ago</td>
        </tr>
    )
}

function LoadPayments(sort: Sort, coin_symbol: string): Promise<ApiTableResult<Payout>> {
    return fetch(`${REACT_APP_API_URL}/pool/payouts?coin=${coin_symbol}&page=${sort.page}&limit=${sort.limit}`)
        .then(res => res.json());
}

interface Props {
    coinPretty: string;
}

export default function Payouts(props: Props) {
    const coinPretty = props.coinPretty;

    const coinData = ToCoin(coinPretty);
    const coin_symbol: string = coinData.symbol;

    const columns = useMemo(() => COLUMNS, []);


    const [payoutOverview, setPayoutOverview] = useState<PayoutOverview>({
        fee: 0,
        scheme: 'PPLNS',
        next_payout: Date.now(),
        minimum_threshold: 0,
        total_paid: 0,
        total_payouts: 0
    });

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/payoutOverview?coin=${coinData.symbol}`)
            .then(r => r.json())
            .then(r => setPayoutOverview(r as PayoutOverview))
            .catch(() => { })
    }, [coinData]);

    const ShowPayout = useCallback((payout: Payout) => ShowEntry(payout, coinData), [coinData]);
    const LoadPayoutsCb = useCallback((sort: Sort) => LoadPayments(sort, coin_symbol), [coin_symbol]);

    const next_payout = payoutOverview.next_payout === -1 ? 'pending...' : `in ${timeToText(payoutOverview.next_payout - Date.now())} (${format(new Date(payoutOverview.next_payout * 1000), 'shortTime')})`;

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
                <div className="stats-card stats-list">
                    <span>Payout Scheme: {payoutOverview.scheme}, Fee: {(payoutOverview.fee * 100).toPrecision(3) + '%'}</span>
                    <span>Minimum Payout Threshold: {payoutOverview.minimum_threshold}</span>
                    <span>Next Payout:  {next_payout}
                    </span>
                    <span>Total Paid: {payoutOverview.total_paid}</span>
            </div>
                <SortableTable id="payouts-table" columns={columns} showEntry={ShowPayout} isPaginated={true} loadTable={LoadPayoutsCb} />
            </div>
        </div>
    );
}
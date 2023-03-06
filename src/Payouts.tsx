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
        header: 'Payees',
        sortBy: 'worker-count'
    },
    {
        header: 'Amount',
        sortBy: 'mature-balance'
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
    txid: string;
    txFee: number;
    paidAmount: number;
    payeeAmount: number;
    timeMs: number;
}

export interface PayoutOverview {
    fee: number;
    scheme: string;
    nextPayout: number;
    minimumThreshold: number;
    totalPaid: number;
    totalPayouts: number;
}

function ShowEntry(payout: Payout, coinData: Coin): JSX.Element {
    return (
        <tr>
            <td>
                <a href={`${coinData.explorer_url}/${coinData.explorer_tx_prefix}/${payout.txid}`} target="_blank" rel="noreferrer">
                    {payout.txid}
                </a>
            </td>
            <td>{payout.payeeAmount}</td>
            <td>{toCoinStr(payout.paidAmount, coinData)}</td>
            <td>{toCoinStr(payout.txFee, coinData)}</td>
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

    const columns = useMemo(() => COLUMNS, []);


    const [payoutOverview, setPayoutOverview] = useState<PayoutOverview>({
        fee: 0,
        scheme: 'PPLNS',
        nextPayout: Date.now(),
        minimumThreshold: 0,
        totalPaid: 0,
        totalPayouts: 0
    });

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/payoutOverview?coin=${coinData.symbol}`)
            .then(r => r.json())
            .then(r => setPayoutOverview(r as PayoutOverview))
            .catch(() => { })
    }, [coinData]);

    const ShowPayoutCb = useCallback((payout: Payout) => ShowEntry(payout, coinData), [coinData]);
    const LoadPayoutsCb = useCallback((sort: Sort) => LoadPayments(sort, coinData.symbol), [coinData.symbol]);

    const payoutsTable = useMemo(() =>
        <SortableTable id="payouts-table" columns={columns} showEntry={ShowPayoutCb} loadTable={LoadPayoutsCb} isPaginated={true} />
        , [columns, ShowPayoutCb, LoadPayoutsCb]
    );

    const next_payout = payoutOverview.nextPayout === -1 ? 'pending...' : `in ${timeToText(payoutOverview.nextPayout - Date.now())} (${format(new Date(payoutOverview.nextPayout * 1000), 'shortTime')})`;

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
                    <span>Minimum Payout Threshold: {toCoinStr(payoutOverview.minimumThreshold, coinData)}</span>
                    <span>Next Payout:  {next_payout}
                    </span>
                    <span>Total Paid: {toCoinStr(payoutOverview.totalPaid, coinData)}</span>
                </div>
                {/* <SortableTable id="payouts-table" columns={columns} showEntry={ShowPayout} isPaginated={true} loadTable={LoadPayoutsCb} /> */}
                {payoutsTable}
            </div>
        </div>
    );
}

export function toCoinStr(n: number, coin: Coin, fractions: number = 2) {
    return `${(n / coin.satoshis).toLocaleString(undefined, { maximumFractionDigits: fractions })} ${coin.symbol}`;
}
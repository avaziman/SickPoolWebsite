import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom';
import SortableTable, { Column, Sort, ApiTableResult } from "./SortableTable";
import ToCoin from './CoinMap';
import { timeToText, toLatin } from './utils';
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

    function ShowEntry(payout: Payout): JSX.Element {
        return (
            <tr>
                <td>
                    <a href={`${coinData.explorer_url}/tx/${payout.txId}`} target="_blank" rel="noreferrer">
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
    
    const tabs = [
        {
            "title": "Payout Scheme / Pool Fee",
            "value": `${payoutOverview.scheme} / ${payoutOverview.fee * 100}%`,
        },
        {
            "title": "Minimum Payout Threshold",
            "value": `${payoutOverview.minimum_threshold} ${coinData.symbol}`,
        },
        {
            "title": "Total paid",
            "value": `${toLatin(payoutOverview.total_paid)} ${coinData.symbol} / ${payoutOverview.total_payouts} Payouts`,
        },
        {
            "title": "Next Payment",
            "value": `in ${timeToText(payoutOverview.next_payout - Date.now())}`,
        },
    ]

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
                <div className="stats-card-holder">
                    {/* make selector of time */}
                    {tabs.map((t, i) => {
                        return (
                            <div className={/*tabIndex === i ? "stats-card stats-card-active" :*/ "stats-card"} onClick={() => { }/*setTabIndex(i)*/} key={i}>
                                <div>
                                    <h3>{t.title}</h3>
                                    <p>{t.value}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <SortableTable id="payouts-table" columns={columns} showEntry={ShowEntry} isPaginated={true} loadTable={LoadPayments} />
            </div>
        </div>
    );
}
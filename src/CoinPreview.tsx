import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coin } from './CoinMap';
import { PayoutOverview, toCoinStr } from './Payouts';
const { REACT_APP_API_URL } = process.env;

interface Props {
    coinData: Coin;
}

export default function CoinPreview(props: Props) {
    const [payoutOverview, setPayoutOverview] = useState<PayoutOverview>({
        fee: 0,
        scheme: 'PPLNS',
        nextPayout: Date.now(),
        minimumThreshold: 0,
        totalPaid: 0,
        totalPayouts: 0
    });

    useEffect(() => {
        fetch(`${REACT_APP_API_URL}/pool/payoutOverview?coin=${props.coinData.symbol}`)
            .then(r => r.json())
            .then(r => setPayoutOverview(r as PayoutOverview))
            .catch(() => { })
    }, [props.coinData]);

    return (
        <div className="coin-preview" key={props.coinData.symbol}>
            <div className="coin-preview-header">
                {/* <VerusIconBlue className="coin-icon"/> */}
                <h2>
                    {props.coinData.name}
                    <img className="coin-logo-preview" alt={props.coinData.symbol + " logo"} src={"/coins/" + props.coinData.logo}/>
                </h2>
                <p>Payout Scheme: {payoutOverview.scheme} </p>
                <p>Pool fee: {(payoutOverview.fee * 100).toPrecision(3) + '%'}</p>
                <p>Algo: {props.coinData.algo}</p>
                <p>Min. payout: {toCoinStr(payoutOverview.minimumThreshold, props.coinData)}</p>
            </div>
            <Link className='get-started start-button' to={`/${props.coinData.name}/get-started`}>
                <p>Start Mining</p>
            </Link>
        </div>
    )
}
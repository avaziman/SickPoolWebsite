import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GetResult } from './api';
import { Coin } from './CoinMap';
import NewSticker from './newSticker';
import { PayoutOverview, toCoinStr } from './Payouts';

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
        GetResult<PayoutOverview>('pool/payoutOverview', props.coinData.symbol)
            .then(r => setPayoutOverview(r))
            .catch(() => { })
    }, [props.coinData]);

    return (
        <Link className='coin-preview' key={props.coinData.symbol} to={`/${props.coinData.name.toLocaleLowerCase()}/stats`}>
            <div className="coin-preview-header">
                {/* <VerusIconBlue className="coin-icon"/> */}
                <h2>
                    <img className="coin-logo-preview" alt={props.coinData.symbol + " logo"} src={"/coins/" + props.coinData.logo}/>
                    <p className="coin-name-preview">{props.coinData.name}</p>
                    {props.coinData.isNew && <NewSticker/>}
                </h2>
                <p>Payout Scheme: {payoutOverview.scheme} </p>
                <p>Pool fee: {(payoutOverview.fee * 100).toPrecision(3) + '%'}</p>
                <p>Algorithm: {props.coinData.algo}</p>
                <p>Min. payout: {toCoinStr(payoutOverview.minimumThreshold, props.coinData, 4)}</p>
            </div>
            <Link className='get-started start-button' to={`/${props.coinData.name.toLocaleLowerCase()}/get-started`}>
                <span className="material-symbols-outlined">
                    rocket_launch
                </span>
                <p>Start Mining</p>
            </Link>
        </Link>
    )
}
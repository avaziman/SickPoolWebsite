import './Home.css'
import './Stats.css'
import { CoinMap } from './CoinMap';
import CoinPreview from './CoinPreview';
import GIcon from './GIcon';

interface BlockProducingInfo {
  fee_type: 'percent' | 'fixed';
  fee: number;
  roi: number;
  minimumColletral: number;
}

export default function Home() {

  return (
    <div>
      <div className="stats-container">
        <p className="stats-title home-title">Get the Most out of your Mining Pool with SickPool:</p>
        {/* <h1>
          Mine, Stake, Host.
        </h1> */}

        <div className="stats-card-holder features">
          <div className="stats-card">
            <GIcon classNameAddition='feature-icon' name='bolt'/>
            <p>Highly efficient mining software written in house</p>
          </div>
          <div className="stats-card">
            <GIcon classNameAddition='feature-icon' name='dns' />
            <p>Robust servers in EU ready to handle your rig</p>
          </div>
          <div className="stats-card">
            <GIcon classNameAddition='feature-icon' name='monitoring' />
            <p>Elaborate statistics on a friendly interface for desktop/mobile</p>
          </div>
          <div className="stats-card">
            <GIcon classNameAddition='feature-icon' name='support' />
            <p>Support with mining related inquiries on our Discord</p>
          </div>
        </div>
        {/* <div className="features">
          <p>Highly efficient mining software written in house</p>
          <p>Payouts every 6 hours</p>
          <p>Robust servers in EU</p>
          <p>Elaborate statistics on a friendly gui for desktop/mobile</p>
          <p>Optional instant payout (not covered)</p>
        </div> */}
        <div className="coins-preview-container">
          {Object.entries(CoinMap).map(([name, coin], i) => <CoinPreview coinData={coin} key={coin.symbol} />)}
        </div>
      </div>
    </div>
  );
}
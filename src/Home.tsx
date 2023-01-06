// import { VerusIconBlue } from './components/Icon';
import { useState } from 'react';
import { Coin, CoinMap } from './CoinMap';
import CoinPreview from './CoinPreview';
import './Home.css'

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
            <span className="material-symbols-outlined notranslate feature-icon">
              bolt
            </span>
            <p>Highly efficient mining software written in house</p>
          </div>
          <div className="stats-card">
            <span className="material-symbols-outlined notranslate feature-icon">
              dns
            </span>
            <p>Robust servers in EU ready to handle your rig</p>
          </div>
          <div className="stats-card">
            <span className="material-symbols-outlined notranslate feature-icon">
              monitoring
            </span>
            <p>Elaborate statistics on a friendly interface for desktop/mobile</p>
          </div>
          <div className="stats-card">
            <span className="material-symbols-outlined notranslate feature-icon">
              support
            </span>
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
        <div id="coins-preview-container">
          {Object.entries(CoinMap).map(([name, coin], i) => <CoinPreview coinData={coin} key={coin.symbol} />)}
        </div>
      </div>
    </div>
  );
}
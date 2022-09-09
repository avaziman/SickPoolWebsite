import { LightningLight, VerusIconBlue } from './components/Icon';
import './Home.css'

interface BlockProducingInfo{
  fee_type: 'percent' | 'fixed';
  fee: number;
  roi: number;
  minimumColletral: number;
}

interface MiningInfo {
  fee_percent: number;
  rewardPerMh: number;
}

interface Coin {
  
}

export default function Home() {
  return (
    <div>
      <div id="introduction">
        <h1>
          Mine, Stake, Host.
        </h1>
        <div id="features">
          <p>Highly efficient mining software written in house</p>
          <p>Payouts every 6 hours</p>
          <p>Transaction fees covered by us</p>
          <p>Optional instant payout (not covered)</p>
        </div>
      </div>
      <div id="coins-preview-container">
        <div id="verus" className="coin-preview">
          {/* <svg viewBox="0 0 209 213" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2">
            <use href="verus_logo.svg#icon" />
          </svg> */}
          <div className="coin-preview-header"><div>
            <VerusIconBlue className="coin-icon"/>
            <h2>Verus</h2>
          </div>
            <span>
              PoW fee: 0%
              <br />
              PoS fee: 0%
            </span>
          </div>
          <div className="earn-estimates">
            <div className="mining-estimate">
              {/* <LightningLight/> */}
              <p className="estimate-title">Mining estimated earnings: </p>
              <p>100MH/s daily,</p>
              {/* <p>{(powHourly * 24).toFixed(3)}VRSC / {toCurrency(powHourly * 24).toFixed(3)}$</p> */}
              <button className="start-button">Start Mining</button>
            </div>
            <div className="staking-estimate">
              <p className="estimate-title">Staking estimated earnings: </p>
              <p>APY: {  }%</p>
              {/* <p>1000 VRSC monthly,</p> */}
              {/* <p>{(posHourly * 24 * 30.42).toFixed(3)}VRSC / {toCurrency(posHourly * 24 * 30.42).toFixed(3)}$ </p> */}
              {/* <button className="start-button">Start Staking</button> */}
            </div>
          </div>
        </div>
        {/* <div id="raptoreum" className="coin-preview">
          <h2>More coins coming soon!</h2>
        </div> */}
      </div>
    </div>
  );
}
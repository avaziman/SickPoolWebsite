import { LightningLight, VerusIconBlue } from './components/Icon';
import './Home.css'

export default function Home() {
  var powHourly = EarnCalculator(100 * 1e6, GetNetworkHr(), 12, 60 * 2);
  var posHourly = EarnCalculator(1000, GetNetworkStaked(), 12, 60 * 2);
  return (
    <div>
      <div id="introduction">
        <h2>
          A hybrid mining & staking pool made easy.
        </h2>
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
              <p>{(powHourly * 24).toFixed(3)}VRSC / {toCurrency(powHourly * 24).toFixed(3)}$</p>
              <button className="start-button">Start Mining</button>
            </div>
            <div className="staking-estimate">
              <p className="estimate-title">Staking estimated earnings: </p>
              <p>APY: {  CalculateAPY(GetNetworkStaked(), VERUS_BLOCK_REWARD, VERUS_BLOCK_TIME * 2).toFixed(3)}%</p>
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

const VERUS_BLOCK_REWARD = 12;
const VERUS_BLOCK_TIME = 60;

function CalculateAPY(networkStaked, blockReward, blockTime) {
  let share = 100 / networkStaked;
  let profit = share * blockReward;
  let hourly = profit * (60 * 60 / blockTime);
        let yearly = 24 * hourly * 365;
        return yearly;
}

function EarnCalculator(hr, totalHr, blockReward, blockTime) {
  let share = hr / totalHr;
  let profit = share * blockReward;
  let hourly = profit * ((60 * 60) / blockTime);
  return hourly;
}

function GetNetworkHr() {
  return 646118477382;
}

function GetNetworkStaked() {
  return 43841950;
}

function toCurrency(n) {
  return n * 0.75;
}
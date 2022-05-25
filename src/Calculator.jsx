import './Calculator.css'

function Calculator() {
    return (
        <div className="Calculator">
            <h3>Mining</h3>
            <div class="field">
                <label for="hr-input">Hashrate</label>
                <div class="field-bar">
                    <input id="hr-input" placeholder="0" onfocus="InputFocus(this)" onfocusout="InputUnfocus(this)"/>
                    <div id="hr-unit-switch">
                    <button id="kh" onclick="hrUnitSwitch(this)">KH</button>
                    <button id="mh" onclick="hrUnitSwitch(this)">MH</button>
                    </div>
                </div>
            </div>
            <div class="field">
                <label for="pcon-input">Power consumption</label>
                <div class="field-bar">
                    <input id="pcon-input" placeholder="0" onfocus="InputFocus(this)" onfocusout="InputUnfocus(this)"/>
                    <span>Watts</span>
                </div>
            </div>
            <div class="field">
                <label for="pcos-input">Power cost</label>
                <div class="field-bar">
                    <input id="pcos-input" placeholder="0" onfocus="InputFocus(this)" onfocusout="InputUnfocus(this)"/>
                    <span>USD/kWh</span>
                </div>
            </div>
            <div class="field">
                <label for="pf-input">Pool fee</label>
                <div class="field-bar">
                    <input id="pf-input" placeholder="0" onfocus="InputFocus(this)" onfocusout="InputUnfocus(this)"/>
                    <span>%</span>
                </div>
            </div>
        </div>
    );
}

export default Calculator;

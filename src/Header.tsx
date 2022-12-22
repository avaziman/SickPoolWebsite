import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl';
import './Header.css'

import SvgBackArrow from './components/Icon/BackArrow';
import { MoonLight as SvgMoonLight, SunlightLight } from './components/Icon';
import ToCoin, { CoinMap } from './CoinMap';

interface ThemeChange {
    (): void;
}

interface Props {
    coinPretty: string;
    theme: boolean;
    dir: 'rtl' | 'ltr';
    themeChange: ThemeChange;
}

function Header(props: Props) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCoinOpen, setIsCoinOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [solverSearch, setSolverSearch] = useState<string>('');

    const coinPretty = props.coinPretty;
    const coinData = ToCoin(coinPretty);

    let navigate = useNavigate();

    let poolNav =
        <>
            {!isSearchOpen &&
                <>
                    {[['stats', 'analytics'], ['miners', 'group'], ['blocks', 'grid_view'], ['payouts', 'payments']].map((s, i) => {
                        return (
                            <NavLink
                                key={i}
                                to={`/${coinPretty}/${s[0]}`}
                                className={p => 'pool-nav-link' + (p.isActive ? ' pool-nav-link-active' : '')}
                            >
                                <span className="material-symbols-outlined pool-nav-icon">
                                    {s[1]}
                                </span>
                                <span className='nav-link-text'>
                                    <FormattedMessage id={s[0]} />
                                </span>
                            </NavLink>);
                    })}
                </>
            }
            <div id="search-field">
                <SvgBackArrow id="close-search" onClick={() => setIsSearchOpen(false)} style={{ display: isSearchOpen ? "flex" : "none" }} />
                <input type="text" className="search-input" placeholder={useIntl().formatMessage({ "id": "searchPlaceHolder" })} dir="ltr"
                    onChange={(e) => { setSolverSearch((e.target as any).value); }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (solverSearch !== '') {
                                navigate(`${coinPretty}/miner/${solverSearch}`);
                                setIsSearchOpen(false);
                            }
                        }
                    }}
                    style={{
                        display: isSearchOpen ? "flex" : "none",
                        width: isSearchOpen ? "100%" : 0
                    }} />
                <button className={"search-button" + (isSearchOpen ? ' pool-nav-link-active search-button-open' : '')} onClick={(e) => {
                    if (isSearchOpen) {
                        if (solverSearch !== '') {
                            navigate(`${coinPretty}/miner/${solverSearch}`);
                        }
                    }

                    setIsSearchOpen(!isSearchOpen);
                }}>
                    <span className="search-name-text">
                        <FormattedMessage id="search" />
                    </span>
                    <span className="material-symbols-outlined pool-nav-icon search-button-icon">
                        search
                    </span>
                </button>
            </div>
        </>

    let coinSelector =
        <>
            {
                Object.entries(CoinMap).map(([name, coin], i) =>
                    <Link 
                        key={i}
                        to={name + document.location.href.substring(document.location.href.lastIndexOf('/'))}
                        onClick={ () => setIsCoinOpen(false)}
                        className={'pool-nav-link'}
                    >
                        <span>
                            <img src={"/assets/coins/" + coin.logo} className="coin-icon" alt={`Coin logo ${coin.name}`} />
                        </span>
                        <span className='nav-link-text'>
                            {coin.name}
                        </span>
                    </Link>
                )
            }
        </>;

    return (
        <header>
            <div id="main-header" dir={props.dir}>
                <div id="main-header-wrapper">
                    <h1>
                        <Link to="/" id="logo">SickPool</Link>
                    </h1>
                    <button className='nav-item icon-change' onClick={() => setIsCoinOpen(!isCoinOpen)}>
                        <img src={"/assets/coins/" + coinData.logo} className="coin-icon" alt="Coin logo" />
                    </button>
                    <div className={isMenuOpen ? 'main-nav-open main-nav' : 'main-nav'}>
                        <div id="main-links">
                            {/* <Link to="/hardware">
                                    <FormattedMessage id="hardware" />
                                </Link>
                                <Link to="/calculator">
                                    <FormattedMessage id="calculator" />
                                </Link> */}
                        </div>
                        {/* <select id="languages" onChange={(e) => props.localeChange(e.target.value)}>
                                <option value="en">English</option>
                                <option value="tr">Türkçe</option>
                                <option value="he">עברית</option>
                            </select >
                            <select id="currencies">
                                <option value="usd">USD</option>
                                <option value="try">TRY</option>
                                <option value="nis">NIS</option>
                            </select > */}
                        {/* <Dropdown id="coin-dropdown" options={CoinOptions} defaultValue={coinPretty}
                                onChange={(e, data) => console.log(data.value)} /> */}
                        <Link className='nav-item' to={`/${coinPretty}/get-started`} id="get-started" onClick={() => setIsMenuOpen(false)}>
                            <p>Get Started</p>
                        </Link>

                        <button className='nav-item theme-change' onClick={() => {
                            props.themeChange();
                            setIsMenuOpen(false);
                        }}>
                            {/* <p>{props.theme ? "Light" : "Dark"} Mode</p> */}
                            {
                                props.theme ? <SunlightLight className="theme-change-icon" /> : <SvgMoonLight className="theme-change-icon" />
                            }
                        </button>

                    </div>
                    <button id="borgir-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <span className="material-symbols-outlined">
                            {
                                !isMenuOpen ? "menu" : "close"
                            }
                        </span>
                    </button>
                </div>
            </div>
            <div id="pool-header" dir={props.dir}>
                {/* <select id="coins">
                        <option value="en">Verus</option>
                        <option value="tr">Raptoreum</option>
                    </select > */}
                <nav id="pool-nav">
                    {!isCoinOpen ? poolNav : coinSelector}
                </nav>

                {/* <button id="get-started">Get Started</button> */}
            </div >
        </header >
    );
}

export default Header;
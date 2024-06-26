import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl';
import './Header.css'
import './Home.css'

import ToCoin, { CoinMap } from './CoinMap';
import NewSticker from './newSticker';
import GIcon from './GIcon';

interface ThemeChange {
    (): void;
}

interface Props {
    coinPretty: string;
    theme: boolean;
    dir: 'rtl' | 'ltr';
    themeChange: ThemeChange;
    lastSearched: string[];
    setLastSearched: (a: string[]) => void;
}

function IsNavActive(p: { isActive: boolean }) {
    return 'pool-nav-link' + (p.isActive ? ' pool-nav-link-active' : '')
}

export default function Header(props: Props) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isCoinOpen, setIsCoinOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [solverSearch, setSolverSearch] = useState<string>('');

    const coinPretty = props.coinPretty;
    const coinData = ToCoin(coinPretty);
    let navigate = useNavigate();

    function SearchOnClick(e: any) {
        if (isSearchOpen) {
            if (solverSearch !== '') {
                navigate(`${coinPretty}/miner/${solverSearch}`);
            }
        }

        setIsSearchOpen(!isSearchOpen);
    }

    function SearchAddress() {
        if (solverSearch !== '') {
            navigate(`${coinPretty}/miner/${solverSearch}`);
            setIsSearchOpen(false);
        }
    }

    let poolNav =
        <>
            {!isSearchOpen &&
                <>
                    {[['stats', 'analytics'], ['miners', 'group'], ['blocks', 'grid_view'], ['payouts', 'payments']].map((s, i) => {
                        return (
                            <NavLink
                                key={s[0]}
                                to={`/${coinPretty}/${s[0]}`}
                                className={IsNavActive}
                            >
                                <GIcon classNameAddition="pool-nav-icon" name={s[1]} isDarkMode={props.theme} />
                                <span className='nav-link-text'>
                                    <FormattedMessage id={s[0]} />
                                </span>
                            </NavLink>);
                    })}
                </>
            }
            <div className={isSearchOpen ? "search-holder-open" : "pool-nav-link"}>
                <div className="search-field">
                    <div className='close-search' onClick={() => setIsSearchOpen(false)}>
                        <GIcon name="keyboard_backspace" />
                    </div>
                    <input
                        className="search-input"
                        type="text"
                        placeholder={useIntl().formatMessage({ "id": "searchPlaceHolder" })} dir="ltr"
                        onChange={(e) => { setSolverSearch((e.target as any).value); }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                SearchAddress();
                            }
                        }} />
                    <button
                        className={"search-button" + (isSearchOpen ? ' pool-nav-link-active search-button-open' : '')}
                        onClick={SearchOnClick}>
                        <span className="search-name-text">
                            <FormattedMessage id="search" />
                        </span>
                        <GIcon classNameAddition='pool-nav-icon search-button-icon' name='search' />
                    </button>
                </div>
                <div className="address-list">
                    {
                        props.lastSearched.map((addr, i) => {
                            return (<p key={addr} onClick={() => { setSolverSearch(addr); SearchAddress(); }}>
                                <span className="addr-span"
                                    >
                                    {addr}
                                </span>
                                <span className='addr-close' onClick={(e) => {
                                    props.setLastSearched(props.lastSearched.filter(i => i !== addr)); e.stopPropagation();}}>
                                    <GIcon name="close" />
                                </span>
                            </p>)
                        })
                    }
                </div>
            </div>
        </>

    let coinSelector =
        <>
            {
                Object.entries(CoinMap).map(([name, coin], i) =>
                    <Link
                        key={name}
                        to={name + document.location.href.substring(document.location.href.lastIndexOf('/'))}
                        onClick={() => setIsCoinOpen(false)}
                        className={'pool-nav-link'}
                    >
                        <span>
                            <img src={"/coins/" + coin.logo} className="coin-icon-header" alt={`Coin logo ${coin.name}`} />
                        </span>
                        <span className='nav-link-text'>
                            {coin.name}
                        </span>
                        {coin.isNew && <NewSticker />}
                    </Link>
                )
            }
        </>;

    return (
        <header>
            <div id="main-header" dir={props.dir}>
                <div id="main-header-wrapper">
                    <h1>
                        <Link to="/" id="logo" className="notranslate">SickPool</Link>
                    </h1>
                    <button className='nav-item icon-change' onClick={() => setIsCoinOpen(!isCoinOpen)}>
                        <img src={"/coins/" + coinData.logo} className="coin-icon-header" alt="Coin logo" />
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
                        <Link className='nav-item get-started' to={`/${coinPretty}/get-started`} onClick={() => setIsMenuOpen(false)}>
                            <p>Get Started</p>
                        </Link>

                        <button className='nav-item theme-change' onClick={() => {
                            props.themeChange();
                            setIsMenuOpen(false);
                        }}>
                                <GIcon name={props.theme ? 'light_mode' : 'dark_mode'} classNameAddition="them-changei"/>
                            {/* <p>{props.theme ? "Light" : "Dark"} Mode</p> */}
                        </button>
                        
                    </div>
                    <button id="borgir-menu" onClick={() => { setIsMenuOpen(!isMenuOpen); setIsSearchOpen(false) }}>
                        <GIcon name={!isMenuOpen ? "menu" : "close"} />
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
            </div>
        </header>
    );
}
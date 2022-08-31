import React, { useState } from 'react'
// import { Dropdown } from 'semantic-ui-react'
import { Link, useNavigate, Router } from 'react-router-dom'
import { FormattedMessage, useIntl } from 'react-intl';
import './Header.css'
import styled from 'styled-components';

import BlockSvg from './components/Icon/Blocks'
import PayoutSvg from './components/Icon/Payouts'
import SolverSvg from './components/Icon/Solvers'
import StatSvg from './components/Icon/Stats'
import SearchSvg from './components/Icon/Search'
import SvgCross from './components/Icon/Cross';
import SvgBackArrow from './components/Icon/BackArrow';
import { Close as SvgClose, MoonLight as SvgMoonLight, SunlightLight } from './components/Icon';
import SvgBorgir from './components/Icon/Borgir';
import SvgSolvers from './components/Icon/Solvers';
import SvgStats from './components/Icon/Stats';

const CoinOptions = [
    {
        value: 'sinovate',
        image: { src: "search.svg" }
    },
    // {
    //     text: 'Komodo',
    //     value: 'KMD',
    //     image: { src: "search.svg" }
    // }
]
interface ThemeChange {
    (): void;
}

interface Props {
    theme: boolean;
    dir: 'rtl' | 'ltr';
    themeChange: ThemeChange;
}

function Header(props: Props) {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [coin, setCoin] = useState(CoinOptions[0].value);
    const [solverSearch, setSolverSearch] = useState<string>('');
    let navigate = useNavigate();


    return (
        <header>
            <div id="main-header" dir={props.dir}>
                <div id="main-header-wrapper">
                    <h1>
                        <Link to="/" id="logo">SickPool</Link>
                    </h1>
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
                        {/* <Dropdown id="coin-dropdown" options={CoinOptions} defaultValue={CoinOptions[0].value}
                                onChange={(e, data) => console.log(data.value)} /> */}
                        <Link className='nav-item' to='/get-started' id="get-started" onClick={() => setIsMenuOpen(false)}>
                            <p>Get Started</p>
                        </Link>
                        <button className='nav-item' id="theme-change" onClick={() => {
                            props.themeChange();
                            setIsMenuOpen(false);
                        }
                        }>
                            {/* <p>{props.theme ? "Light" : "Dark"} Mode</p> */}
                            {
                                props.theme ? <SunlightLight className="theme-change-icon" /> : <SvgMoonLight className="theme-change-icon" />
                            }
                        </button>
                    </div>
                    <button id="borgir-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <svg viewBox="0 0 15 15">
                            {
                                isMenuOpen ? <SvgClose /> : <SvgBorgir />
                            }
                        </svg>
                    </button>
                </div>
            </div>
            <div id="pool-header" dir={props.dir}>
                {/* <select id="coins">
                        <option value="en">Verus</option>
                        <option value="tr">Raptoreum</option>
                    </select > */}
                <nav id="pool-nav">
                    <Link className={'pool-nav-link'} to={`/${coin}/${'stats'}`}
                        style={{ display: isSearchOpen ? "none" : "flex" }}>
                        <span>
                            <FormattedMessage id="stats" />
                        </span>
                        <SvgStats className="pool-nav-icon" />
                    </Link>
                    <Link className={'pool-nav-link'} to={`/${coin}/${'solvers'}`}
                        style={{ display: isSearchOpen ? "none" : "flex" }}>
                        <span>
                            <FormattedMessage id="solvers" />
                        </span>
                        <SvgSolvers className="pool-nav-icon" />
                    </Link>
                    <Link className={'pool-nav-link'} to={`/${coin}/blocks`}
                        style={{ display: isSearchOpen ? "none" : "flex" }}>
                        <span>
                            <FormattedMessage id="blocks" />
                        </span>
                        <BlockSvg className="pool-nav-icon" />
                    </Link>
                    <Link className={'pool-nav-link'} to={`/${coin}/payouts`}
                        style={{ display: isSearchOpen ? "none" : "flex" }}>
                        <span>
                            <FormattedMessage id="payouts" />
                        </span>
                        <PayoutSvg className="pool-nav-icon" />
                    </Link>
                    <div id="search-field">
                        <SvgBackArrow id="close-search" onClick={() => setIsSearchOpen(false)} style={{ display: isSearchOpen ? "flex" : "none" }} />
                        <input type="text" id="search-input" placeholder={useIntl().formatMessage({ "id": "searchPlaceHolder" })} dir="ltr"
                            onChange={(e) => { setSolverSearch((e.target as any).value); }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (solverSearch !== '') {
                                        navigate(`${CoinOptions[0].value}/solver/${solverSearch}`);
                                        setIsSearchOpen(false);
                                    }
                                }
                            }}
                            style={{
                                display: isSearchOpen ? "flex" : "none",
                                width: isSearchOpen ? "100%" : 0
                            }} />
                        <button className={"search-button" + (isSearchOpen ? " search-button-open" : "")} onClick={() => {
                            if (isSearchOpen) {
                                if (solverSearch !== '') {
                                    navigate(`${CoinOptions[0].value}/solver/${solverSearch}`);
                                }
                            }

                            setIsSearchOpen(!isSearchOpen);
                        }}>
                            <span >
                                <FormattedMessage id="search" />
                            </span>
                            <SearchSvg className="pool-nav-icon" />
                        </button>
                    </div>
                </nav>
                {/* <button id="get-started">Get Started</button> */}
            </div >
        </header >
    );
}

export default Header;

function useNagivate() {
    throw new Error('Function not implemented.');
}

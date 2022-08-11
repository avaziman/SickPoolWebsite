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

const CoinOptions = [
    {
        text: 'Verus',
        value: 'verus',
        image: { src: "search.svg" }
    },
    // {
    //     text: 'Komodo',
    //     value: 'KMD',
    //     image: { src: "search.svg" }
    // }
]

const StyledBorgirNav = styled.nav`
    height: 100%;
    // background-color: red;
    display: flex;
    flex-direction: row;

    @media (max-width: 1000px) {
        flex-direction: column;

        #main-links a{
            padding: 1rem;
        }

        position: fixed;
        top: 3.5rem;
        inset-inline-end: 0%;

        width: 100%;
        max-width: 20rem;
        
        transition: transform 0.3s ease-in-out;
        `;
//TODO: think
//         transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
//     }
// `
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
                    <StyledBorgirNav id="main-nav" /*open={isMenuOpen}*/>
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
                        <button id="theme-change" onClick={() => props.themeChange()}>
                            <p>{props.theme ? "Light" : "Dark"} Mode</p>
                        </button>
                    </StyledBorgirNav>
                    <button id="borgir-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        <svg viewBox="0 0 15 15">
                            <use href={isMenuOpen ? "close.svg#icon" : "borgir.svg#icon"} />
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
                    {
                        ['stats', 'solvers', 'blocks', 'payouts'].map((i: string) => {
                            return (
                                <Link className={'pool-nav-link'} key={i} to={`/${coin}/${i}`}
                                    style={{ display: isSearchOpen ? "none" : "flex" }}>
                                    <span>
                                        <FormattedMessage id={i} />
                                    </span>
                                    {/* <use href="blocks.svg#icon"/> */}
                                    {/* <use href={`${i}.svg#icon`} /> */}
                                    <PayoutSvg className="pool-nav-icon" />
                                    {/* <BlockSvg fill="currentColor" /> */}
                                </Link>
                            )
                        })
                    }
                    <div id="search-field">
                        <SvgBackArrow id="close-search" onClick={() => setIsSearchOpen(false)} style={{ display: isSearchOpen ? "flex" : "none" }} />
                        <input type="text" id="search-input" placeholder={useIntl().formatMessage({ "id": "searchPlaceHolder" })} dir="ltr"
                            onKeyPress={(e) => {
                                setSolverSearch((e.target as any).value);
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (solverSearch !== '') {
                                        navigate(`${CoinOptions[0].value}/solver/${solverSearch}`);
                                    }
                                }
                            }}
                            style={{
                                display: isSearchOpen ? "flex" : "none",
                                width: isSearchOpen ? "100%" : 0
                            }} />
                        <button className={"search-button" + (isSearchOpen ? " search-button-open" : "")} onClick={() => {
                            if (isSearchOpen) {
                                navigate(`${CoinOptions[0].value}/solver/${solverSearch}`);
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

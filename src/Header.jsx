import React from 'react'
// import { Dropdown } from 'semantic-ui-react'
import { Link } from 'react-router-dom'
import { FormattedMessage } from 'react-intl';
import './Header.css'
import styled from 'styled-components';

import BlockSvg from './components/Icon/Blocks'
import PayoutSvg from './components/Icon/Payouts'
import SolverSvg from './components/Icon/Solvers'
import StatSvg from './components/Icon/Stats'
import SearchSvg from './components/Icon/Search'

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
        transform: ${({ open }) => open ? 'translateX(0)' : 'translateX(100%)'};
    }
`

class Header extends React.Component {
    state = {
        isSearchOpen: false,
        menuOpen: false,
        coin: CoinOptions[0].value
    }
    render() {
        return (
            <header>
                <div id="main-header" dir={this.props.dir}>
                    <div id="main-header-wrapper">
                        <h1>
                            <Link to="/" id="logo">SickPool</Link>
                        </h1>
                        <StyledBorgirNav id="main-nav" open={this.state.menuOpen}>
                            <div id="main-links">
                                {/* <Link to="/hardware">
                                    <FormattedMessage id="hardware" />
                                </Link>
                                <Link to="/calculator">
                                    <FormattedMessage id="calculator" />
                                </Link> */}
                            </div>
                            {/* <select id="languages" onChange={(e) => this.props.localeChange(e.target.value)}>
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
                            <button id="theme-change" onClick={this.props.themeChange}>
                                { document.documentElement.attributes["theme"] == "dark" ? "Light" : "Dark"} Mode
                            </button>
                        </StyledBorgirNav>
                        <button id="borgir-menu" onClick={() => this.setState({ menuOpen: !this.state.menuOpen })}>
                            <svg viewBox="0 0 15 15">
                                <use href={this.state.menuOpen ? "close.svg#icon" : "borgir.svg#icon"} />
                            </svg>
                        </button>
                    </div>
                </div>
                <div id="pool-header" dir={this.props.dir}>
                    {/* <select id="coins">
                        <option value="en">Verus</option>
                        <option value="tr">Raptoreum</option>
                    </select > */}
                    <nav id="pool-nav">
                        {
                            ['stats', 'solvers', 'blocks', 'payouts'].map(i => {
                                return (
                                    <Link className={'pool-nav-link'} key={i} to={`/${this.state.coin}/${i}`}
                                        style={{ display: this.state.isSearchOpen ? "none" : "flex" }}>
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
                            <FormattedMessage id="searchPlaceHolder">
                                {
                                    (placeholder) => {
                                        return (
                                            <input type="text" id="search-input" placeholder={placeholder} dir="ltr"
                                                style={{
                                                    display: this.state.isSearchOpen ? "flex" : "none",
                                                    width: this.state.isSearchOpen ? "100%" : 0
                                                }} />
                                        );
                                    }
                                }
                            </FormattedMessage>
                            <button id={"search-button" + (this.state.isSearchOpen ? " search-button-open" : "")} onClick={() => this.setState({ isSearchOpen: !this.state.isSearchOpen })}>
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
}

export default Header;
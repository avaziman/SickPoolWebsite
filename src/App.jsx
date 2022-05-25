import { Route, Routes } from 'react-router-dom';
import Home from './Home';
import Calculator from './Calculator';
import Stats from './Stats';
import NotFound from './NotFound'
import Header from './Header';
import Footer from './Footer';
import Verus from './Verus';
import Solver from './Solver';
import './App.css'
import React, { useState } from 'react';

import { IntlProvider } from 'react-intl';
import messages from './messages';
import Blocks from './blocks';

class App extends React.Component {
  state = {
    locale: "en",
    darkMode: true,
  }

  localeChange = (lc) => {
    this.setState({ locale: lc });
  }

  themeChange = () => {
    this.state.darkMode = !this.state.darkMode;
    document.documentElement.setAttribute('theme', this.state.darkMode ?
      'dark' : 'light');
  }

  render() {

    return (
      <IntlProvider locale={this.state.locale} messages={messages[this.state.locale]}>
        <div className="app">
          <Header localeChange={this.localeChange} themeChange={this.themeChange} dir={messages[this.state.locale].dir} />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/verustest/stats" element={<Stats coin="VRSCTEST" />} />
            <Route path="/verus/stats" element={<Stats coin="VRSC" />} />
            <Route path="/verus/solver/*" element={<Solver coin="VRSC" />} />
            <Route path="/verus/blocks/*" element={<Blocks coin="VRSC" />} />
            <Route path="/calculator" element={<Calculator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </div>
      </IntlProvider>
    );
  }
}

export default App;
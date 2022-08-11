import { Link, Route, Routes, Navigate } from 'react-router-dom';
import Home from './Home';
import Calculator from './Calculator';
import Stats from './Stats';
import NotFound from './NotFound'
import Header from './Header';
import Footer from './Footer';
import Verus from './Verus';
import Solver from './Solver';
import Solvers from './Solvers';
import Payouts from './Payouts';
import './App.css'
import React, { useState } from 'react';

import { IntlProvider } from 'react-intl';
import messages from './messages';
import Blocks from './Blocks';

function App() {

  const [locale, setLocale] = useState<'en'>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  let themeChange = () => {
    document.documentElement.setAttribute('theme', !isDarkMode ?
      'dark' : 'light');
    setIsDarkMode(!isDarkMode);
  }

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <div className="app">
        <Header themeChange={themeChange} theme={isDarkMode} dir={messages[locale].dir} /*localeChange={this.localeChange}*/ />
        <Routes>
          <Route path="/">
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<Navigate to="/verus/stats"/>} />
            <Route path=":coinPretty">
              <Route path="stats" element={<Stats />} />
              <Route path="solvers" element={<Solvers />} />
              <Route path="payouts" element={<Payouts />} />
              <Route path="blocks" element={<Blocks />} />
              <Route path="solver">
                <Route path=":address" element={<Solver />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </IntlProvider>
  );
}

export default App;
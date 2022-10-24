import './App.css'
import { Route, Routes, Navigate, useParams } from 'react-router-dom';
import Stats from './Stats';
import NotFound from './NotFound'
import Header from './Header';
import Footer from './Footer';
import Solver from './Solver';
import Solvers from './Solvers';
import Payouts from './Payouts';
import { useState } from 'react';
import Home from './Home'
import { Chart } from 'chart.js'

import { IntlProvider } from 'react-intl';
import messages from './messages';
import Blocks from './Blocks';
import GetStarted from './GetStrated';
import { CoinMap } from './CoinMap';

function App() {

  const [locale, setLocale] = useState<'en'>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  let themeChange = () => {
    document.documentElement.setAttribute('theme', !isDarkMode ?
      'dark' : 'light');
    setIsDarkMode(!isDarkMode);
  }

  let params = window.location.href.substring(window.location.origin.length);
  let coin = params.substring(1, params.indexOf('/', 1)) ?? 'zano';
  coin = CoinMap[coin] ? coin : 'zano';

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <div className="app">
        <Header themeChange={themeChange} theme={isDarkMode} dir={messages[locale].dir} coinPretty={coin}/>
        <Routes>
          <Route path="/">
            <Route path="/get-started" element={<GetStarted/>}/>

            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<Navigate to={`/${coin}/stats`} />}/>
            <Route path=":coinPretty">
              <Route path="stats" element={<Stats isDarkMode={isDarkMode} />} />
              <Route path="solvers" element={<Solvers />} />
              <Route path="payouts" element={<Payouts />} />
              <Route path="blocks" element={<Blocks isDarkMode={isDarkMode} />} />
              <Route path="solver">
                <Route path=":address" element={<Solver isDarkMode={isDarkMode} />} />
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
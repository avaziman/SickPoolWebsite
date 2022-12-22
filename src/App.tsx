import './App.css'
import { Route, Routes, Navigate, useParams, useLocation } from 'react-router-dom';
import Stats from './Stats';
import NotFound from './NotFound'
import Header from './Header';
import Footer from './Footer';
import Solver from './Solver';
import Solvers from './Solvers';
import Payouts from './Payouts';
import { useEffect, useState } from 'react';
import Home from './Home'
import { Chart } from 'chart.js'

import { IntlProvider } from 'react-intl';
import messages from './messages';
import Blocks from './Blocks';
import GetStarted from './GetStarted';
import { CoinMap } from './CoinMap';

function App() {

  const [locale, setLocale] = useState<'en'>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  let themeChange = () => {
    document.documentElement.setAttribute('theme', !isDarkMode ?
      'dark' : 'light');
    setIsDarkMode(!isDarkMode);
  }

  let location = useLocation();

  const [coin, setCoin] = useState<string>('zano');
  useEffect(() => {
    let temp = location.pathname.substring(1, location.pathname.indexOf('/', 1));
    if (temp && CoinMap[temp])
      setCoin(temp);
  }, [location]);

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <div className="app">
        <Header themeChange={themeChange} theme={isDarkMode} dir={messages[locale].dir} coinPretty={coin}/>
        <Routes>
          <Route path="/">

            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<Navigate to={`/${coin}/stats`} />}/>
            <Route path=":coinPretty">
              <Route path="get-started" element={<GetStarted coinPretty={coin} />}/>
              <Route path="stats" element={<Stats coinPretty={coin} isDarkMode={isDarkMode} />} />
              <Route path="miners" element={<Solvers coinPretty={coin} />} />
              <Route path="payouts" element={<Payouts coinPretty={coin} />} />
              <Route path="blocks" element={<Blocks isDarkMode={isDarkMode} coinPretty={ coin} />} />
              <Route path="miner">
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
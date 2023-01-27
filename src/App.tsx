import './App.css'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Stats from './Stats';
import NotFound from './NotFound'
import Header from './Header';
import Footer from './Footer';
import Solver from './Solver';
import Solvers from './Solvers';
import Payouts from './Payouts';
import Home from './Home'

import { IntlProvider } from 'react-intl';
import messages from './messages';
import Blocks from './Blocks';
import GetStarted from './GetStarted';
import { CoinMap } from './CoinMap';
export const LAST_SEARCHED_KEY = "last_searched_addresses";

function App() {

  const [locale, setLocale] = useState<'en'>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(localStorage.getItem("theme") !== "light");
  const [lastSearched, setLastSearched] = useState<string[]>([]);
  const [coin, setCoin] = useState<string>('zano');

  function setTheme(dark: boolean) {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('theme', theme);
    localStorage.setItem('theme', theme);
    setIsDarkMode(dark);
  }
  let themeChange = () => {
    setTheme(!isDarkMode);
  }

  let location = useLocation();

  useEffect(() => {
    setLastSearched(JSON.parse(localStorage.getItem(LAST_SEARCHED_KEY) ?? '[]'));
    console.log('Loaded last searched: ', lastSearched)
  }, [])

  useEffect(() => {
    localStorage.setItem(LAST_SEARCHED_KEY, JSON.stringify(lastSearched))
    console.log('Last searched saved:', lastSearched)
  }, [lastSearched]);

  useEffect(() => {
    setTheme(isDarkMode);
    let temp = location.pathname.substring(1, location.pathname.indexOf('/', 1));
    if (temp && CoinMap[temp])
      setCoin(temp);
  }, [location]);

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <div className="app">
        <Header themeChange={themeChange} theme={isDarkMode} dir={messages[locale].dir} coinPretty={coin}
          lastSearched={lastSearched} setLastSearched={setLastSearched} />
        <Routes>
          <Route path="/">

            <Route path="/" element={<Home />} />
            <Route path="/" element={<Navigate to={`/${coin}/stats`} />}/>
            <Route path=":coinPretty">
              <Route path="get-started" element={<GetStarted coinPretty={coin} />}/>
              <Route path="stats" element={<Stats coinPretty={coin} isDarkMode={isDarkMode} />} />
              <Route path="miners" element={<Solvers coinPretty={coin} />} />
              <Route path="payouts" element={<Payouts coinPretty={coin} />} />
              <Route path="blocks" element={<Blocks isDarkMode={isDarkMode} coinPretty={ coin} />} />
              <Route path="miner">
                <Route path=":address" element={<Solver isDarkMode={isDarkMode} lastSearched={lastSearched} setLastSearched={setLastSearched} />} />
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
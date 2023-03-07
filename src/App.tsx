import './App.css'
import { Route, Routes, Navigate } from 'react-router-dom';
import React, { useEffect, useState, Suspense } from 'react';

import messages from './messages';
import { IntlProvider } from 'react-intl';
import { CoinMap } from './CoinMap';
// don't lazy load these
import Header from './Header'; 
import Footer from './Footer'

// const WidgetBot = React.lazy(() => import('@widgetbot/react-embed'));

const Solver = React.lazy(() => import('./Solver'));
const Solvers = React.lazy(() => import('./Solvers'));
const Payouts = React.lazy(() => import('./Payouts'));
const Home = React.lazy(() => import('./Home'));
const NotFound = React.lazy(() => import('./NotFound'));
const Blocks = React.lazy(() => import('./Blocks'));
const GetStarted = React.lazy(() => import('./GetStarted'));
const Stats = React.lazy(() => import('./Stats'));

export const LAST_SEARCHED_KEY = "last_searched_addresses";

function App() {

  const [locale, setLocale] = useState<'en'>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(localStorage.getItem("theme") !== "light");
  const [lastSearched, setLastSearched] = useState<string[]>([]);
  const [coin, setCoin] = useState<string>('zano');
  const [readyState, setReadyState] = useState('loading');

  function setTheme(dark: boolean) {
    const theme = dark ? 'dark' : 'light';
    document.documentElement.setAttribute('theme', theme);
    localStorage.setItem('theme', theme);
    setIsDarkMode(dark);
  }
  let themeChange = () => {
    setTheme(!isDarkMode);
  }


  useEffect(() => {
    setLastSearched(JSON.parse(localStorage.getItem(LAST_SEARCHED_KEY) ?? '[]'));
    // console.log('Loaded last searched: ', lastSearched)
    document.onreadystatechange = function (e) {
      setReadyState(document.readyState);
    }

    
  }, [])

  useEffect(() => {
    localStorage.setItem(LAST_SEARCHED_KEY, JSON.stringify(lastSearched))
    // console.log('Last searched saved:', lastSearched)
  }, [lastSearched]);

  useEffect(() => {
    setTheme(isDarkMode);
    let temp = document.location.pathname.substring(1, document.location.pathname.indexOf('/', 1));
    if (temp && CoinMap[temp])
      setCoin(temp);
  }, [isDarkMode]);

  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <div className="app">
        <Header themeChange={themeChange} theme={isDarkMode} dir={messages[locale].dir} coinPretty={coin}
          lastSearched={lastSearched} setLastSearched={setLastSearched} />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/">
              <Route path="/" element={<Home />} />
              <Route path=":coinPretty">
                <Route path="get-started" element={<GetStarted coinPretty={coin} />} />
                <Route path="stats" element={<Stats coinPretty={coin} isDarkMode={isDarkMode} />} />
                <Route path="" element={<Navigate to={`/${coin}/stats`} />} />
                <Route path="miners" element={<Solvers coinPretty={coin} />} />
                <Route path="payouts" element={<Payouts coinPretty={coin} />} />
                <Route path="blocks" element={<Blocks isDarkMode={isDarkMode} coinPretty={coin} />} />
                <Route path="miner">
                  <Route path=":address" element={<Solver isDarkMode={isDarkMode} lastSearched={lastSearched} setLastSearched={setLastSearched} />} />
                </Route>
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
          {/* {readyState === 'complete' && <WidgetBot
            server="888722096698576906"
            channel="1056682597318676500"
          />} */}
        <Footer />
        </Suspense>
      </div>
    </IntlProvider >
  );
}

export default App;
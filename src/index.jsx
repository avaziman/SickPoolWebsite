import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './App';

ReactDOM.render((
  <BrowserRouter>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <App />
  </BrowserRouter>
),
  document.getElementById('root')
);
import React from 'react';
import './App.css';
import ReactDOM from 'react-dom/client';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query'
import './index.css';
import Safe from './components/Safe/Safe';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ChainId, ThirdwebProvider, ConnectWallet } from "@thirdweb-dev/react";
import { ThemeProvider } from '@mui/material'
import { createTheme } from '@mui/material/styles';
import { safeLoader } from './loaders';
import Landing from './components/Landing/Landing';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Landing />,
  },
  {
    path: "safe/:safeId",
    element: <Safe />,
    loader: safeLoader
  },
]);

const t: any = {
  palette: {
    type: 'dark',
    primary: {
      main: '#2a7739',
    },
    secondary: {
      main: '#1a64dc',
    },
    background: {
      paper: '#413f3f',
      default: '#0f110f',
    },
    error: {
      main: '#ff1000',
    },
    warning: {
      main: '#ff9400',
    },
    info: {
      main: '#774398',
    },
    success: {
      main: '#18da22',
    },
    divider: '#353232',
  },
};

const theme = createTheme(t)

const queryClient = new QueryClient()

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ThirdwebProvider desiredChainId={ChainId.Goerli}>
          <div className='header'>
            <ConnectWallet />
          </div>
          <div className='app-body'>
            <RouterProvider router={router} />
          </div>
        </ThirdwebProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Safe from './components/Safe';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import { ChainId, ThirdwebProvider } from "@thirdweb-dev/react";

export async function safeLoader({ params }: any) {
  return params.safeId
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "safe/:safeId",
    element: <Safe />,
    loader: safeLoader
  },
]);

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ThirdwebProvider desiredChainId={ChainId.Goerli}>
      <RouterProvider router={router} />
    </ThirdwebProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

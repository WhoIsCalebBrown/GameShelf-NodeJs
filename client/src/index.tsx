import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import client from './apolloClient.ts';
import { ApolloProvider } from '@apollo/client';

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
    <ApolloProvider client={client}>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </ApolloProvider>
);

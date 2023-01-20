import { Alert } from '@mui/material'
import { useLoaderData } from "react-router-dom";
import signMessage from '../../helpers/sign'
import executeSafeTransaction from "../../helpers/execute";
import db, { TransactionData } from "../../helpers/db";
import { useState } from 'react';
import Transaction from './Transaction';
import useMarkTransactionAsExecuted from './hooks/useMarkTransactionsAsExecuted';

export interface Transaction {
    node: {
        confirmations: any;
        id: string;
        to: string;
        data: string;
        value: string;
        nonce: number;
        safe: {
            safe: string;
        }
        isExecuted: boolean;
    }
}

function RenderTransactions() {
    const [txHash, setTxHash] = useState('')
    const [error, setError] = useState('')
    const loaderData: any = useLoaderData();
    const safe = loaderData.safe;
    const transactions: Transaction[] = safe.node.transactions.edges
    const safeAddress: string = safe.node.safe

    // Triggered on safeAddressChange, transactions.length change, txHash change
    useMarkTransactionAsExecuted(safeAddress, transactions, txHash)

    // Sign safe transaction with your wallet
    const signTransaction = async (transaction: any) => {
        const payload = {
            to: transaction.to,
            nonce: transaction.nonce,
            value: transaction.value,
            data: transaction.data,
        } satisfies TransactionData

        const sig = await signMessage(safeAddress, payload)
        if (!sig) {
            return console.log('no signature err')
        }

        await db.saveConfirmation(transaction.id, sig?.address, sig?.signature)

        window.location.reload();
    }

    const executeTx = async(transaction: any) => {
        const resp = await executeSafeTransaction(safeAddress, transaction)
        if (!(resp?.isSuccess)) {
            setError(resp?.data)
            return;
        }
        setTxHash(resp?.data)
    }

    if (error) {
        setTimeout(() => {
            setError('');
        }, 2500);
        return (
            <Alert severity="error">Error: {error}</Alert>
        )
    }

    if (txHash) {
        return (
            <a href={`https://goerli.etherscan.io/tx/${txHash}`}>
                <Alert severity="info">TX is being processed. Click to see on Etherscan</Alert>
            </a>
        )
    }

    return (
        <div>
            {transactions.map((transaction) => (
                <Transaction key={transaction.node.id} executeTx={executeTx} signTransaction={signTransaction} safeAddress={safeAddress} transaction={transaction}/>
            ))}
        </div>
    );
}

export default RenderTransactions;
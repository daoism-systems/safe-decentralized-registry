import { useEffect } from 'react'
import db from '../../../helpers/db';
import { fetchSafeNonce } from '../../../helpers/fetchSafeNonce';
import { Transaction } from '../RenderTransactions';

// Updates ComposeDB Transaction model
// Used to hide transactions that have nonce < next safe nonce
// Works only if you are the owner `Transaction` in ComposeDB
const useMarkTransactionAsExecuted = (safeAddress: string, transactions: Transaction[], trigger: string) => {
    useEffect(() => {
        (async () => {
            const nonce = await fetchSafeNonce(safeAddress)

            for (const transaction of transactions) {
                if (transaction.node.isExecuted) {
                    continue;
                }
                if (transaction.node.nonce < nonce) {
                    await db.markTransactionAsExecuted(transaction.node.id)
                }
            }
        })();
    }, [safeAddress, transactions.length, trigger])
}

export default useMarkTransactionAsExecuted;
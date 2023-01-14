import { Button } from '@mui/material'
import { useLoaderData } from "react-router-dom";
import signMessage from '../helpers/sign'
import executeSafeTransaction from "../helpers/execute";
import db, { TransactionData } from "../helpers/db";

function RenderTransactions() {
    const loaderData: any = useLoaderData();

    const safe = loaderData.safe;
    const transactions: any = safe.node.transactions.edges
    const safeAddress: string = safe.node.safe

    // Sign safe transaction with your wallet
    const signTransaction = async (transaction: any) => {
        const payload: TransactionData = {
            to: transaction.to,
            nonce: transaction.nonce,
            value: transaction.value,
            data: transaction.data,
        }

        const sig = await signMessage(safeAddress, payload)
        if (!sig) {
            return console.log('no signature err')
        }

        await db.saveConfirmation(transaction.id, sig?.address, sig?.signature)

        window.location.reload();
    }

    const renderConfirmations = (confirmations: any) => {
        return (
            <div className='confimations'>
                {confirmations.map((confirmation: any) => (
                    <div key={confirmation.node.id}>
                        <p><strong>Signer:</strong> {confirmation.node.owner} <strong>Signature:</strong> {confirmation.node.signature.slice(0, 15)}...</p>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div>
            {transactions.map((transaction: any) => (
                <div key={transaction.node.id}>
                    <div className='transaction'>
                        <div onClick={() => signTransaction(transaction.node)}>
                            <p><strong>To: </strong>{transaction.node.to}</p>
                            <p><strong>Value:</strong> {transaction.node.value}</p>
                            <p><strong>Data:</strong> {transaction.node.data}</p>
                            <hr />
                            {renderConfirmations(transaction.node.confirmations.edges)}
                        </div>
                        <Button onClick={() => executeSafeTransaction(safeAddress, transaction)} variant="outlined">Execute on chain</Button>
                    </div>
                    <hr />
                </div>
            ))}
        </div>
    );
}

export default RenderTransactions;
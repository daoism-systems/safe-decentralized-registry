import Button from '@mui/material/Button';

interface TransactionProps {
    transaction: any;
    safeAddress: string;
    signTransaction: Function;
    executeTx: Function;
}

function Transaction(props: TransactionProps) {
    const { signTransaction, executeTx } = props;
    const transaction = props.transaction.node

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
        <div hidden={transaction.isExecuted}>
        <div className='transaction'>
            <div onClick={() => signTransaction(transaction)}>
                <p><strong>To: </strong>{transaction.to}</p>
                <p><strong>Nonce: </strong>{transaction.nonce}</p>
                <p><strong>Value:</strong> {transaction.value}</p>
                <p><strong>Data:</strong> {transaction.data}</p>
                <hr />
                {renderConfirmations(transaction.confirmations.edges)}
            </div>
            <Button onClick={() => executeTx(transaction)} variant="outlined">Execute on chain</Button>
        </div>
        <hr />
    </div>
    )
}

export default Transaction;
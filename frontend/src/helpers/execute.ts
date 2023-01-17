import { ethers } from 'ethers';

const executeSafeTransaction = async (safeAddress: string, tx: any) => {
    const transaction: any = tx.node

    // const signatures = transaction.confirmations.edges.map((x: any) => x.node.signature.slice(2)).join('')
    const signatures = transaction.confirmations.edges.sort((a: any, b: any) => a.node.owner.toLowerCase() - b.node.owner.toLowerCase()).map((x: any) => x.node.signature.slice(2)).join('')

    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const signer = provider.getSigner();

    const safeContract = new ethers.Contract(safeAddress, ['function execTransaction(address,uint256,bytes,uint8,uint256 safeTxGas,uint256,uint256,address,address,bytes)'], provider)
    const response = await safeContract.connect(signer).execTransaction(transaction.to, transaction.value, transaction.data, 0, 0, 0, 0, transaction.gasToken, transaction.refundReceiver, `0x${signatures}`)
    console.info('executeSafeTransaction:', response);
    window.open(`https://goerli.etherscan.io/tx/${response.hash}`);
    return response;
}

export default executeSafeTransaction;
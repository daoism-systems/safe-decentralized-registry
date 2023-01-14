import { ethers } from "ethers";
import { TransactionData } from "./db";

const signMessage = async (safeAddress: string, payload: TransactionData) => {
    try {
      if (!window.ethereum) {
        throw new Error("No crypto wallet found. Please install it.");
      }

      const ethereum: any = window.ethereum

      const chainId = parseInt(ethereum.chainId)

      const domain = {
        chainId,
        verifyingContract: safeAddress
      }

      const types = {
        SafeTx: [
          { type: 'address', name: 'to' },
          { type: 'uint256', name: 'value' },
          { type: 'bytes', name: 'data' },
          { type: 'uint8', name: 'operation' },
          { type: 'uint256', name: 'safeTxGas' },
          { type: 'uint256', name: 'baseGas' },
          { type: 'uint256', name: 'gasPrice' },
          { type: 'address', name: 'gasToken' },
          { type: 'address', name: 'refundReceiver' },
          { type: 'uint256', name: 'nonce' }
        ]
      };

      const msgToSign = {
        chainId,
        verifyingContract: safeAddress,
        to: payload.to,
        value: payload.value,
        data: payload.data,
        operation: 0,
        safeTxGas: 0,
        baseGas: 0,
        gasPrice: 0,
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: payload.nonce,
      };

      await ethereum.send("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const signature = await signer._signTypedData(domain, types, msgToSign);
      const address = await signer.getAddress();

      return {
        signature,
        address
      };
      
    } catch (err) {
      console.error('Error signing data:', err)
    }
  };

export default signMessage;
import detectEthereumProvider from '@metamask/detect-provider'
import { DIDSession, } from 'did-session'
import { useState } from 'react'
import Button from '@mui/material/Button';
import { Grid, Stack } from '@mui/material'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { ComposeClient } from '@composedb/client'
import { ethers } from "ethers";

import { definition } from '../__generated__/definition.js'
const ceramicUrl = process.env.REACT_APP_COMPOSEDB_NODE || 'https://composedb.tk'
console.log(ceramicUrl, 'url', process.env)
const compose = new ComposeClient({ ceramic: ceramicUrl, definition })

function SafeDemo() {
  const [results, setResults] = useState([])
  const [session, setSession] = useState()
  const resources = compose.resources

  async function readData() {
    const result = await compose.executeQuery(`
    query {
      safeIndex(last: 20) {
        edges {
          node {
            id
            safe
            owners
            transactions(last: 20) {
              edges {
                node {
                  id
                  to
                  value
                  data
                  safe {
                    safe
                  }
                  confirmations(last: 20) {
                    edges {
                      node {
                        id
                        owner
                        signatureType
                        signature
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`)

    setResults(result.data.safeIndex.edges)
    console.log(results)
  }

  async function insertSafeAndTransaction() {
    if (session?.did) {
      compose.setDID(session?.did)
    }

    const fakeSafe = ethers.Wallet.createRandom();
    const fakeOwner1 = ethers.Wallet.createRandom();
    const fakeOwner2 = ethers.Wallet.createRandom();
    const fakeTo = ethers.Wallet.createRandom();

    const createSafeResponse = await compose.executeQuery(`
      mutation ($input: CreateSafeInput!) {
        createSafe(input: $input) {
          document {
            owners
            id
            safe
          }
        }
      }
    `, {
      "input": {
        "content": {
          "safe": fakeSafe.address,
          "owners": [
            fakeOwner1.address,
            fakeOwner2.address,
          ]
        }
      }
    })

    console.log('Create safe response:', createSafeResponse)

    const createTransactionResponse = await compose.executeQuery(`mutation ($input: CreateTransactionInput!) {
      createTransaction(input: $input) {
        document {
          id
          to
          nonce
          value
          baseGas
          trusted
          gasToken
          operation
          safeTxGas
          safeTxHash
          isSuccessful
          refundReceiver
        }
      }
    }`, {
      "input": {
        "content": {
          "safeId": createSafeResponse.data.createSafe.document.id,
          "to": fakeTo.address,
          "nonce": 1,
          "value": `${Math.floor(Math.random() * (100 - 2 + 1) + 2)}`, // 1 ETH
          "baseGas": 0,
          "trusted": true,
          "gasToken": "0x0000000000000000000000000000000000000000",
          "operation": 1,
          "safeTxGas": 0,
          "safeTxHash": "0x5e43438231dacfd3b93b873f2c7c6dd65a1ee3c70dfef79c9b79b2bb3537c809",
          "isSuccessful": false,
          "refundReceiver": "0x0000000000000000000000000000000000000000",
          "data": "0x",
          "isExecuted": false,
          "gasPrice": "0"
        }
      }
    })

    console.log('Create transaction response:', createTransactionResponse)
    await readData()
  }

  const signInWithEthereum = async () => {
    const ethProvider = await detectEthereumProvider();
    const addresses = await (ethProvider).request({ method: 'eth_requestAccounts' })
    const accountId = await getAccountId(ethProvider, addresses[0])
    const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)
    const session = await DIDSession.authorize(authMethod, { resources })
    setSession(session)
    await readData()
  }

  const signMessage = async (transaction) => {
    try {
      if (!window.ethereum)
        throw new Error("No crypto wallet found. Please install it.");


      const domain = {
        chainId: 5,
        verifyingContract: transaction.safe.safe
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
        chainId: 5,
        verifyingContract: transaction.safe.safe,
        to: transaction.to,
        value: transaction.value,
        data: transaction.data,
        operation: 0,
        safeTxGas: 0,
        baseGas: 0,
        gasPrice: 0,
        gasToken: '0x0000000000000000000000000000000000000000',
        refundReceiver: '0x0000000000000000000000000000000000000000',
        nonce: 2, // this is hardcoded
      };

      await window.ethereum.send("eth_requestAccounts");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
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

  const handleSign = async (t) => {
    const sig = await signMessage(t);
    await saveConfirmation(sig.signature, sig.address, t.id)
    await readData()
  };

  const signTransaction = async (t) => {
    handleSign(t)
  }

  const render = () => {
    return (
      <div>
        <div>
          {session === undefined || !session.isAuthorized() ? renderUnauthenticated() : renderAuthenticated()}
        </div>
      </div>
    )
  }

  const renderResults = () => {
    return (
      <Grid className='results' container>
          {results.map((result, index) => (
            <Grid item xs={6} className='safe' key={result.node.id}>
              <h2>Safe #{index}</h2>
              <p><strong>Safe address:</strong> {result.node.safe}</p>
              <div><strong>Safe owners:</strong> {result.node.owners.join(', ')}</div>
              {renderTransactions(result.node.transactions.edges)}
            </Grid>
          ))}
      </Grid>
    );
  }

  const renderTransactions = (t) => {
    return (
      <div>
        {t.map((transaction) => (
          <div key={transaction.node.id} onClick={() => signTransaction(transaction.node)}>
            <h3>Transactions:</h3>
            <div className='transaction'>
              <p><strong>To: </strong>{transaction.node.to}</p>
              <p><strong>Value:</strong> {transaction.node.value}</p>
              <p><strong>Data:</strong> {transaction.node.data}</p>
              {renderConfirmations(transaction.node.confirmations.edges)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderConfirmations = (confirmations) => {
    return (
      <div>
        {confirmations.map((confirmation) => (
          <div key={confirmation.node.id}>
            <p><strong>Signer: {confirmation.node.owner.slice(0,5)}..{confirmation.node.owner.slice(-4)}</strong> <strong>Signature:</strong> {confirmation.node.signature.slice(0,20)}...</p>
          </div>
        ))}
      </div>
    );
  }

  const saveConfirmation = async (signature, owner, transactionId) => {
    if (session?.did) {
      compose.setDID(session?.did)
    }

    const result = await compose.executeQuery(`mutation ($input: CreateConfirmationInput!) {
      createConfirmation(input: $input) {
        document {
          id
          signatureType
          signature
          owner
          transactionId
        }
      }
    }`, {
      "input": {
        "content": {
          "transactionId": transactionId,
          "owner": owner,
          "signature": signature,
          "signatureType": "EOA"
        }
      }
    })

    console.log('Saved confirmation to DB', result)
  }

  const renderUnauthenticated = () => {
    return (
      <Stack spacing={2}>
        <Button
          variant="contained"
          size="large"
          onClick={signInWithEthereum}
        >
          Sign In With Ethereum
        </Button>
      </Stack>
    )
  }

  const renderAuthenticated = () => {
    return (
      <Stack spacing={2}>
        {results == undefined || results.length == 0 ? null : renderResults()}
        <Stack direction='row' justifyContent="center" spacing={2}>
          <Stack>
            <Button
              variant="contained"
              size="large"
              onClick={() => insertSafeAndTransaction()}
            >
              Create new safe and transaction (mock)
            </Button>
          </Stack>
        </Stack>
        {/* <Stack direction='row' justifyContent="center">
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              setSession(undefined)
            }}
          >
            Sign out
          </Button>
        </Stack> */}
      </Stack>
    )
  }

  return render()
}

export default SafeDemo
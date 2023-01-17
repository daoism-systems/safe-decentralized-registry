import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { definition } from '../__generated__/definition.js'
import { DIDSession, } from 'did-session'

// const ceramicUrl = process.env.REACT_APP_COMPOSEDB_NODE || 'https://composedb.tk'
const ceramicUrl = 'https://composedb.tk'
console.log(ceramicUrl, 'Ceramic URL')
const compose = new ComposeClient({ ceramic: ceramicUrl, definition: <RuntimeCompositeDefinition>definition })
export const sessionKey = 'ceramic-session';

export interface TransactionData {
  to: string;
  nonce: number;
  value: string;
  data: string;
}

async function attachDid() {
  const sessionString = localStorage.getItem(sessionKey)
  const session = await DIDSession.fromSession(sessionString as string)
  compose.setDID(session?.did)
}

export default {
  compose,

  insertSafe: async function (safe: string, owners: string[]) {
    await attachDid();

    const result = await compose.executeQuery(`
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
          "safe": safe,
          "owners": owners,
        }
      }
    })
    console.info('insertSafe:', result)

    return result;
  },

  insertTransaction: async function (safeId: string, data: TransactionData) {
    await attachDid();

    const input = {
      "input": {
        "content": {
          "safeId": safeId,
          "to": data.to,
          "nonce": data.nonce,
          "value": data.value,
          "baseGas": 0,
          "trusted": true,
          "gasToken": "0x0000000000000000000000000000000000000000",
          "operation": 0,
          "safeTxGas": 0,
          "safeTxHash": "0x5e43438231dacfd3b93b873f2c7c6dd65a1ee3c70dfef79c9b79b2bb3537c801",
          "isSuccessful": false,
          "refundReceiver": "0x0000000000000000000000000000000000000000",
          "data": data.data,
          "isExecuted": false,
          "gasPrice": "0"
        }
      }
    }

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
    }`, input)

    console.info('insertTransaction:', createTransactionResponse)

    return createTransactionResponse
  },

  markTransactionAsExecuted: async function (transactionId: string) {
    await attachDid();

    const result = await compose.executeQuery(`mutation ($input: UpdateTransactionInput!) {
      updateTransaction(input: $input) {
        document {
          id
        }
      }
    }
    `, {
      "input": {
        "id": transactionId,
        "content": {
          "isExecuted": true
        }
      }
    })

    console.info('markTransactionAsExecuted:', result)

    return result;
  },

  saveConfirmation: async function (transactionId: string, owner: string, signature: string) {
    await attachDid();

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

    console.info('saveConfirmation:', result)

    return result;
  },

  readData: async function () {
    const result = await compose.executeQuery(`
      query {
        safeIndex(last: 20) {
          edges {
            node {
              id
              safe
              owners
              transactions(last: 5) {
                edges {
                  node {
                    id
                    to
                    value
                    data
                    safe {
                      safe
                    }
                    nonce
                    operation
                    safeTxGas
                    baseGas
                    gasPrice
                    gasToken
                    refundReceiver
                    isExecuted
                    confirmations(last: 5) {
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
      }`
    )

    console.info('readData:', result)

    return result;
  },

  getSafe: async function (safeId: string) {
    // Shitty way of doing this, because ComposeDB doesn't support getById yet
    const { data } = await this.readData()
    const safeIndex: any = data?.safeIndex
    const edges = safeIndex.edges
    const safeData = (edges as any[] || []).find((x) => x.node.id == safeId)
    return safeData;
  },
}
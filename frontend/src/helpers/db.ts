import { ComposeClient } from '@composedb/client'
import { RuntimeCompositeDefinition } from '@composedb/types'
import { definition } from '../__generated__/definition.js'
const ceramicUrl = process.env.REACT_APP_COMPOSEDB_NODE || 'https://composedb.tk'
const compose = new ComposeClient({ ceramic: ceramicUrl, definition: <RuntimeCompositeDefinition>definition })

export default {
  insertSafe: async function (safe: string, owners: string[]) {
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
    console.log('insertSafe --', result)

    return result;
  },

  saveConfirmation: async function (transactionId: string, owner: string, signature: string) {
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

    console.log('saveConfirmation --', result)

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
      }`
    )

    console.log('readData -- ', result)

    return result;
  }
}
# Safe Decentralized Registry [POC] 

Demo is deployed at https://charming-pony-72144d.netlify.app

This proof-of-concept website is built with React and ComposedDB Node. It is designed to demonstrate the process of storing Safe signatures on ComposeDB, which indexes Safe models (composites).

# How to test it?

To test the functionality of the POC dApp:

1. Select the `Görli testnet` in your Metamask wallet

2. Connect your wallet

3. Press `sign in with ethereum`

4. Signa message that will allow the dApp to write to ComposeDB models on your behalf

5. Insert your safe into ComposeDB. Izf there are no safes in the dropdown, that means you do not have any Safes deployed on the Görli testnet.

<div>
  <img src="https://i.imgur.com/YxQccor.png" width=70%>
</div>
<sub>When you insert safe, you should see something like this. This safe is 2/2, meaning both owners need to sign the transaction.</sub>

<br>


6. Click on that Safe to proceed to transaction builder

7.In the transaction builder, you will see an ERC20 token address that is pre-populated and it's ABI is exposed.

<div>
  <img src="https://i.imgur.com/KStR6YN.png" width=70%>
</div>
<sub>In this example, We are minting 1 dummy token to `0x5F9a7EA6A79Ef04F103bfe7BD45dA65476a5155C`</sub>

<br>


8. After creating the transaction, you will need to sign it. In this example, the signatures of 2 out of 2 owners are required.


9. Switch to the Safe owner's wallet, click on the transaction, and sign it (repeat this step for multiple owners if necessary).


<div>
  <img src="https://i.imgur.com/cNljDEl.png" width=70%>
</div>
<sub>2/2 Owners Signed the transaction, now it can be executed</sub>

<br>

10. Execute the transaction from any wallet

## Run your frontend locally

Running frontend locally will connect it to a remote ComposeDB node(hosted at https://composedb.tk). 

To do so:

- `cd frontend`

- `npm install` all the packages

- `npm run start`

<br>

<strong>POC is missing a lot of validations.</strong>


## Running a ComposeDB node + frontend dapp

- Install Ceramic and ComposeDB and start a ComposeDB node
Follow https://composedb.js.org/docs/0.3.x/installation steps to do that, make sure to obtain DID private key

- Start ceramic daemon by running
`ceramic daemon`

- All models and composites are already generated and present in this repository so there is no need to redo that process. We only need to deploy merged `models.json` to our local node. (don't forget to replace DID private key with your own)

```
composedb composite:deploy ../composites/merged.json  --ceramic-url=http://localhost:7007 --did-private-key=$DID_PRIVATE_KEY 
```

- Now our local Ceramic node is tracking and indexing data for those models, and whenever data is inserted / updated our local node will sync with remote nodes and update the data locally.

- Last step is to go to `frontend` folder, install packages and run `export REACT_APP_COMPOSEDB_NODE=http://localhost:7007 && npm run start`

## How it actually works

We have 3 ComposeDB models:
- Safe - This model is required to store SAFE information and data. It is created during the creation of the Safe itself, and contains owner information, safe address information, active transactions, etc.
- Transaction - This model is a full description of the transaction. Basically a representation of the safes proposal.
- Confirmation - An approval(EIP-712 signature) of a specific transaction, waiting for the execution in the Safe.

```mermaid
graph TD;
    A[Safe] -->|1->n| B[Transaction]
    B -->|1->n| C[Confirmation]
```

Models are defined in `database/models`. In that folder you will see additional files that represent relationships and that allow us to search from top to bottom, and from bottom to top.

This means that we can query Safe -> get safe transactions -> get confirmations for those transactions, or go the other way around.
Confirmation -> get transaction of that confirmation -> get safe for that transaction.

## Connecting to node with grahpql server

You can connect to local node with graphql by running command from root folder.
```
composedb graphql:server --ceramic-url=http://localhost:7007 --graphiql ./database/composites/runtime-composite.json --did-private-key=$DID_PRIVATE_KEY
```
If you omit --did-private-key you can only view data, and if you provide it you can write and update data that you own.
replace `http://localhost:7007` with `https://composedb.tk` to connect to remote node

Example query that you can run to get last 20 safes with their transactions and confirmations.
```
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
    }
```

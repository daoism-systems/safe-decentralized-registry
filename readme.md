# Safe POC 
## Deployed Demo https://charming-pony-72144d.netlify.app

## Frontend only

In this case frontend is connecting to remote ComposeDB node, and is interacting with it.
Click on any transaction (orange box) and it will prompt you to sign it as you would do it in a Safe Dapp if you were the safe owner. It then stores that signature in ComposeDB.

1. Go to `frontend`, install packages and start the dapp `npm run start`. 

## Running a ComposeDB node + frontend

1. Generate DID, and add it do .bashrc/.zshrc: `export DID_PRIVATE_KEY=privatekey`
2. Start CeramicDB node: `ceramic daemon`
3. Generate Safe composite (go database/models folder)

```
composedb composite:create Safe.graphql --output=../composites/safe.json --ceramic-url=http://localhost:7007 --did-private-key=$DID_PRIVATE_KEY
composedb composite:models ../composites/safe.json
```
4. Copy Safe model id 
5. Edit Transaction.graphql and replace @loadModel value with copied model id in Transaction.graphql and SafeAndTransactionRelationship.graphql
6. Generate Transaction composite
```
composedb composite:create Transaction.graphql --output=../composites/transaction.json --ceramic-url=http://localhost:7007 --did-private-key=$DID_PRIVATE_KEY
composedb composite:models ../composites/transaction.json
```
7. Copy Transaction model id. Edit Confirmation.graphql and replace @loadModel value in TransactionAndConfirmationRelationship.graphql and SafeAndTransactionRelationship.graphql
8. Generate Confirmation composite
```
composedb composite:create Confirmation.graphql --output=../composites/confirmation.json --ceramic-url=http://localhost:7007 --did-private-key=$DID_PRIVATE_KEY
composedb composite:models ../composites/confirmation.json
```
9. Copy Confirmation model id. Edit TransactionAndConfirmationRelationship.graphql and replace @loadModel value
```
composedb composite:create TransactionAndConfirmationRelationship.graphql --output=../composites/tx-confirmation.json --ceramic-url=http://localhost:7007 --did-private-key=$DID_PRIVATE_KEY
```
10. Do the same for SafeAndTransactionRelationship.graphql
```
composedb composite:create SafeAndTransactionRelationship.graphql --output=../composites/safe-tx.json --ceramic-url=http://localhost:7007 --did-private-key=$DID_PRIVATE_KEY
```
11. Merge composites
```
composedb composite:merge ../composites/safe.json ../composites/transaction.json ../composites/confirmation.json ../composites/safe-tx.json ../composites/tx-confirmation.json --output=../composites/merged.json
```

10. Generate runtime composite and definition for frontend
```
composedb composite:compile ../composites/merged.json ../composites/runtime-composite.json
composedb composite:compile ../composites/merged.json ../../frontend/src/__generated__/definition.js
```

11. Go to `frontend` folder run `export REACT_APP_COMPOSEDB_NODE=http://localhost:7007 && npm run start`


Helper files and notes are located in folder `interactions`

Note: ComposeDB commands only work from `database/models` folder
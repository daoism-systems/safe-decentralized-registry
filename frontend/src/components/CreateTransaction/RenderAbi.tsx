import { FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid } from '@mui/material'
import { useState } from 'react'
import { useLoaderData } from "react-router-dom";
import db, { TransactionData } from '../../helpers/db';
import { fetchSafeNonce } from '../../helpers/fetchSafeNonce';

interface FormValues {
    // can be anything
    ethValue: string
    hexCallData?: string
}

const RenderAbi = ({ contract, contractAddress }: { contract: any, contractAddress: string }) => {
    const [selectedFunction, selectFunction] = useState('');
    const loaderData: any = useLoaderData();
    const [formValues, setFormValues] = useState<FormValues>({ ethValue: '0', hexCallData: '0x' });
    const safeAddress = loaderData.safe.node.safe;

    async function handleSubmitWithoutABI() {
        const payload = {
            to: contractAddress,
            nonce: await fetchSafeNonce(safeAddress),
            value: formValues.ethValue,
            data: formValues.hexCallData || '0x',
        } satisfies TransactionData

        const response = await db.insertTransaction(loaderData.composeDBId, payload)

        if (response.errors) {
            alert('Failed to insert to DB')
            return console.error('Error inserting', response.errors)
        } else {
            console.info('Insert tx success:', response)
            window.location.reload()
        }
    }

    async function handleSubmitWithABI() {
        // match function from the ABI
        const fncParams = contract.abi.filter((x: any) => {
            if (x.name == selectedFunction && x.type == 'function') {
                return x;
            }
        }).pop();

        // sort params in order that the function requires it
        const paramsSorted = fncParams.inputs.map((x: any) => (formValues as any)[x.name])

        const payload = {
            to: contractAddress,
            nonce: await fetchSafeNonce(safeAddress),
            value: formValues.ethValue,
            data: contract.encoder.encode(selectedFunction, [...paramsSorted]),
        } satisfies TransactionData

        const response = await db.insertTransaction(loaderData.composeDBId, payload)

        if (response.errors) {
            alert('Failed to insert to DB')
            return console.error('Error inserting', response.errors)
        } else {
            console.info('Insert tx success:', response)
            window.location.reload()
        }
    }

    function handleTextFieldChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = event.target;

        setFormValues({
            ...formValues,
            [name]: value
        })
    }

    const renderInputs = () => {
        const fnc = (contract.abi as any[] || []).find((x) => x.name == selectedFunction)

        if (!fnc) return null;

        return (
            <FormControl fullWidth>
                {
                    fnc.inputs.map((x: any) => <TextField id='text-fields' focused variant='outlined' key={x.name} name={x.name} onChange={handleTextFieldChange} fullWidth margin="normal" label={x.name} />)
                }
                <TextField id='text-fields' focused key='ethValue' name='ethValue' value={formValues.ethValue} onChange={handleTextFieldChange} fullWidth margin="normal" label='ETH Value' variant="outlined" />
                <Button onClick={handleSubmitWithABI} size="large" variant="outlined">Create transaction</Button>
            </FormControl>
        )
    }

    if (!contract) {
        return (
            <div>
                <TextField id='text-fields' focused key='ethValue' name='ethValue' value={formValues.ethValue} onChange={handleTextFieldChange} fullWidth margin="normal" label='ETH Value' variant="outlined" />
                <TextField id='text-fields' focused key='data' name='hexCallData' value={formValues.hexCallData} onChange={handleTextFieldChange} fullWidth margin="normal" label='Hex calldata' variant="outlined" />
                <Button onClick={handleSubmitWithoutABI} size="large" variant="outlined">Create transaction</Button>
            </div>
        )
    }

    return (
        <Grid container>
            <FormControl variant='outlined' focused color='primary' fullWidth>
                <InputLabel id="functionSelect">Select Function</InputLabel>
                <Select
                    id='select-input'
                    value={selectedFunction}
                    label="Select Function"
                    onChange={(e) => selectFunction(e.target.value)}
                >
                    {
                        (contract?.abi as any[]).map((element) => {
                            if (element.type != 'function') {
                                return;
                            }

                            // Ignore view and pure functions
                            if (['view', 'pure'].includes(element.stateMutability)) {
                                return;
                            }

                            return (
                                <MenuItem key={element.name} value={element.name}>{element.name}</MenuItem>
                            )
                        })
                    }
                </Select>
            </FormControl>
            {
                renderInputs()
            }
        </Grid>
    )
}

export default RenderAbi
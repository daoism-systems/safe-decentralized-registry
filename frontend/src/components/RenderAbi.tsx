import { FormControl, InputLabel, Select, MenuItem, TextField, Button, Grid } from '@mui/material'
import { useState } from 'react'
import { ethers } from 'ethers';
import { useLoaderData } from "react-router-dom";
import db, { TransactionData } from '../helpers/db';

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

    const fetchSafeNonce = async () => {
        if (!window.ethereum) {
            return
        }
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const safeContract = new ethers.Contract(safeAddress, ['function nonce() external view returns(uint256)'], provider)
        return (await safeContract.nonce()).toNumber()
    }

    async function handleSubmitNoContract() {
        const obj: any = formValues;

        const payload: TransactionData = {
            to: contractAddress,
            nonce: await fetchSafeNonce(),
            value: obj.ethValue,
            data: obj.data || '0x',
        }

        const response = await db.insertTransaction(loaderData.composeDBId, payload)

        if (response.errors) {
            alert('Failed to insert to DB')
            return console.error('Error inserting', response.errors)
        } else {
            console.info('Insert tx success:', response)
            window.location.reload()
        }
    }

    async function handleSubmit() {
        if (!window.ethereum) {
            return
        }

        // match function fron ABI
        const fncParams = contract.abi.filter((x: any) => {
            if (x.name == selectedFunction && x.type == 'function') {
                return x;
            }
        }).pop();

        const obj: any = formValues;
        // sort params in order that the function requires it
        const paramsSorted = fncParams.inputs.map((x: any) => obj[x.name])

        const payload: TransactionData = {
            to: contractAddress,
            nonce: await fetchSafeNonce(),
            value: obj.ethValue,
            data: contract.encoder.encode(selectedFunction, [...paramsSorted]),
        }

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

    const renderCreateTransaction = () => {
        const fnc = (contract.abi as any[] || []).find((x) => x.name == selectedFunction)

        if (!fnc) return null;

        return (
            <FormControl fullWidth>
                {
                    fnc.inputs.map((x: any) => <TextField id='text-fields' focused variant='outlined' key={x.name} name={x.name} onChange={handleTextFieldChange} fullWidth margin="normal" label={x.name} />)
                }
                <TextField id='text-fields' focused key='ethValue' name='ethValue' value={formValues.ethValue} onChange={handleTextFieldChange} fullWidth margin="normal" label='ETH Value' variant="outlined" />
                <Button onClick={handleSubmit} size="large" variant="outlined">Create transaction</Button>
            </FormControl>
        )
    }

    if (!contract) {
        return (
            <div>
                <TextField id='text-fields' focused key='ethValue' name='ethValue' value={formValues.ethValue} onChange={handleTextFieldChange} fullWidth margin="normal" label='ETH Value' variant="outlined" />
                <TextField id='text-fields' focused key='data' name='hexCallData' value={formValues.hexCallData} onChange={handleTextFieldChange} fullWidth margin="normal" label='Hex calldata' variant="outlined" />
                <Button onClick={handleSubmitNoContract} size="large" variant="outlined">Create transaction</Button>
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
                renderCreateTransaction()
            }
        </Grid>
    )
}

export default RenderAbi
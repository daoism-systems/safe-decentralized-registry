import { useState } from 'react'
import { useContract } from "@thirdweb-dev/react";
import { TextField, Grid, CircularProgress } from '@mui/material'
import RenderAbi from './RenderAbi';

const CreateTransaction = () => {
    const [contractAddress, setContractAddress] = useState('0x4a916e57fef455d6103FA67F0d67F61234e09f04')
    const { contract, isFetched } = useContract(contractAddress);

    function handleInputChange(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
        setContractAddress(event.target.value)
    }

    if (!contractAddress) {
        return (
            <Grid container>
                <Grid item xs={12}>
                    <TextField variant='filled' fullWidth onChange={handleInputChange} value={contractAddress} label="To Address" />
                </Grid >
            </Grid>

        )
    }

    if (!isFetched && contractAddress != '') {
        return (
            <CircularProgress />
        )
    }

    return (
        <Grid container spacing={1}>
            <Grid item xs={12}>
                <p>Create new transaction:</p>
            </Grid>
            <Grid item xs={12}>
                <TextField id='input-frm' focused color='primary' fullWidth margin="normal" onChange={handleInputChange} value={contractAddress} label="To address" variant="outlined" />
            </Grid>
            <Grid item xs={12}>
                <RenderAbi contractAddress={contractAddress} contract={contract} />
            </Grid>
        </Grid>
    )
}

export default CreateTransaction;
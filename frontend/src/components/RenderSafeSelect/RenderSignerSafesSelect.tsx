import { FormControl, InputLabel, Select, MenuItem, Button, CircularProgress } from '@mui/material'
import { useState } from 'react';
import useSafes from './hooks/useSafes';
import db from '../../helpers/db';
import useSafe from './hooks/useSafe';
import { useNavigate } from "react-router-dom";

export default function RenderSignerSafesSelect() {
    const navigate = useNavigate();

    const { isLoading, error, data } = useSafes();
    const [safeAddress, setSafeAddress] = useState('')
    const safe = useSafe(safeAddress)

    async function insertRealSafe() {
        const insertSafeResponse = await db.insertSafe(safeAddress, safe.data.owners)
        console.info('Create safe response', insertSafeResponse)
        const createdSafe: any = insertSafeResponse.data?.createSafe;
        navigate(`/safe/${createdSafe.document.id}`);
    }

    if (isLoading) {
        return (
            <div>
                <CircularProgress />
            </div>
        )
    }

    if (error) {
        return (
            <div>
                <h5>Fetching safes failed: {error.toString()}</h5>
            </div>
        )
    }

    return (
        <div>
            <FormControl fullWidth>
                <InputLabel>Select Safe to Add</InputLabel>
                <Select
                    sx={{color: 'white'}}
                    variant='outlined'
                    value={safeAddress}
                    label="Select Safe"
                    onChange={(e) => setSafeAddress(e.target.value)}
                >
                    {data.safes.map((result: string) => <MenuItem key={result} value={result}>{result}</MenuItem>)}
                </Select>
                <Button
                    style={{ marginTop: '5px' }}
                    variant="outlined"
                    size="large"
                    onClick={insertRealSafe}
                >
                    Insert Safe to ComposeDB
                </Button>
            </FormControl>
        </div>
    )
}
import { useQuery } from 'react-query'
import { Link } from "react-router-dom";
import { Grid, CircularProgress, Alert } from '@mui/material'
import db from '../helpers/db'

const RenderSafes = ({signerAddress}: {signerAddress: string|undefined}) => {
    const { isLoading, error, data } = useQuery(['safes-composedb'], async () => {
        const response: any = await db.readData();
        // Filter results so that the owner can see them
        const filteredResults = response.data.safeIndex.edges.filter((x : any) => {
          return x.node.owners.includes(signerAddress)
        })

        return filteredResults
    }, {staleTime: 5000 })

    if (isLoading) {
        return (
          <div style={{display:'flex', justifyContent:'center'}}>
            <CircularProgress />
          </div>
        )
    }

    if (error) {
        return (
          <Alert severity="error">Error fetching from ComposeDB {error.toString()}</Alert>
        )
    }

    const results: any = data

    if (!results.length) {
      return (
        <h1 style={{textAlign: 'center', color: 'white'}}>Please Insert your Safe</h1>
      )
    }

    return (
        <Grid className='safe-list' container>
        {results.map((result: any) => (
          <Grid item xs={6} className='safe' key={result.node.id}>
            <Link className='safe-link' to={'safe/' + result.node.id}>
              <h3>Safe: {result.node.safe}</h3>
              <p>Owners</p>
              <div>{result.node.owners.map((owner: string) => <p key={owner}>{owner}</p>)}</div>
            </Link>
          </Grid>
        ))}
      </Grid>
    )
}

export default RenderSafes;
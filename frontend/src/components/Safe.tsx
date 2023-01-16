import CreateTransaction from "./CreateTransaction";
import RenderTransactions from "./Transactions";
import { Grid } from '@mui/material'

function Safe() {
  return (
    <Grid container className="main-container">
      <Grid item xs={8}>
        <RenderTransactions />
      </Grid>
      <Grid item xs={5}>
        <CreateTransaction />
      </Grid>
    </Grid>
  );
}

export default Safe;
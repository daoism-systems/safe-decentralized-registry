import detectEthereumProvider from '@metamask/detect-provider'
import { DIDSession, } from 'did-session'
import Button from '@mui/material/Button';
import { Stack } from '@mui/material'
import { EthereumWebAuth, getAccountId } from '@didtools/pkh-ethereum'
import { useAddress } from "@thirdweb-dev/react";
import db, { sessionKey } from '../../helpers/db';
import RenderSignerSafesSelect from '../RenderSafeSelect/RenderSignerSafesSelect';
import RenderSafes from '../RenderSafes/RenderSafes';
import useSession from './hooks/useSession';

function Landing() {
  const { session, setSession } = useSession();
  const signerAddress = useAddress();

  // Sign in to ComposeDB
  const signInWithEthereum = async () => {
    const ethProvider: any = await detectEthereumProvider();
    const addresses = await (ethProvider).request({ method: 'eth_requestAccounts' })
    const accountId = await getAccountId(ethProvider, addresses[0])
    const authMethod = await EthereumWebAuth.getAuthMethod(ethProvider, accountId)
    const session = await DIDSession.authorize(authMethod, { resources: db.compose.resources })
    const serializedSession = session.serialize()
    localStorage.setItem(sessionKey, serializedSession)
    setSession(session)
  }

  const renderAuthenticated = () => {
    return (
      <Stack spacing={3}>
        <RenderSafes signerAddress={signerAddress} />
        <Stack direction='row' justifyContent="center">
          <RenderSignerSafesSelect />
        </Stack>
        <Stack direction='row' justifyContent="center">
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              setSession(undefined)
              localStorage.removeItem(sessionKey)
            }}
          >
            Sign out
          </Button>
        </Stack>
      </Stack>
    )
  }

  const renderUnauthenticated = () => {
    return (
      <div>
        { signerAddress ?
        <div className="sign-in-btn">
          <Button
            variant="contained"
            size="large"
            onClick={signInWithEthereum}
          >
            Sign in
          </Button>
        </div> : null 
      }
      </div>
    )
  }

  const isAuthenticated = session && session.isAuthorized() && signerAddress

  return (
      <>
        {isAuthenticated ? renderAuthenticated() : renderUnauthenticated()}
      </>
  )
}

export default Landing
import { useEffect, useState } from 'react'
import { DIDSession, } from 'did-session'
import { useAddress } from "@thirdweb-dev/react";
import { sessionKey } from '../helpers/db';

const useSession = () => {
    const signerAddress = useAddress();
    const [session, setSession] = useState<DIDSession>()

    useEffect(() => {
        (async () => {
          const sessionString = localStorage.getItem(sessionKey)
          if (!sessionString || !signerAddress) {
            return;
          }
          const didSession = await DIDSession.fromSession(sessionString)

          const sessionChanged = didSession.id.split(':').pop()?.toLowerCase() != signerAddress.toLowerCase()
    
          if (didSession.isExpired || sessionChanged) {
            console.info('Session expired or changed')
            localStorage.removeItem(sessionKey)
            window.location.reload()
            return;
          }
    
          setSession(didSession)
          
        })();
      }, [signerAddress]);

    return { session, setSession }
}

export default useSession;
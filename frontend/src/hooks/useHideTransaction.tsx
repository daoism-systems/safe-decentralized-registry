import { useQuery } from 'react-query'
import { fetchSafeNonce } from "../helpers/fetchSafeNonce";

const useHideTransaction = (safeAddress: string) => {    
    const { error, data } = useQuery(['safe-nonce'], async () => {
        const safeNonce = await fetchSafeNonce(safeAddress)
        return safeNonce
    }, {staleTime: 10000, enabled: !!safeAddress })

    return { error, data }
}

export default useHideTransaction;
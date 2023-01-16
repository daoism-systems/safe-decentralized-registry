import { useQuery } from 'react-query'
import axios from 'axios';

const useSafe = (safe: string) => {    
    const { isLoading, error, data } = useQuery(['safe-owners'], async () => {
        const { data } = await axios.get(`https://safe-transaction-goerli.safe.global/api/v1/safes/${safe}`);
        return data
    }, {staleTime: 10000, enabled: !!safe })

    return { isLoading, error, data }
}

export default useSafe;
import { useAddress } from "@thirdweb-dev/react";
import { useQuery } from 'react-query'
import axios from 'axios';

const useSafes = () => {
    const signerAddress = useAddress();

    const { isLoading, error, data } = useQuery(['safes-api'], async () => {
        const { data } = await axios.get(`https://safe-transaction-goerli.safe.global/api/v1/owners/${signerAddress}/safes/`);
        return data
    }, {staleTime: 10000, enabled: !!signerAddress })

    return { isLoading, error, data }
}

export default useSafes;
import { ethers } from 'ethers';

export const fetchSafeNonce = async (safeAddress: string) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum as any);
    const safeContract = new ethers.Contract(safeAddress, ['function nonce() external view returns(uint256)'], provider)
    return (await safeContract.nonce()).toNumber()
}
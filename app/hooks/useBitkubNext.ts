import { useQuery } from "react-query";
import { getManagerData } from "~/api/merchant/manager";

export const useBitkubNext = (walletAddress: string) => {

    const { data: managerData, refetch } = useQuery(['manager', walletAddress], () => {
        if (!walletAddress) return undefined;
        return getManagerData(walletAddress)
    });

    return [managerData, refetch];
}
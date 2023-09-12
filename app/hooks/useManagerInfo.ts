import { useQuery } from "react-query";
import { getManagerData, getManagerDataById } from "~/api/merchant/manager";

export const useManagerInfo = (walletAddress: string) => {
  const {
    data: managerData,
    refetch,
    isFetching,
  } = useQuery(["manager", walletAddress], () => {
    if (!walletAddress) return undefined;
    return getManagerData(walletAddress);
  });

  return {
    managerData,
    refetch,
    isFetching,
  };
};

export const useManagerInfoById = (managerId: string) => {
  const { data: managerDetail, refetch } = useQuery(
    ["manager", managerId],
    () => {
      if (!managerId) return undefined;
      return getManagerDataById(managerId);
    }
  );

  return {
    managerDetail,
    refetch,
  };
};

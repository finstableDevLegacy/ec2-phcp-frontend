import axios from "axios";
import { CreateDealerUser } from "~/type/dealer/create-dealer-user.type";
import { api } from "../base-url";

export const createDealerUser = (createDealerUser: CreateDealerUser) => {
    return api().post("/auth-dealer/register-dealer", { ...createDealerUser });
};

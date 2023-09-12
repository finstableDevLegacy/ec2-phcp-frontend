import { toast } from "react-toastify";
import * as Sentry from "@sentry/remix";

export const toastMessage = (errorFunction: string, error: Error) => {
    if (errorFunction) {
        error.message = `${errorFunction} : ${error.message}`;
        if (process.env.NEXT_PUBLIC_OVERRIDED_NODE_ENV === "production") {
            Sentry.captureException(error);
        } else if (process.env.NEXT_PUBLIC_OVERRIDED_NODE_ENV === 'development') {
            console.error("error : ", error);
        }
        toast.error(errorFunction);
    }
};

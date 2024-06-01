import ResponseDto from "../apis/response/ResponseDto";

export const ResponseBody = (data) => {
    if (data instanceof ResponseDto || data === null) {
        return data;
    }
    return data;
};

// import { ResponseDto } from "apis/response";

// type ResponseBody<T> = T | ResponseDto | null;

// export type {
//   ResponseBody,
// }
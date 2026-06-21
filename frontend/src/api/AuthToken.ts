import AxiosInstanceCustom from "./AxiosInstance";


export const setAuthorizationHeaderToken = (token: string | null) => {
  if(token) {
    AxiosInstanceCustom.defaults.headers.common.Authorization = `Bearer ${token}`;

  } else {
    delete AxiosInstanceCustom.defaults.headers.common.Authorization;
  }
}
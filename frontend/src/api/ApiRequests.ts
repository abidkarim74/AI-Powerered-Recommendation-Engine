import AxiosInstanceCustom from "./AxiosInstance";


export const postRequest = async (endpoint: string, data: any) => {
  const response = await AxiosInstanceCustom.post(endpoint, JSON.stringify(data));
  return response;
}


export const getRequest = async (endpoint: string) => {
  const response = await AxiosInstanceCustom.get(endpoint);
  return response;
}


export const patchRequest = async (endpoint: string, data: any) => {
  const response = await AxiosInstanceCustom.patch(endpoint, data);
  return response;
}

export const deleteRequest = async (endpoint: string) => {
  const response = await AxiosInstanceCustom.delete(endpoint);
  return response;
}
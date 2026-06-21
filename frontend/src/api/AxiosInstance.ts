import axios from "axios";
import { type AxiosInstance } from "axios";


const AxiosInstanceCustom: AxiosInstance = axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});


export default AxiosInstanceCustom;
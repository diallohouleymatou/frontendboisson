import axios, {type AxiosInstance} from "axios";
const api_baseUrl = import.meta.env.VITE_API_URL;
const api :AxiosInstance=axios.create({
    baseURL:api_baseUrl,
    timeout:120000,
    headers:{'Content-Type':'application/json'}
})

   export {api,api_baseUrl}

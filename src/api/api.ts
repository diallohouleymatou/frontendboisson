import axios, {type AxiosInstance} from "axios";
const api_baseUrl = import.meta.env.VITE_API_URL + "examgestionboisson_war_exploded/api/";
const api :AxiosInstance=axios.create({
    baseURL:api_baseUrl,
    timeout:120000, // timeout augmenté à 2 minutes
    headers:{'Content-Type':'application/json'}
})

   export {api,api_baseUrl}
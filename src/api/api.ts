import axios, {type AxiosInstance} from "axios";
const api_baseUrl="http://localhost:8080/examgestionboisson_war_exploded/api/";
const api :AxiosInstance=axios.create({
    baseURL:api_baseUrl,
    timeout:30000,
    headers:{'Content-Type':'application/json'}
})

   export {api,api_baseUrl}
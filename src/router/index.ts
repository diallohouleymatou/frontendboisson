import BoissonPage from "../pages/BoissonPage.vue";
import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {path:'/',redirect:'/boisson'},
    {path:'/boisson',component:BoissonPage},
]
const router = createRouter({
    history:createWebHistory(),
    routes,
})
export default router;


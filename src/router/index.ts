import BoissonPage from "../pages/BoissonPage.vue";
import {createRouter, createWebHistory} from "vue-router";
import TableauBordPage from "../pages/TableauBordPage.vue";
import LotPage from "../pages/LotPage.vue";
import StockPage from "../pages/StockPage.vue";
import UtilisateurPage from "../pages/UtilisateurPage.vue";
import MouvementPage from "../pages/MouvementPage.vue";
import OperationPage from "../pages/OperationPage.vue";

const routes = [
    {path:'/',redirect:'/boisson'},
    {path:'/boisson',component:BoissonPage},
    {path:'/dashboard',component:TableauBordPage},
    {path:'/mouvement',component:MouvementPage},
    {path:'/operation',component:OperationPage},
    {path:'/lot',component:LotPage},
    {path:'/stock',component:StockPage},
    {path:'/utilisateur',component:UtilisateurPage},
]
const router = createRouter({
    history:createWebHistory(),
    routes,
})
export default router;

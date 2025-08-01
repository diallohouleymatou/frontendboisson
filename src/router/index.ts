import BoissonPage from "../pages/BoissonPage.vue";
import {createRouter, createWebHistory} from "vue-router";
import TableauBordPage from "../pages/TableauBordPage.vue";
import LotPage from "../pages/LotPage.vue";
import StockPage from "../pages/StockPage.vue";
import UtilisateurPage from "../pages/UtilisateurPage.vue";
import MouvementPage from "../pages/MouvementPage.vue";
import OperationPage from "../pages/OperationPage.vue";
import LoginPage from "../pages/LoginPage.vue";
import ChangePasswordView from "../pages/ChangePasswordView.vue";
import { UtilisateurService } from "../features/utilisateurs/services/utilisateurService";
import { Role } from "../features/utilisateurs/models/role";
import Analyse from "../pages/Analyse.vue";
import AccesRefuse from "../pages/AccesRefuse.vue";
import FournisseurPage from "../pages/FournisseurPage.vue";

const routes = [
    {
        path: '/',
        redirect: '/dashboard'
    },
    {
        path: '/login',
        name: 'login',
        component: LoginPage,
        meta: { requiresAuth: false }
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: TableauBordPage,
        meta: { requiresAuth: true }
    },
    {
        path: '/analyse',
        name: 'analyse',
        component: Analyse,
        meta: { requiresAuth: true, allowedRoles: [Role.GERANT] }
    },
    {
        path: '/boisson',
        name: 'boisson',
        component: BoissonPage,
        meta: {
            requiresAuth: true,
            allowedRoles: [Role.GERANT, Role.EMPLOYE]
        }
    },
    {
        path: '/mouvement',
        name: 'mouvement',
        component: MouvementPage,
        meta: {
            requiresAuth: true,
            allowedRoles: [Role.GERANT, Role.EMPLOYE]
        }
    },
    {
        path: '/operation',
        name: 'operation',
        component: OperationPage,
        meta: {
            requiresAuth: true,
            allowedRoles: [Role.GERANT, Role.EMPLOYE]
        }
    },
    {
        path: '/lot',
        name: 'lot',
        component: LotPage,
        meta: {
            requiresAuth: true,
            allowedRoles: [Role.GERANT, Role.EMPLOYE]
        }
    },
    {
        path: '/stock',
        name: 'stock',
        component: StockPage,
        meta: {
            requiresAuth: true,
            allowedRoles: [Role.GERANT, Role.EMPLOYE]
        }
    },
    {
        path: '/utilisateur',
        name: 'utilisateur',
        component: UtilisateurPage,
        meta: {
            requiresAuth: true,
            allowedRoles: [Role.GERANT]
        }
    },
    {
        path: '/change-password',
        name: 'change-password',
        component: ChangePasswordView,
        meta: { requiresAuth: true }
    },
    {
        path: '/acces-refuse',
        name: 'acces-refuse',
        component: AccesRefuse,
        meta: { requiresAuth: true }
    },
    {
        path: '/fournisseur',
        name: 'fournisseur',
        component: FournisseurPage,
        meta: {
            requiresAuth: true,
            allowedRoles: [Role.GERANT, Role.EMPLOYE]
        }
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, _from, next) => {
    UtilisateurService.initializeAuth()
    const isAuthenticated = UtilisateurService.isAuthenticated()
    const currentUser = UtilisateurService.getCurrentUser()

    if (isAuthenticated && currentUser?.isFirstLogin && to.name !== 'change-password') {
        return next({ name: 'change-password' })
    }
    if (isAuthenticated && !currentUser?.isFirstLogin && to.name === 'change-password') {
        return next({ name: 'dashboard' })
    }

    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            return next({ name: 'login' })
        }
        if (to.meta.allowedRoles && currentUser && typeof currentUser.role !== 'undefined') {
            if (!(to.meta.allowedRoles as string[]).includes(currentUser.role)) {
                return next({ name: 'acces-refuse' })
            }
        }
        return next()
    }

    if (isAuthenticated && to.name === 'login') {
        return next({ name: 'dashboard' })
    }

    next()
})

export default router;

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
        meta: { requiresAuth: true }
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
        path: '/:pathMatch(.*)*',
        redirect: '/dashboard'
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from, next) => {
    // Initialiser l'authentification
    UtilisateurService.initializeAuth()

    const isAuthenticated = UtilisateurService.isAuthenticated()
    const currentUser = UtilisateurService.getCurrentUser()

    // Si la route nécessite une authentification
    if (to.meta.requiresAuth) {
        if (!isAuthenticated) {
            // Rediriger vers login si non authentifié
            return next({ name: 'login' })
        }

        // Vérifier si c'est le premier login et rediriger vers changement de mot de passe
        if (currentUser?.isFirstLogin && to.name !== 'change-password') {
            return next({ name: 'change-password' })
        }

        // Vérifier les rôles si nécessaire
        if (to.meta.allowedRoles && currentUser) {
            if (!to.meta.allowedRoles.includes(currentUser.role)) {
                // Rediriger vers dashboard si le rôle n'est pas autorisé
                return next({ name: 'dashboard' })
            }
        }
        return next()
    }

    // Si l'utilisateur est authentifié et essaie d'accéder à la page de login
    if (isAuthenticated && to.name === 'login') {
        if (currentUser?.isFirstLogin) {
            return next({ name: 'change-password' })
        }
        return next({ name: 'dashboard' })
    }

    next()
})

export default router;

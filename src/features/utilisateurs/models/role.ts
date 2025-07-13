export const Role={
    GERANT :'GERANT',
        EMPLOYE : 'EMPLOYE',
        LIVREUR :'LIVREUR'
}as const ;
export type Role = typeof Role[keyof typeof Role];
export const TypeMouvement = {
    ENTREE : 'ENTREE',
    SORTIE : 'SORTIE',
    AJUSTEMENT : 'AJUSTEMENT',
}as const;
export type TypeMouvement = typeof TypeMouvement[keyof typeof TypeMouvement];

export const TypeAjustement= {
    CASSE : 'CASSE',
    VOL : 'VOL',
    PERTE : 'PERTE',
    RETOUR_CLIENT : 'RETOUR_CLIENT',
    AJUSTEMENT_INVENTAIRE : 'AJUSTEMENT_INVENTAIRE',
}as const;
export type TypeAjustement = typeof TypeAjustement[keyof typeof TypeAjustement];

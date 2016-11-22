export const entries =
    Object.entries || (o => Object.keys(o).map(k => [k, o[k]]));

export const values =
    Object.values || (o => Object.keys(o).map(k => o[k]));

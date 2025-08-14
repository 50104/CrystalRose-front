let accessToken = null;

export const setAccess = (t) => { accessToken = t; };
export const getAccess = () => accessToken;
export const clearAccess = () => { accessToken = null; };
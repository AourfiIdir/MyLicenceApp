import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra || {};
export const BACKEND_API = extra.backendUrl || "https://flashflash.up.railway.app";

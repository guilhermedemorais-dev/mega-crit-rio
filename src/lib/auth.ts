export type StoredAuth = {
  userId: string;
  apiKey: string;
  role: string;
  username?: string;
};

const USER_ID_KEY = "mega_facil_user_id";
const API_KEY_KEY = "mega_facil_api_key";
const ROLE_KEY = "mega_facil_role";
const USERNAME_KEY = "mega_facil_username";

export const getStoredAuth = (): StoredAuth | null => {
  const userId = localStorage.getItem(USER_ID_KEY);
  const apiKey = localStorage.getItem(API_KEY_KEY);
  if (!userId || !apiKey) return null;
  return {
    userId,
    apiKey,
    role: localStorage.getItem(ROLE_KEY) ?? "user",
    username: localStorage.getItem(USERNAME_KEY) ?? undefined,
  };
};

export const setStoredAuth = (auth: StoredAuth) => {
  localStorage.setItem(USER_ID_KEY, auth.userId);
  localStorage.setItem(API_KEY_KEY, auth.apiKey);
  localStorage.setItem(ROLE_KEY, auth.role);
  if (auth.username) {
    localStorage.setItem(USERNAME_KEY, auth.username);
  }
};

export const clearStoredAuth = () => {
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(API_KEY_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(USERNAME_KEY);
};

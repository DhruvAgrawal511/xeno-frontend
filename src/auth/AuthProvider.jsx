import { createContext, useContext, useEffect, useState } from 'react';
import API from '../api';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  // On load, ask backend who we are (checks cookie)
  useEffect(() => {
    (async () => {
      try {
        const { user } = await API.me();
        setUser(user); // null or { id, email, name }
      } catch {
        setUser(null);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const loginWithIdToken = async (idToken) => {
    const res = await API.loginWithGoogle(idToken);
    setUser(res.user || null);
  };

  const logout = async () => {
    await API.logout();
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, checking, loginWithIdToken, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

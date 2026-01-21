import { createContext, useContext, useMemo, useCallback } from "react";
import useLocalStorage from "../hooks/useLocalStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [jwt, setJwt] = useLocalStorage("jwt", null);
  const [user, setUser] = useLocalStorage("user", {
    isAdmin: false,
    isBanned: false,
  });

  const login = useCallback(
    (token, userInfo) => {
      setJwt(token);
      setUser(userInfo);
    },
    [setJwt, setUser],
  );
  const logout = useCallback(() => {
    setJwt(null);
    setUser({ isAdmin: false, isBanned: false });
  }, [setJwt, setUser]);

  const [cart, setCart] = useLocalStorage("cart", []);

  const addToCart = useCallback(
    (movie) => {
      setCart((c) => {
        if (c.find((m) => m.id === movie.id)) return c;
        return [...c, movie];
      });
    },
    [setCart],
  );

  const removeFromCart = useCallback(
    (movieId) => {
      setCart((c) => c.filter((m) => m.id !== movieId));
    },
    [setCart],
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const syncCart = useCallback(async () => {
    if (!jwt) throw new Error("Not authenticated");
    const response = await fetch("/api/cart", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify(cart),
    });
    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }
    return response.json();
  }, [cart, jwt]);

  const value = useMemo(
    () => ({
      jwt,
      user,
      login,
      logout,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      syncCart,
    }),
    [
      jwt,
      user,
      login,
      logout,
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      syncCart,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

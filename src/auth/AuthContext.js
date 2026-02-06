import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useEffect,
} from "react";
import { jwtDecode } from "jwt-decode";

import useLocalStorage from "../hooks/useLocalStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [jwt, setJwt] = useLocalStorage("jwt", null);
  const [user, setUser] = useLocalStorage("user", {
    username: "",
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

  const [cart, setCart] = useLocalStorage("cart", []);

  const logout = useCallback(() => {
    setJwt(null);
    setUser({ username: "", isAdmin: false, isBanned: false });
    setCart([]);
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    localStorage.removeItem("cart");
  }, [setJwt, setUser, setCart]);

  // Auto-logout on token expiry
  useEffect(() => {
    if (!jwt) return;

    let timeoutId;

    try {
      const { exp } = jwtDecode(jwt); // exp is in seconds since epoch
      if (!exp) {
        logout();
        return;
      }

      const expiresAtMs = exp * 1000;
      const msUntilExpiry = expiresAtMs - Date.now();

      if (msUntilExpiry <= 0) {
        logout();
        return;
      }

      timeoutId = setTimeout(() => {
        logout();
      }, msUntilExpiry);
    } catch (e) {
      logout();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [jwt, logout]);

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

  const fetchCart = useCallback(
    async (tokenOverride) => {
      const token = tokenOverride || jwt;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/basket",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Fetch cart failed (${res.status})`);
      }

      const data = await res.json();

      // Keep the current assumption (API returns an array of movies)
      setCart(Array.isArray(data) ? data : []);

      return data;
    },
    [jwt, setCart],
  );

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
      fetchCart,
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
      fetchCart,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

import { Outlet, useLoaderData } from "react-router-dom";
import { useState, useCallback } from "react";
import MoviesNavigation from "../components/MoviesNavigation";
import { useAuth } from "../auth/AuthContext";

export default function MoviesRootLayout() {
  const { jwt } = useAuth();

  const initialMovies = useLoaderData();

  const [displayedMovies, setDisplayedMovies] = useState(initialMovies);

  const handleSearch = useCallback(
    async (query) => {
      if (!query) {
        setDisplayedMovies(initialMovies);
        return;
      }
      try {
        const res = await fetch(
          `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/movies/byKeywords/${query}`,
          {
            headers: { Authorization: `Bearer ${jwt}` },
          },
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setDisplayedMovies(data);
      } catch (err) {
        console.error("Search failed:", err);

        setDisplayedMovies([]);
      }
    },
    [initialMovies, jwt],
  );

  return (
    <>
      <MoviesNavigation onSearch={handleSearch} />

      <Outlet
        context={{
          displayedMovies,
          reset: () => setDisplayedMovies(initialMovies),
        }}
      />
    </>
  );
}

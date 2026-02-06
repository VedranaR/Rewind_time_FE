import { Outlet, useLoaderData } from "react-router-dom";
import { useState, useCallback, useEffect } from "react";
import MoviesNavigation from "../components/MoviesNavigation";

function buildPageableUrl({ q = "", page = 0, size = 20, sort = "title,asc" }) {
  const params = new URLSearchParams();
  params.set("ratingMin", "0");
  params.set("ratingMax", "10");
  params.set("yearFrom", "1800");
  params.set("yearTo", "2200");
  if (q && q.trim()) params.set("q", q.trim());

  params.set("page", String(page));
  params.set("size", String(size));
  params.set("sort", sort);

  return `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/movies/pageable?${params.toString()}`;
}

export default function MoviesRootLayout() {
  const loaderData = useLoaderData(); // { movies, page, q }

  const [displayedMovies, setDisplayedMovies] = useState(loaderData.movies);
  const [pageInfo, setPageInfo] = useState(loaderData.page); // { size, number, totalElements, totalPages }
  const [q, setQ] = useState(loaderData.q || "");

  // stock cache (same idea as your loader)
  const [stockMap, setStockMap] = useState({});

  useEffect(() => {
    async function loadStock() {
      try {
        const stockRes = await fetch(
          "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/stock",
        );
        if (!stockRes.ok) return;

        const stockData = await stockRes.json();
        const map = stockData.reduce((acc, entry) => {
          acc[entry.movieId] = entry.stock;
          return acc;
        }, {});
        setStockMap(map);
      } catch (e) {
        console.warn("Stock fetch failed:", e);
      }
    }

    loadStock();
  }, []);

  const fetchPage = useCallback(
    async ({ nextQ, page }) => {
      const url = buildPageableUrl({
        q: nextQ,
        page,
        size: 20,
        sort: "title,asc",
      });

      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();

      const moviesWithStock = (data.content || []).map((m) => ({
        ...m,
        stock: stockMap[m.id] ?? 0,
      }));

      setDisplayedMovies(moviesWithStock);
      setPageInfo(data.page);
    },
    [stockMap],
  );

  const handleSearch = useCallback(
    async (query) => {
      const nextQ = query || "";
      setQ(nextQ);

      // always reset to first page on new search
      await fetchPage({ nextQ, page: 0 });
    },
    [fetchPage],
  );

  const goToPage = useCallback(
    async (newPage) => {
      await fetchPage({ nextQ: q, page: newPage });
    },
    [fetchPage, q],
  );

  return (
    <>
      <MoviesNavigation onSearch={handleSearch} />

      <Outlet
        context={{
          displayedMovies,
          pageInfo,
          q,
          goToPage,
        }}
      />
    </>
  );
}

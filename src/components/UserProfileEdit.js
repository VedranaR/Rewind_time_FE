import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import classes from "./UserProfileEdit.module.css";

function UserProfileEdit() {
  const { jwt } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const [returning, setReturning] = useState(false);
  const [returnMessage, setReturnMessage] = useState("");
  const [returnError, setReturnError] = useState("");

  // movieId -> movie object cache
  const [movieCache, setMovieCache] = useState({});

  async function fetchHistory() {
    if (!jwt) return;

    setLoadingHistory(true);
    setHistoryError("");

    try {
      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/history",
        {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to load history (${res.status})`);
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setHistoryError(err.message || "Failed to load order history");
      setOrders([]);
    } finally {
      setLoadingHistory(false);
    }
  }

  async function getMovieById(movieId) {
    if (movieCache[movieId]) return movieCache[movieId];

    const res = await fetch(
      `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/movies/one?id=${encodeURIComponent(
        movieId,
      )}`,
    );

    if (!res.ok) {
      console.warn("Failed to load movie:", movieId);
      return null;
    }

    const movie = await res.json();

    setMovieCache((prev) => ({
      ...prev,
      [movieId]: movie,
    }));

    return movie;
  }

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  // Preload movie titles when orders change
  useEffect(() => {
    async function preloadMovieTitles() {
      const allIds = new Set();

      orders.forEach((ord) => {
        if (Array.isArray(ord.itemIdList)) {
          ord.itemIdList.forEach((id) => allIds.add(id));
        }
      });

      const idsToFetch = Array.from(allIds).filter((id) => !movieCache[id]);

      if (idsToFetch.length === 0) return;

      try {
        await Promise.all(idsToFetch.map((id) => getMovieById(id)));
      } catch (e) {
        console.warn("Failed to preload some movie titles:", e);
      }
    }

    preloadMovieTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  async function handleReturnLatest() {
    setReturning(true);
    setReturnMessage("");
    setReturnError("");

    try {
      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/returnLatestOrder",
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Return failed (${res.status})`);
      }

      setReturnMessage("Order successfully returned.");
      await fetchHistory();
    } catch (err) {
      setReturnError(err.message || "Failed to return order");
    } finally {
      setReturning(false);
    }
  }

  const newestOrder =
    orders.length > 0
      ? [...orders].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        )[0]
      : null;

  return (
    <div className={classes.wrapper}>
      <h2 className={classes.title}>Your Past Orders</h2>

      {loadingHistory && <p>Loading order history...</p>}
      {historyError && <p className={classes.error}>{historyError}</p>}

      {returnMessage && <p className={classes.success}>{returnMessage}</p>}
      {returnError && <p className={classes.error}>{returnError}</p>}

      {!loadingHistory && orders.length === 0 && (
        <p>You have no past orders.</p>
      )}

      <ul className={classes.orderList}>
        {orders.map((ord) => {
          const isNewest =
            newestOrder && newestOrder.trackingNumber === ord.trackingNumber;

          return (
            <li key={ord.trackingNumber} className={classes.orderItem}>
              <p>
                <strong>Tracking #:</strong> {ord.trackingNumber}
              </p>
              <p>
                <strong>Date:</strong>{" "}
                {ord.createdAt ? new Date(ord.createdAt).toLocaleString() : ""}
              </p>
              <p>
                <strong>Items:</strong>{" "}
                {Array.isArray(ord.itemIdList) && ord.itemIdList.length > 0
                  ? ord.itemIdList
                      .map((id) => movieCache[id]?.title || id)
                      .join(", ")
                  : ""}
              </p>
              <p>
                <strong>Status:</strong> {ord.status}
              </p>

              {isNewest && ord.status !== "Returned" && (
                <div className={classes.orderActions}>
                  <button
                    onClick={handleReturnLatest}
                    disabled={returning}
                    className={classes.returnBtn}
                  >
                    {returning ? "Returning..." : "Return order"}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default UserProfileEdit;

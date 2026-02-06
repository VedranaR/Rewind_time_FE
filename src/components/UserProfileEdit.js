import { useEffect, useMemo, useState } from "react";
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
        { headers: { Authorization: `Bearer ${jwt}` } },
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
    // already cached
    if (movieCache[movieId]) return movieCache[movieId];

    const res = await fetch(
      `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/movies/one?id=${encodeURIComponent(
        movieId,
      )}`,
    );

    if (!res.ok) {
      console.warn("Failed to load movie:", movieId, res.status);
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

  // preload movie titles whenever orders change
  useEffect(() => {
    async function preloadTitles() {
      const ids = new Set();

      orders.forEach((ord) => {
        if (Array.isArray(ord.itemIdList)) {
          ord.itemIdList.forEach((id) => ids.add(id));
        }
      });

      const missing = Array.from(ids).filter((id) => !movieCache[id]);
      if (missing.length === 0) return;

      try {
        await Promise.all(missing.map((id) => getMovieById(id)));
      } catch (e) {
        console.warn("Failed to preload some movie titles:", e);
      }
    }

    preloadTitles();
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
          headers: { Authorization: `Bearer ${jwt}` },
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

  // newest order = greatest orderDate
  const newestOrder = useMemo(() => {
    if (!orders.length) return null;

    return [...orders].sort(
      (a, b) => new Date(b.orderDate) - new Date(a.orderDate),
    )[0];
  }, [orders]);

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

          const statusLabel = ord.isReturned ? "Returned" : "Active";

          const itemsLabel =
            Array.isArray(ord.itemIdList) && ord.itemIdList.length > 0
              ? ord.itemIdList
                  .map((id) => movieCache[id]?.title || id)
                  .join(", ")
              : "";

          return (
            <li key={ord.trackingNumber} className={classes.orderItem}>
              <p>
                <strong>Tracking #:</strong> {ord.trackingNumber}
              </p>

              <p>
                <strong>Date:</strong>{" "}
                {ord.orderDate ? new Date(ord.orderDate).toLocaleString() : ""}
              </p>

              <p>
                <strong>Items:</strong> {itemsLabel}
              </p>

              <p>
                <strong>Status:</strong> {statusLabel}
              </p>

              {ord.isReturned && ord.returnTrackingNumber && (
                <p>
                  <strong>Return tracking #:</strong> {ord.returnTrackingNumber}
                </p>
              )}

              {ord.isReturned && ord.returnDate && (
                <p>
                  <strong>Return date:</strong>{" "}
                  {new Date(ord.returnDate).toLocaleString()}
                </p>
              )}

              {/* Only newest non-returned order can be returned */}
              {isNewest && !ord.isReturned && (
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

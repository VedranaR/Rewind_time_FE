import { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import classes from "./UserProfileEdit.module.css";

function UserProfileEdit() {
  const { jwt } = useAuth();

  // Order history state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Return order UX state
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  // NEW: cache movie details so we can show titles instead of ids
  // movieId (tt...) -> movie object
  const [movieCache, setMovieCache] = useState({});

  // Fetch order history (reusable so we can refresh after returning)
  async function fetchHistory() {
    if (!jwt) return;

    setLoadingOrders(true);
    setOrdersError("");

    try {
      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/history",
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      setOrdersError(err.message || "Failed to load orders");
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  // NEW: fetch one movie by id and cache it
  async function getMovieById(movieId) {
    if (!movieId) return null;
    if (movieCache[movieId]) return movieCache[movieId];

    const res = await fetch(
      `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/movies/one?id=${encodeURIComponent(
        movieId,
      )}`,
    );

    if (!res.ok) {
      console.warn("Failed to fetch movie:", movieId, res.status);
      return null;
    }

    const movie = await res.json();
    setMovieCache((prev) => ({ ...prev, [movieId]: movie }));
    return movie;
  }

  // NEW: whenever we load history, preload movie titles for ids in orders
  useEffect(() => {
    async function preloadMovieTitles() {
      if (!orders || orders.length === 0) return;

      const uniqueIds = new Set();
      orders.forEach((ord) => {
        if (Array.isArray(ord.itemIdList)) {
          ord.itemIdList.forEach((id) => uniqueIds.add(id));
        }
      });

      const idsToFetch = Array.from(uniqueIds).filter((id) => !movieCache[id]);
      if (idsToFetch.length === 0) return;

      try {
        await Promise.all(idsToFetch.map((id) => getMovieById(id)));
      } catch (e) {
        console.warn("Preload movie titles failed:", e);
      }
    }

    preloadMovieTitles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  // Return latest/active order (user can only have one active order)
  async function handleReturnLatestOrder() {
    if (!jwt) return;

    setReturning(true);
    setReturnError("");
    setReturnSuccess("");

    try {
      let res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/returnLatestOrder",
        {
          method: "POST", // if backend expects PUT, we fallback below
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      // fallback if backend uses PUT
      if (res.status === 405) {
        res = await fetch(
          "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/returnLatestOrder",
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        );
      }

      if (!res.ok) throw new Error(await res.text());

      setReturnSuccess("Order successfully returned.");
      await fetchHistory();
    } catch (err) {
      setReturnError(err.message || "Return failed");
    } finally {
      setReturning(false);
    }
  }

  return (
    <div className={classes.wrapper}>
      {/* Collapsible section: Personal details */}
      <details className={classes.section} open>
        <summary className={classes.summary}>Personal Account Details</summary>

        <div className={classes.sectionContent}>
          <Form method="post" className={classes.form}>
            <p>
              <label htmlFor="name">First and Last Name</label>
              <input
                id="name"
                type="text"
                name="name"
                required
                placeholder="First and Last Name"
              />
            </p>

            <p>
              <label htmlFor="year">Year and month of birth</label>
              <input id="year" type="month" name="year" required />
            </p>

            <p>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                name="email"
                required
                placeholder="Email"
              />
            </p>

            <p>
              <label htmlFor="password">Your Chosen Password</label>
              <input
                id="password"
                type="password"
                name="password"
                required
                placeholder="Password"
              />
            </p>

            <div className={classes.actions}>
              <button type="reset">Cancel</button>
              <button type="submit">Save</button>
            </div>
          </Form>
        </div>
      </details>

      <hr className={classes.divider} />

      {/* Collapsible section: Membership / payment */}
      <details className={classes.section}>
        <summary className={classes.summary}>
          Membership Fee Payment Details
        </summary>

        <div className={classes.sectionContent}>
          <Form method="post" className={classes.form}>
            <p>
              <label htmlFor="cardNumber">Credit Card Number</label>
              <input
                id="cardNumber"
                type="text"
                name="cardNumber"
                required
                placeholder="Credit Card Number"
              />
            </p>

            <p>
              <label htmlFor="cardExpirationDate">Card Valid Until</label>
              <input
                id="cardExpirationDate"
                type="month"
                name="cardExpirationDate"
                required
              />
            </p>

            <p>
              <label htmlFor="cardHolderName">Credit Card Owner</label>
              <input
                id="cardHolderName"
                type="text"
                name="cardHolderName"
                required
                placeholder="Credit Card Owner"
              />
            </p>

            <p>
              <label htmlFor="streetWithNumber">
                Street Name and House Number
              </label>
              <input
                id="streetWithNumber"
                type="text"
                name="streetWithNumber"
                required
                placeholder="Street Name and House Number"
              />
            </p>

            <p>
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                name="city"
                required
                placeholder="City"
              />
            </p>

            <p>
              <label htmlFor="postalCode">Postal Code</label>
              <input
                id="postalCode"
                type="text"
                name="postalCode"
                required
                placeholder="Postal Code"
              />
            </p>

            <div className={classes.actions}>
              <button type="reset">Cancel</button>
              <button type="submit">Save</button>
            </div>
          </Form>
        </div>
      </details>

      <hr className={classes.divider} />

      {/* Order history section */}
      <section className={classes.historySection}>
        <h2 className={classes.title}>Your Past Orders</h2>

        {returnSuccess && <p className={classes.success}>{returnSuccess}</p>}
        {returnError && <p className={classes.error}>{returnError}</p>}

        {loadingOrders && <p>Loading…</p>}
        {!loadingOrders && ordersError && (
          <p className={classes.error}>{ordersError}</p>
        )}

        {!loadingOrders && !ordersError && orders.length === 0 && (
          <p>You have no past orders.</p>
        )}

        {!loadingOrders && !ordersError && orders.length > 0 && (
          <ul className={classes.orderList}>
            {orders.map((ord) => (
              <li key={ord.trackingNumber} className={classes.orderItem}>
                <strong>Tracking #:</strong> {ord.trackingNumber}
                <br />
                <strong>Date:</strong>{" "}
                {ord.orderDate ? new Date(ord.orderDate).toLocaleString() : ""}
                <br />
                <strong>Items:</strong>{" "}
                {Array.isArray(ord.itemIdList)
                  ? ord.itemIdList
                      .map((id) => movieCache[id]?.title || id)
                      .join(", ")
                  : ""}
                <br />
                <strong>Status:</strong>{" "}
                {ord.isReturned ? "Returned" : "Active"}
                {/* Only active order can be returned; user has max 1 active */}
                {!ord.isReturned && (
                  <div className={classes.orderActions}>
                    <button
                      type="button"
                      onClick={handleReturnLatestOrder}
                      disabled={returning}
                      className={classes.returnBtn}
                    >
                      {returning ? "Returning…" : "Return order"}
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default UserProfileEdit;

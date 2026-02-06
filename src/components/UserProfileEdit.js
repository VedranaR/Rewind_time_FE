import { useEffect, useState } from "react";
import { Form } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import classes from "./UserProfileEdit.module.css";

function UserProfileEdit() {
  const { jwt, user } = useAuth();

  // Order history state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // Return order UX state
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  // Membership details (read-only account section)
  const [membership, setMembership] = useState(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState("");

  // Movie cache for titles in order history
  const [movieCache, setMovieCache] = useState({});

  // Fetch order history
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

  // NEW: Fetch membership details
  async function fetchMembership() {
    if (!jwt) return;

    setMembershipLoading(true);
    setMembershipError("");

    try {
      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/membership",
        {
          method: "GET",
          headers: { Authorization: `Bearer ${jwt}` },
        },
      );

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setMembership(data);
    } catch (err) {
      setMembership(null);
      setMembershipError(err.message || "Failed to load membership details");
    } finally {
      setMembershipLoading(false);
    }
  }

  useEffect(() => {
    fetchHistory();
    fetchMembership();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

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

  async function handleReturnLatestOrder() {
    if (!jwt) return;

    setReturning(true);
    setReturnError("");
    setReturnSuccess("");

    try {
      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/returnLatestOrder",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

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
      {/* Account details (read-only) */}
      <details className={classes.section} open>
        <summary className={classes.summary}>Account details</summary>

        <div className={classes.sectionContent}>
          <ul className={classes.orderList}>
            <li>
              <strong>Username:</strong> {user?.username || "-"}
            </li>
          </ul>

          <hr className={classes.divider} />

          <h3 style={{ marginTop: 0 }}>Membership fee payment details</h3>

          {membershipLoading && <p>Loading membership details…</p>}
          {!membershipLoading && membershipError && (
            <p className={classes.error}>{membershipError}</p>
          )}

          {!membershipLoading && !membershipError && membership && (
            <ul className={classes.orderList}>
              <li>
                <strong>Valid until:</strong>{" "}
                {membership.validUntil
                  ? new Date(membership.validUntil).toLocaleString()
                  : "-"}
              </li>

              <li style={{ marginTop: "0.75rem" }}>
                <strong>Card info</strong>
              </li>
              <li>
                <strong>Card number:</strong>{" "}
                {membership.cardInfo?.cardNumber || "-"}
              </li>
              <li>
                <strong>Expiration date:</strong>{" "}
                {membership.cardInfo?.cardExpirationDate || "-"}
              </li>
              <li>
                <strong>Card holder:</strong>{" "}
                {membership.cardInfo?.cardHolderName || "-"}
              </li>

              <li style={{ marginTop: "0.75rem" }}>
                <strong>Shipping info</strong>
              </li>
              <li>
                <strong>Street:</strong>{" "}
                {membership.shippingInfo?.streetWithNumber || "-"}
              </li>
              <li>
                <strong>City:</strong> {membership.shippingInfo?.city || "-"}
              </li>
              <li>
                <strong>Postal code:</strong>{" "}
                {membership.shippingInfo?.postalCode || "-"}
              </li>
            </ul>
          )}
        </div>
      </details>

      <hr className={classes.divider} />

      {/* Collapsible section: Membership / payment (EDIT FORM still kept as your original) */}
      <details className={classes.section}>
        <summary className={classes.summary}>
          Membership Fee Payment Details (Edit)
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

import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import classes from "./UserProfileEdit.module.css";

function UserProfileEdit() {
  const { jwt, user } = useAuth();

  // order history
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState("");

  // return order
  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  // membership
  const [membership, setMembership] = useState(null);
  const [membershipLoading, setMembershipLoading] = useState(false);
  const [membershipError, setMembershipError] = useState("");

  const [savingMembership, setSavingMembership] = useState(false);
  const [membershipSaveError, setMembershipSaveError] = useState("");
  const [membershipSaveSuccess, setMembershipSaveSuccess] = useState("");

  // membership form fields (flat payload for PUT /membership)
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpirationDate, setCardExpirationDate] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [streetWithNumber, setStreetWithNumber] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");

  // movie cache for titles in order history
  const [movieCache, setMovieCache] = useState({});

  async function fetchHistory() {
    if (!jwt) return;

    setLoadingOrders(true);
    setOrdersError("");

    try {
      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/history",
        {
          headers: { Authorization: `Bearer ${jwt}` },
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

      // prefill edit form fields from GET response shape
      setCardNumber(data?.cardInfo?.cardNumber || "");
      setCardExpirationDate(data?.cardInfo?.cardExpirationDate || "");
      setCardHolderName(data?.cardInfo?.cardHolderName || "");
      setStreetWithNumber(data?.shippingInfo?.streetWithNumber || "");
      setCity(data?.shippingInfo?.city || "");
      setPostalCode(data?.shippingInfo?.postalCode || "");
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
          headers: { Authorization: `Bearer ${jwt}` },
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

  async function handleMembershipSave(e) {
    e.preventDefault();
    if (!jwt) return;

    setSavingMembership(true);
    setMembershipSaveError("");
    setMembershipSaveSuccess("");

    try {
      const payload = {
        cardNumber,
        cardExpirationDate,
        cardHolderName,
        streetWithNumber,
        city,
        postalCode,
      };

      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/membership",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) throw new Error(await res.text());

      const updatedMembership = await res.json();
      setMembership(updatedMembership);

      setMembershipSaveSuccess("Membership details saved.");
    } catch (err) {
      setMembershipSaveError(
        err.message || "Failed to save membership details",
      );
    } finally {
      setSavingMembership(false);
    }
  }

  function handleMembershipCancel() {
    // revert back to last fetched membership state
    setMembershipSaveError("");
    setMembershipSaveSuccess("");

    setCardNumber(membership?.cardInfo?.cardNumber || "");
    setCardExpirationDate(membership?.cardInfo?.cardExpirationDate || "");
    setCardHolderName(membership?.cardInfo?.cardHolderName || "");
    setStreetWithNumber(membership?.shippingInfo?.streetWithNumber || "");
    setCity(membership?.shippingInfo?.city || "");
    setPostalCode(membership?.shippingInfo?.postalCode || "");
  }

  return (
    <div className={classes.wrapper}>
      {/* Account details read-only */}
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

      {/* Membership edit form */}
      <details className={classes.section}>
        <summary className={classes.summary}>
          Membership Fee Payment Details (Edit)
        </summary>

        <div className={classes.sectionContent}>
          {membershipSaveSuccess && (
            <p className={classes.success}>{membershipSaveSuccess}</p>
          )}
          {membershipSaveError && (
            <p className={classes.error}>{membershipSaveError}</p>
          )}

          <form className={classes.form} onSubmit={handleMembershipSave}>
            <p>
              <label htmlFor="cardNumber">Credit Card Number</label>
              <input
                id="cardNumber"
                type="text"
                name="cardNumber"
                required
                placeholder="Credit Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </p>

            <p>
              <label htmlFor="cardExpirationDate">Card Valid Until</label>
              <input
                id="cardExpirationDate"
                type="month"
                name="cardExpirationDate"
                required
                value={cardExpirationDate}
                onChange={(e) => setCardExpirationDate(e.target.value)}
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
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
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
                value={streetWithNumber}
                onChange={(e) => setStreetWithNumber(e.target.value)}
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
                value={city}
                onChange={(e) => setCity(e.target.value)}
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
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
              />
            </p>

            <div className={classes.actions}>
              <button
                type="button"
                onClick={handleMembershipCancel}
                disabled={savingMembership}
              >
                Cancel
              </button>
              <button type="submit" disabled={savingMembership}>
                {savingMembership ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
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

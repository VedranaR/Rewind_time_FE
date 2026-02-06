import { useEffect, useState } from "react";
import { Form, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import classes from "./UserProfileEdit.module.css";

function UserProfileEdit() {
  const navigate = useNavigate();
  const { jwt } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [returning, setReturning] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [returnSuccess, setReturnSuccess] = useState("");

  function cancelHandler() {
    navigate("..");
  }

  async function fetchHistory() {
    setLoading(true);
    setError("");

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
      setError(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (jwt) fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jwt]);

  async function handleReturnLatestOrder() {
    setReturning(true);
    setReturnError("");
    setReturnSuccess("");

    try {
      let res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/returnLatestOrder",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );

      // If backend expects PUT instead of POST
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
      <h2 className={classes.title}>Your Past Orders</h2>

      {loading && <p>Loading…</p>}
      {error && <p className={classes.error}>{error}</p>}
      {returnSuccess && <p className={classes.success}>{returnSuccess}</p>}

      {!loading && orders.length === 0 && <p>You have no past orders.</p>}

      {!loading && orders.length > 0 && (
        <ul className={classes.orderList}>
          {orders.map((ord) => (
            <li key={ord.trackingNumber} className={classes.orderItem}>
              <strong>Tracking #:</strong> {ord.trackingNumber}
              <br />
              <strong>Date:</strong>{" "}
              {new Date(ord.orderDate).toLocaleDateString()}
              <br />
              <strong>Items:</strong> {ord.itemIdList.join(", ")}
              <br />
              <strong>Status:</strong> {ord.isReturned ? "Returned" : "Active"}
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

                  {returnError && (
                    <p className={classes.error}>{returnError}</p>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className={classes.actions}>
        <button type="button" onClick={cancelHandler}>
          Back
        </button>
      </div>
    </div>
  );
}

export default UserProfileEdit;

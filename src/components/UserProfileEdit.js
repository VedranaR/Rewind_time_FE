import { useState, useEffect } from "react";
import { Form, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

import classes from "./UserProfileEdit.module.css";

function UserProfileEditForm({ method }) {
  const navigate = useNavigate();
  const { jwt, credits } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(
          "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/history",
          {
            headers: { Authorization: `Bearer ${jwt}` },
          },
        );
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to load order history:", err);
        setError("Could not load your past orders.");
      } finally {
        setLoading(false);
      }
    }

    if (jwt) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [jwt]);

  function cancelHandler() {
    navigate("..");
  }

  return (
    <div className={classes.wrapper}>
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
              <button>Save</button>
            </div>
          </Form>
        </div>
      </details>

      <hr className={classes.divider} />

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
              <button>Save</button>
            </div>
          </Form>
        </div>
      </details>

      <hr className={classes.divider} />

      <section className={classes.historySection}>
        <h2 className={classes.title}>Your Past Orders</h2>

        {loading && <p>Loading…</p>}
        {error && <p className={classes.error}>{error}</p>}
        {!loading && orders.length === 0 && <p>You have no past orders.</p>}

        {!loading && orders.length > 0 && (
          <ul className={classes.orderList}>
            {orders.map((ord) => (
              <li key={ord.trackingNumber}>
                <strong>Tracking #:</strong> {ord.trackingNumber}
                <br />
                <strong>Date:</strong>{" "}
                {new Date(ord.orderDate).toLocaleDateString()}
                <br />
                <strong>Items:</strong> {ord.itemIdList.join(", ")}
                <br />
                <strong>Status:</strong>{" "}
                {ord.isReturned ? "Returned" : "Active"}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default UserProfileEditForm;

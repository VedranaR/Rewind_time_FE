import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import classes from "./ShoppingCart.module.css";

export default function ShoppingCart() {
  const { cart, addToCart, removeFromCart, clearCart, jwt } = useAuth();

  if (cart.length === 0) {
    return (
      <div className={classes.movies}>
        <h1>Your Shopping Cart</h1>
        <p>Your basket is empty.</p>
      </div>
    );
  }

  async function orderHandler() {
    if (cart.length === 0) {
      console.warn("Your shopping cart is empty, there is nothing to order.");
      return;
    }

    try {
      const memRes = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/membership",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      if (!memRes.ok) {
        console.error("Membership check failed:", memRes.status);
        alert("Could not verify membership. Please try again later.");
        return;
      }
      const memData = await memRes.json();
      if (memData.message === "User is not member!") {
        alert("You have to update your membership status to enable ordering.");
        return;
      }
    } catch (err) {
      console.error("Network error on membership check:", err);
      alert("Network error. Please try again later.");
      return;
    }

    try {
      const res = await fetch(
        "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/order/completeOrder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify(cart),
        },
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(`Order failed (${res.status}):`, text);
        alert(JSON.parse(text).message);
        return;
      }

      console.log("Order completed!");
      clearCart();
      alert("Your order was placed successfully!");
    } catch (err) {
      console.error("Network error while ordering:", err);
    }
  }

  async function removeFromCartHandler(movieid) {
    removeFromCart(movieid);
    try {
      const res = await fetch(
        `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/basket/remove/${movieid}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      if (!res.ok) throw new Error(`Remove failed (${res.status})`);
      console.log("✅ removed from basket on server");
    } catch (err) {
      console.error(err);

      addToCart(movieid);
    }
  }

  return (
    <div className={classes.movies}>
      <h1>Your Shopping Cart</h1>
      <div className={classes.globalActions}>
        <button
          className={classes.proceedAll}
          onClick={orderHandler}
          disabled={!jwt || cart.length === 0}
        >
          Proceed to Checkout ({cart.length})
        </button>
      </div>
      <ul className={classes.list}>
        {cart.map((movie) => (
          <li key={movie.id} className={classes.item}>
            <Link>
              <img
                src={movie.coverImageUrl || "poster-placeholder.png"}
                alt={movie.title}
              />

              <div className={classes.content}>
                <h2>{movie.title}</h2>

                <h4>Actors</h4>
                <div className={classes.actorslist}>
                  {movie.actors.map((a) => (
                    <p key={a.id}>{a.name}</p>
                  ))}
                </div>

                <h4>Directors</h4>
                <div className={classes.directorslist}>
                  {movie.directors.map((d) => (
                    <p key={d.id}>{d.name}</p>
                  ))}
                </div>

                {movie.orderedDate && (
                  <>
                    <h4>Ordered</h4>
                    <div>
                      {new Date(movie.orderedDate).toLocaleDateString()}
                    </div>
                  </>
                )}

                <div className={classes.buttons}>
                  <button onClick={() => removeFromCartHandler(movie.id)}>
                    ✖
                  </button>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

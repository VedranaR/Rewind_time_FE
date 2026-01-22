import { Link } from "react-router-dom";
import classes from "./MovieItem.module.css";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import placeholder from "../assets/poster-placeholder.png";

function MovieItem({ movie }) {
  const { jwt, user, addToCart, removeFromCart, cart } = useAuth();
  const inCart = cart.some((m) => m.id === movie.id);
  /*console.log({ movie });
  console.log(jwt);*/
  async function addToCartHandler() {
    addToCart(movie);

    try {
      const res = await fetch(
        `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/basket/add/${movie.id}`,
        {
          method: "PUT",
          headers: {
            accept: "*/*",
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      if (!res.ok) {
        const text = await res.text();
        console.error("Add-to-basket failed:", res.status, text);
        throw new Error(`Add to basket failed (${res.status})`);
      }
      console.log("added to basket on server");
    } catch (err) {
      console.error(err);

      removeFromCart(movie.id);
    }
  }

  async function removeFromCartHandler() {
    removeFromCart(movie.id);
    try {
      const res = await fetch(
        `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/basket/remove/${movie.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        },
      );
      if (!res.ok) throw new Error(`Remove failed (${res.status})`);
      console.log("removed from basket on server");
    } catch (err) {
      console.error(err);

      addToCart(movie);
    }
  }

  const [reviewText, setReviewText] = useState("");

  function handleReviewCancel() {
    setReviewText("");
    alert("Review canceled");
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    try {
      const res = await fetch(
        `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/reviews/put/${movie.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ text: reviewText }),
        },
      );
      if (!res.ok) {
        const errBody = await res.text();
        throw new Error(errBody || `Status ${res.status}`);
      }
      alert("Review submitted successfully");
      setReviewText("");
    } catch (err) {
      console.error("Review submission failed:", err);
      alert("Failed to submit review: " + err.message);
    }
  }

  const trailerEmbedUrl = movie?.youtubeTrailer?.embedUrl;
  const trailerUrl = trailerEmbedUrl
    ? `${trailerEmbedUrl}?autoplay=0&mute=1&controls=1`
    : null;

  return (
    <article className={classes.event}>
      <img
        src={movie.coverImageUrl || placeholder}
        alt={movie.title}
        className={classes.poster}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = placeholder;
        }}
      />

      <menu className={classes.actions}>
        {user.isAdmin && <Link to="edit">Edit</Link>}

        {user.isAdmin && (
          <button
            onClick={() => /* to do later - delete movie functionality */ null}
          >
            Delete
          </button>
        )}

        {jwt && !inCart && (
          <button className={classes.rentBtn} onClick={addToCartHandler}>
            Add to basket
          </button>
        )}
        {jwt && inCart && (
          <button className={classes.rentBtn} onClick={removeFromCartHandler}>
            Remove from basket
          </button>
        )}
      </menu>
      <hr></hr>
      <div className={classes.content}>
        <h2>{movie.title}</h2>
        {jwt && movie.stock !== undefined && movie.stock !== null && (
          <span>available in stock: {movie.stock}</span>
        )}
        <h4>Year of filming</h4>
        <div>
          <p>{movie.releaseDate.slice(0, 4)}</p>
        </div>
        <h4>Actors</h4>
        <div>
          {movie.actors.map((actor) => (
            <p key={actor.id}>{actor.name}</p>
          ))}
        </div>
        <h4>Directors</h4>
        <div>
          {movie.directors.map((director) => (
            <p key={director.id}>{director.name}</p>
          ))}
        </div>
        <h4>Description</h4>
        <div>
          <p>{movie.description}</p>
        </div>
        <h4>Trailer</h4>
        <div className={classes.trailer}>
          {trailerUrl ? (
            <div className={classes.trailerFrame}>
              <iframe
                src={trailerUrl}
                title={movie.youtubeTrailer?.name || `${movie.title} trailer`}
                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : (
            <p>No trailer available.</p>
          )}
        </div>
      </div>
      {jwt && (
        <form className={classes.form} onSubmit={handleReviewSubmit}>
          <p>
            <label htmlFor="review">Add a new review</label>
            <textarea
              id="review"
              name="review"
              rows="5"
              required
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
          </p>
          <div className={classes.actions}>
            <button type="button" onClick={handleReviewCancel}>
              Cancel
            </button>
            <button type="submit">Save</button>
          </div>
        </form>
      )}
    </article>
  );
}

export default MovieItem;

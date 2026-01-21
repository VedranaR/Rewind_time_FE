import { Form, useNavigate } from "react-router-dom";

import classes from "./MovieForm.module.css";

function MovieForm({ method, movie }) {
  const navigate = useNavigate();
  function cancelHandler() {
    navigate("..");
  }
  console.log(movie);
  return (
    <Form method="post" className={classes.form}>
      <p>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          required
          defaultValue={movie ? movie.title : ""}
        />
      </p>
      <p>
        <label htmlFor="image">Image</label>
        <input
          id="image"
          type="url"
          name="coverImageUrl"
          required
          defaultValue={movie ? movie.coverImageUrl : ""}
        />
      </p>
      <p>
        <label htmlFor="year">Year and month</label>
        <input id="year" type="month" name="releaseDate" required />
      </p>
      <p>
        <label htmlFor="actors">Actors (comma separated)</label>
        <input id="actors" type="text" name="actors" required />
      </p>
      <p>
        <label htmlFor="directors">Directors (comma separated)</label>
        <input id="directors" type="text" name="directors" required />
      </p>
      <p>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows="5"
          required
          defaultValue={movie ? movie.description : ""}
        />
      </p>
      <div className={classes.actions}>
        <button type="button" onClick={cancelHandler}>
          Cancel
        </button>
        <button>Save</button>
      </div>
    </Form>
  );
}

export default MovieForm;

import classes from "./MoviesList.module.css";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import placeholder from "../assets/poster-placeholder.png";

function MoviesList({ movies }) {
  const { jwt } = useAuth();

  console.log(movies);
  return (
    <div className={classes.movies}>
      <h1>All Movies</h1>
      <ul className={classes.list}>
        {movies.map((movie) => (
          <li key={movie.id} className={classes.item}>
            <a href="...">
              <Link to={movie.id}>
                <img
                  src={movie.coverImageUrl || placeholder}
                  alt={movie.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = placeholder;
                  }}
                />
                <div className={classes.content}>
                  <h2>{movie.title}</h2>

                  <span>available in stock: {movie.stock}</span>

                  <h4>Actors</h4>
                  <div>
                    {movie.actors.map((actor) => (
                      <p>{actor.name}</p>
                    ))}
                  </div>
                  <h4>Directors</h4>
                  <div>
                    {movie.directors.map((director) => (
                      <p>{director.name}</p>
                    ))}
                  </div>
                </div>
              </Link>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MoviesList;

import classes from "./MoviesList.module.css";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import placeholder from "../assets/poster-placeholder.png";

function MoviesList({ movies, pageInfo, goToPage }) {
  const { jwt } = useAuth();

  const currentPage = pageInfo?.number ?? 0;
  const totalPages = pageInfo?.totalPages ?? 0;
  const totalElements = pageInfo?.totalElements ?? 0;

  const canPrev = currentPage > 0;
  const canNext = currentPage + 1 < totalPages;

  return (
    <div className={classes.movies}>
      <h1>All Movies</h1>

      <div className={classes.pagination}>
        <button onClick={() => goToPage(0)} disabled={currentPage === 0}>
          ⏮ First
        </button>

        <button onClick={() => goToPage(currentPage - 1)} disabled={!canPrev}>
          ◀ Prev
        </button>

        <span className={classes.pageInfo}>
          Page {currentPage + 1} of {Math.max(1, totalPages)} ({totalElements}{" "}
          results)
        </span>

        <button onClick={() => goToPage(currentPage + 1)} disabled={!canNext}>
          Next ▶
        </button>

        <button
          onClick={() => goToPage(totalPages - 1)}
          disabled={currentPage === totalPages - 1}
        >
          Last ⏭
        </button>
      </div>

      <ul className={classes.list}>
        {movies.map((movie) => (
          <li key={movie.id} className={classes.item}>
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

                {jwt && movie.stock !== undefined && movie.stock !== null && (
                  <span>available in stock: {movie.stock}</span>
                )}

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
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MoviesList;

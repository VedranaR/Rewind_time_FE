import { useOutletContext } from "react-router-dom";
import MoviesList from "../components/MoviesList";

export default function MoviesPage() {
  const { displayedMovies, pageInfo, goToPage } = useOutletContext();

  return (
    <MoviesList
      movies={displayedMovies}
      pageInfo={pageInfo}
      goToPage={goToPage}
    />
  );
}

import { useOutletContext } from "react-router-dom";
import MoviesList from "../components/MoviesList";

export default function MoviesPage() {
  const { displayedMovies } = useOutletContext();

  return <MoviesList movies={displayedMovies} />;
}

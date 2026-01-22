import { useLoaderData } from "react-router-dom";
import MovieItem from "../components/MovieItem.js";
import stockData from "../stock.json";

function MovieDetailPage() {
  const movie = useLoaderData();
  return (
    <>
      <MovieItem movie={movie} />
    </>
  );
}

export default MovieDetailPage;

export async function loader({ request, params }) {
  const id = params.movieId;
  //console.log(params);
  const response = await fetch(
    `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/movies/one?id=${id}`,
  );

  if (!response.ok) {
    throw response;
  } else {
    const movie = await response.json();

    /*const stockEntry = stockData.find((s) => s.movieId === movie.id);
    const stock = stockEntry ? stockEntry.stock : 0;*/

    const movieWithStock = {
      ...movie /*,
      stock,*/,
    };
    return movieWithStock;
  }
}

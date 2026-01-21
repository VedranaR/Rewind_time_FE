import MovieForm from "../components/MovieForm";
import { useLoaderData } from "react-router-dom";

function EditMoviePage() {
  const movie = useLoaderData();

  return <MovieForm movie={movie} />;
}

export default EditMoviePage;

export async function editLoader({ request, params }) {
  const id = params.movieId;
  console.log(params);
  const response = await fetch(
    `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/movies/one?id=${id}`,
  );

  if (!response.ok) {
    throw response;
    /*return {
        isError: true,
        message: "Could not fetch movies, please try again later.",
      };*/
  } else {
    const resData = await response.json();
    return resData;
  }
}

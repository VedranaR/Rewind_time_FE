import MovieForm from "../components/MovieForm";
import { redirect } from "react-router-dom";

function NewMoviePage() {
  return (
    <>
      <MovieForm />
    </>
  );
}

export default NewMoviePage;

export async function action({ request, params }) {
  const data = await request.formData();

  const title = Object.fromEntries(data).title;
  const coverImageUrl = Object.fromEntries(data).coverImageUrl;
  const releaseDate = Object.fromEntries(data).releaseDate;
  const actors = Object.fromEntries(data)
    .actors.split(",")
    .map((name) => name.trim())
    .map((name) => ({
      id: "",
      name,
    }));
  const directors = Object.fromEntries(data)
    .directors.split(",")
    .map((name) => name.trim())
    .map((name) => ({
      id: "",
      name,
    }));
  const description = Object.fromEntries(data).description;

  let token = localStorage.getItem("jwt");
  token = token.slice(1, -1);
  try {
    const response = await fetch(
      "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/admin/movie",
      {
        method: "POST",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: {
          /*JSON.stringify(newMovieData)*/
        },
      },
    );

    const status = response.status;

    //return redirect("/movies");
  } catch {
    //return redirect("/movies");
  }
}

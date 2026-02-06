import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import MovieDetailPage, {
  loader as MovieDetailLoader,
} from "./pages/MovieDetail";
import MoviesPage from "./pages/Movies";
import HomePage from "./pages/Home";
import NewMoviePage, { action as newMovieAction } from "./pages/NewMovie";
import EditMoviePage, {
  editLoader as EditMovieLoader,
} from "./pages/EditMovie";
import RootLayout from "./pages/Root";
import MoviesRootLayout from "./pages/MoviesRoot";
import ErrorPage from "./pages/Error";
import ShoppingCartPage from "./pages/ShoppingCart";
import UserProfilePage, {
  action as newCreditCardAction,
} from "./pages/UserProfile";
import AdminPanelPage from "./pages/AdminPanel";
import LogInPage, { action as newLoginAction } from "./pages/LogIn";
import LogOutPage from "./pages/LogOut";
import RegistrationPage, {
  action as registrationAction,
} from "./pages/Registration";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "movies",
        element: <MoviesRootLayout />,
        errorElement: <ErrorPage />,
        loader: async () => {
          const params = new URLSearchParams();
          params.set("ratingMin", "0");
          params.set("ratingMax", "10");
          params.set("yearFrom", "1800");
          params.set("yearTo", "2200");
          params.set("page", "0");
          params.set("size", "20");
          params.set("sort", "title,asc");

          const response = await fetch(
            `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/movies/pageable?${params.toString()}`,
          );

          if (!response.ok) {
            console.error("Movies fetch failed:", response);
            throw new Error("Could not load movies");
          }

          const data = await response.json(); // { content: [...], page: {...} }

          const stockRes = await fetch(
            "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/stock",
          );

          let stockData = [];
          if (stockRes.ok) {
            stockData = await stockRes.json();
          } else {
            console.warn("Stock fetch failed:", stockRes.status);
          }

          const stockMap = stockData.reduce((map, entry) => {
            map[entry.movieId] = entry.stock;
            return map;
          }, {});

          const moviesWithStock = (data.content || []).map((m) => ({
            ...m,
            stock: stockMap[m.id] ?? 0,
          }));

          return {
            movies: moviesWithStock,
            page: data.page,
            q: "",
          };
        },
        children: [
          {
            index: true,
            element: <MoviesPage />,
          },
          {
            path: ":movieId",
            children: [
              {
                index: true,
                element: <MovieDetailPage />,
                loader: MovieDetailLoader,
              },
              {
                path: "edit",
                element: <EditMoviePage />,
                loader: EditMovieLoader,
              },
            ],
          },
          { path: "new", element: <NewMoviePage />, action: newMovieAction },
        ],
      },
      { path: "shoppingcart", element: <ShoppingCartPage /> },
      {
        path: "profile",
        element: <UserProfilePage />,
        action: newCreditCardAction,
      },
      { path: "adminpanel", element: <AdminPanelPage /> },
      { path: "adminpanel", element: <AdminPanelPage /> },

      {
        path: "login",
        element: <LogInPage />,
        errorElement: <ErrorPage />,
        action: newLoginAction,
      },
      { path: "logout", element: <LogOutPage /> },
      {
        path: "registration",
        element: <RegistrationPage />,
        action: registrationAction,
      },
    ],
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;

import classes from "./MoviesNavigation.module.css";
import { NavLink } from "react-router-dom";
import SearchForm from "./SearchForm";
import { useAuth } from "../auth/AuthContext";

function MoviesNavigation({ onSearch }) {
  const { jwt, user } = useAuth();
  return (
    <>
      <SearchForm onSearch={onSearch} />
      <header className={classes.header}>
        <nav>
          <ul className={classes.list}>
            <li>
              <NavLink
                to="/movies"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
                end
              >
                List Of All Movies
              </NavLink>
            </li>
            {jwt && (
              <li>
                <NavLink
                  to="/shoppingcart"
                  className={({ isActive }) =>
                    isActive ? classes.active : undefined
                  }
                  end
                >
                  Your Shopping Cart
                </NavLink>
              </li>
            )}
            {jwt && user.isAdmin && (
              <>
                <li>
                  <NavLink
                    to="/movies/new"
                    className={({ isActive }) =>
                      isActive ? classes.active : undefined
                    }
                    end
                  >
                    Add New Movie
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
    </>
  );
}

export default MoviesNavigation;

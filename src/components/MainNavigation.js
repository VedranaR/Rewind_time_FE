import { NavLink } from "react-router-dom";
import classes from "./MainNavigation.module.css";
import { useAuth } from "../auth/AuthContext";

function MainNavigation() {
  const { jwt, user } = useAuth();
  return (
    <header className={classes.header}>
      <nav>
        <ul className={classes.list}>
          <li>
            <NavLink to="/" className={undefined} end>
              <h1>REWIND TIME</h1>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/movies"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Movies
            </NavLink>
          </li>
          {!jwt && (
            <li>
              <NavLink
                to="/registration"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                Register
              </NavLink>
            </li>
          )}
          {!jwt && (
            <li>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                Log In
              </NavLink>
            </li>
          )}
          {jwt && (
            <li>
              <NavLink
                to="/logout"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
              >
                Log Out
              </NavLink>
            </li>
          )}
          {jwt && (
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
                end
              >
                User Profile
              </NavLink>
            </li>
          )}
          {jwt && user.isAdmin && (
            <li>
              <NavLink
                to="/adminpanel"
                className={({ isActive }) =>
                  isActive ? classes.active : undefined
                }
                end
              >
                Admin Panel
              </NavLink>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;

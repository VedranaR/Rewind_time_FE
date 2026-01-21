import { Outlet, useLocation } from "react-router-dom";
import MainNavigation from "../components/MainNavigation";
import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

function RootLayout() {
  const { setCredits } = useAuth();
  const { state } = useLocation();

  useEffect(() => {
    if (state?.membershipSuccess) {
      setCredits(100);

      window.history.replaceState({}, "");
    }
  }, [state, setCredits]);

  return (
    <>
      <MainNavigation />

      <main>
        <Outlet />
      </main>
    </>
  );
}

export default RootLayout;

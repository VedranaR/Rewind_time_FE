import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import LandingPage from "../components/LandingPage";

export default function LogOutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return <LandingPage />;
}

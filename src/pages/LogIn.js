import { useActionData, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import LogInForm from "../components/LogInForm";
import { redirect } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function LogInPage() {
  const actionData = useActionData();
  const { login, fetchCart } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (actionData?.jwt) {
      const payload = jwtDecode(actionData.jwt);
      const username = payload.sub;

      login(actionData.jwt, {
        username,
        isAdmin: actionData.authorities.includes("ROLE_ADMIN"),
        isBanned: false,
      });
      fetchCart().catch(console.error);

      navigate("/movies", { replace: true });
    }
  }, [actionData, fetchCart, login, navigate]);

  return <LogInForm />;
}

export default LogInPage;

export async function action({ request, params }) {
  const data = await request.formData();
  //console.log(Object.fromEntries(data));
  const username = Object.fromEntries(data).username;
  const password = Object.fromEntries(data).password;
  const loginData = {
    username: username,
    password: password,
  };
  //console.log(loginData);
  const response = await fetch(
    "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(loginData),
    },
  );

  const status = response.status;
  console.log(status);

  if (status === 200) {
    const text = await response.text();
    console.log(JSON.parse(text).jwt);
    return JSON.parse(text);
    /*const token = JSON.parse(text).jwt;
    console.log(token);
    const authority = JSON.parse(text).authorities[0];
    console.log(authority);
    localStorage.setItem("jwt", token);
    localStorage.setItem("authority", authority);*/
  } else {
    return redirect("..");
  }
  /*return redirect("/movies");*/
}

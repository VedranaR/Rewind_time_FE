import { redirect } from "react-router-dom";
import RegistrationForm from "../components/RegistrationForm";

function RegistrationPage() {
  return (
    <>
      <RegistrationForm />
    </>
  );
}

export default RegistrationPage;

export async function action({ request }) {
  const data = await request.formData();

  const username = data.get("username");
  const password = data.get("password");

  const response = await fetch(
    "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/auth/register",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    },
  );

  if (response.ok) {
    return redirect("/login?registered=1");
  }

  // handle 409 "User already exists!" and any other errors
  let message = "Registration failed. Please try again.";
  try {
    const err = await response.json();
    message = err?.message || message;
  } catch {
    // if response isn't JSON, keep default message
  }

  return { error: message, status: response.status };
}

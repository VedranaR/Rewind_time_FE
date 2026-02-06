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

export async function action({ request, params }) {
  const data = await request.formData();
  console.log(Object.fromEntries(data));
  const username = Object.fromEntries(data).username;
  const password = Object.fromEntries(data).password;
  const loginData = {
    username: username,
    password: password,
  };
  //console.log(loginData);
  const response = await fetch(
    "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/auth/register",
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
    return redirect("/login?registered=1");
  }
}

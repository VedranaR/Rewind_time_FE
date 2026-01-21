import UserProfileEditForm from "../components/UserProfileEdit";
import { redirect } from "react-router-dom";

function UserProfilePage() {
  return <UserProfileEditForm />;
}

export default UserProfilePage;

export async function action({ request, params }) {
  const data = await request.formData();
  //console.log(Object.fromEntries(data));
  const cardNumber = Object.fromEntries(data).cardNumber;
  const cardExpirationDate = Object.fromEntries(data).cardExpirationDate;
  const cardHolderName = Object.fromEntries(data).cardHolderName;
  const streetWithNumber = Object.fromEntries(data).streetWithNumber;
  const city = Object.fromEntries(data).city;
  const postalCode = Object.fromEntries(data).postalCode;

  const creditCardData = {
    cardNumber: cardNumber,
    cardExpirationDate: cardExpirationDate,
    cardHolderName: cardHolderName,
    streetWithNumber: streetWithNumber,
    city: city,
    postalCode: postalCode,
  };

  let token = localStorage.getItem("jwt");
  token = token.slice(1, -1);
  //console.log(loginData);
  try {
    const response = await fetch(
      "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/membership",
      {
        method: "PUT",
        headers: {
          accept: "*/*",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(creditCardData),
      },
    );

    const status = response.status;
    console.log(status);
    //return redirect("/movies");
    return redirect("/movies", { state: { membershipSuccess: true } });
  } catch {
    return redirect("/movies");
  }

  /*if (status === 200) {
    const text = await response.text();
    //console.log(JSON.parse(text).jwt);
    return JSON.parse(text);
    /*const token = JSON.parse(text).jwt;
    console.log(token);
    const authority = JSON.parse(text).authorities[0];
    console.log(authority);
    localStorage.setItem("jwt", token);
    localStorage.setItem("authority", authority);
  }*/
  /*return redirect("/movies");*/
}

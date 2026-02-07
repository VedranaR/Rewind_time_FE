import UserProfileEditForm from "../components/UserProfileEdit";
import { redirect } from "react-router-dom";

function UserProfilePage() {
  return <UserProfileEditForm />;
}

export default UserProfilePage;

export async function action({ request, params }) {
  const data = await request.formData();

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

    return redirect("/movies", { state: { membershipSuccess: true } });
  } catch {
    return redirect("/movies");
  }
}

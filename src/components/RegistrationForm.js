import { Form, useNavigate, useActionData } from "react-router-dom";
import classes from "./RegistrationForm.module.css";

function RegistrationForm({ method }) {
  const navigate = useNavigate();
  const actionData = useActionData();

  function cancelHandler() {
    navigate("..");
  }

  return (
    <Form method="post" className={classes.form}>
      {actionData?.error && (
        <p className={classes.error}>
          {actionData.error === "User already exists!"
            ? "Registration not successful. Username already exists — please choose a different username and try again."
            : actionData.error}
        </p>
      )}

      <p>
        <label htmlFor="name">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          required
          placeholder="Your chosen username"
        />
      </p>

      <p>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          placeholder="Your Chosen Password"
        />
      </p>

      <div className={classes.actions}>
        <button type="button" onClick={cancelHandler}>
          Cancel
        </button>
        <button>Save</button>
      </div>
    </Form>
  );
}

export default RegistrationForm;

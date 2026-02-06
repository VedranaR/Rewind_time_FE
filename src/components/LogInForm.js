import { Form, useNavigate } from "react-router-dom";

import classes from "./LogInForm.module.css";

function LogInForm({ method, registrationSuccess }) {
  const navigate = useNavigate();
  function cancelHandler() {
    navigate("..");
  }
  return (
    <Form method="post" className={classes.form}>
      {registrationSuccess && (
        <p className={classes.success}>
          Registration successful! Please log in.
        </p>
      )}
      <p>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          name="username"
          required
          placeholder="user name"
        />
      </p>
      <p>
        <label htmlFor="password">Your Password</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          placeholder="Password"
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

export default LogInForm;

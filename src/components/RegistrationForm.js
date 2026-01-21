import { Form, useNavigate } from "react-router-dom";

import classes from "./RegistrationForm.module.css";

function RegistrationForm({ method }) {
  const navigate = useNavigate();
  function cancelHandler() {
    navigate("..");
  }
  return (
    <Form method="post" className={classes.form}>
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
        <label htmlFor="actors">Email address</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          placeholder="Email"
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

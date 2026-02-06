import React from "react";
import classes from "./UsersList.module.css";

export default function UsersList({ users, onBan, onUnban }) {
  return (
    <table className={classes.userTable}>
      <thead>
        <tr>
          <th>User</th>
          <th>Roles</th>
          <th className={classes.center}>Orders</th>
          <th className={classes.center}>Active?</th>
          <th className={classes.center}>Reviews</th>
          <th className={classes.center}>Member?</th>
          <th className={classes.center}>Banned?</th>
          <th className={classes.center}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const roles = u.authorities.split(",").map((r) => r.trim());
          return (
            <tr key={u.id}>
              <td data-label="User">{u.username}</td>
              <td data-label="Roles">{roles.join(", ")}</td>
              <td data-label="Orders" className={classes.center}>
                {u.ordersCount}
              </td>
              <td data-label="Active?" className={classes.center}>
                {u.hasActiveOrder ? "Yes" : "No"}
              </td>
              <td data-label="Reviews" className={classes.center}>
                {u.reviewsCount}
              </td>
              <td data-label="Member?" className={classes.center}>
                {u.member ? "Yes" : "No"}
              </td>
              <td data-label="Banned?" className={classes.center}>
                {u.banned ? "🔒" : "—"}
              </td>
              <td data-label="Actions" className={classes.center}>
                {!u.banned ? (
                  <button onClick={() => onBan(u.id)}>Ban</button>
                ) : (
                  <button onClick={() => onUnban(u.id)}>Unban</button>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

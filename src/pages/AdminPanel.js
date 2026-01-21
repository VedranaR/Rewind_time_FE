import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import UsersList from "../components/UsersList";

export default function AdminUsersPage() {
  const { jwt } = useAuth();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(
          "https://tim11-ntpws-0aafd8e5d462.herokuapp.com/admin/users",
          {
            headers: { Authorization: `Bearer ${jwt}` },
          },
        );
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err);
        setError("Could not load users");
      } finally {
        setLoading(false);
      }
    }
    if (jwt) fetchUsers();
  }, [jwt]);

  async function handleBan(userId) {
    if (!window.confirm("Ban this user?")) return;
    try {
      const res = await fetch(
        `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/admin/ban/id/${userId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        },
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
      }
      setUsers((list) =>
        list.map((u) => (u.id === userId ? { ...u, banned: true } : u)),
      );
    } catch (err) {
      console.error("Ban failed:", err);
      alert("Failed to ban user: " + err.message);
    }
  }

  async function handleUnban(userId) {
    if (!window.confirm("Unban this user?")) return;
    try {
      const res = await fetch(
        `https://tim11-ntpws-0aafd8e5d462.herokuapp.com/admin/unban/id/${userId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${jwt}` },
        },
      );
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`${res.status}: ${body}`);
      }
      setUsers((list) =>
        list.map((u) => (u.id === userId ? { ...u, banned: false } : u)),
      );
    } catch (err) {
      console.error("Unban failed:", err);
      alert("Failed to unban user: " + err.message);
    }
  }

  if (isLoading) return <p>Loading users…</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return <UsersList users={users} onBan={handleBan} onUnban={handleUnban} />;
}

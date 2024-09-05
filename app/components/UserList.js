import { useState, useEffect } from "react";
import Link from "next/link";

export default function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users");
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">사용자 목록</h2>
        </div>
        <ul className="space-y-4">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/users/${user.id}`}
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-md transition duration-150 ease-in-out"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-4">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700">
                      {user.username}
                    </h3>
                    <p className="text-sm text-gray-600">Why: {user.why}</p>
                    <p className="text-sm text-gray-600">
                      Medium: {user.medium}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

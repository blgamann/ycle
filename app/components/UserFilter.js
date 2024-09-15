import { Button } from "@/components/ui/button";

export function UserFilter({ users, selectedUser, setSelectedUser }) {
  return (
    <div className="border-t border-b border-gray-200 py-4">
      <div className="flex items-center justify-center space-x-4 overflow-x-auto">
        <Button
          variant={selectedUser === "전체" ? "default" : "outline"}
          onClick={() => setSelectedUser("전체")}
          className="whitespace-nowrap"
        >
          전체
        </Button>
        {users.map((user, index) => (
          <Button
            key={index}
            variant={selectedUser === user.username ? "default" : "outline"}
            onClick={() => setSelectedUser(user.username)}
            className="whitespace-nowrap"
          >
            {user.username}
          </Button>
        ))}
      </div>
    </div>
  );
}

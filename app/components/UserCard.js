import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "./UserAvatar";

export function UserCard({ user }) {
  return (
    <Card className="bg-white border-2 border-primary shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          <div className="bg-gray-100 rounded-full p-1">
            <UserAvatar username={user.username} size={80} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-primary">
              {user.username}
            </h2>
            <p className="text-lg mb-4 text-gray-600">
              {user.why || "Why가 설정되지 않았습니다."}
            </p>
            <div className="flex items-center">
              <span className="font-semibold mr-2 text-gray-700">Medium:</span>
              <div className="flex flex-wrap gap-2">
                {user.medium?.map((med, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {med}
                  </span>
                )) || "설정되지 않음"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

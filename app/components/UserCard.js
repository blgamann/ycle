import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "./UserAvatar";
import { Button } from "@/components/ui/button";
import { AddMediumDialog } from "./AddMediumDialog";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

export function UserCard({ user: pageUser, onAddMedium }) {
  if (!pageUser) return null;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isLoggedIn, user } = useAuth();

  return (
    <Card className="bg-white border-2 border-primary shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center space-x-6">
          <div className="bg-gray-100 rounded-full p-1">
            <UserAvatar username={pageUser.username} size={80} />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 text-primary">
              {pageUser.username}
            </h2>
            <p className="text-lg mb-4 text-gray-600">
              {pageUser.why || "Why가 설정되지 않았습니다."}
            </p>
            <div className="flex items-center mb-2">
              <span className="font-semibold mr-2 text-gray-700">Medium:</span>
              <div className="flex flex-wrap gap-2">
                {pageUser.mediums?.map((med, index) => (
                  <span
                    key={index}
                    className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {med}
                  </span>
                )) || "설정되지 않음"}
              </div>
            </div>
            {/* {isLoggedIn && user.username === pageUser.username && (
              <Button
                onClick={() => setIsDialogOpen(true)}
                variant="outline"
                size="sm"
              >
                Medium 추가
              </Button>
            )} */}
          </div>
        </div>
      </CardContent>
      <AddMediumDialog
        user={pageUser}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddMedium={onAddMedium}
      />
    </Card>
  );
}

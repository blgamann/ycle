import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function WhyInput({ user, handleWhySubmit }) {
  const [isEditingWhy, setIsEditingWhy] = useState(false);
  const [newWhy, setNewWhy] = useState("");

  const onSubmit = () => {
    if (!newWhy.trim()) return;
    handleWhySubmit(newWhy);
    setIsEditingWhy(false);
    setNewWhy("");
  };

  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
      {user.why ? (
        <p className="text-lg text-gray-700 font-bold">{user.why}</p>
      ) : isEditingWhy ? (
        // <form onSubmit={onSubmit} className="flex flex-col space-y-2">
        <div>
          <Input
            className="text-lg text-gray-700 mb-5"
            type="text"
            value={newWhy}
            onChange={(e) => setNewWhy(e.target.value)}
            placeholder="당신의 Why를 입력해주세요."
            required
          />
          <div className="flex space-x-2">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700"
              onClick={() => onSubmit()}
            >
              저장
            </Button>
            <Button
              type="button"
              onClick={() => setIsEditingWhy(false)}
              variant="outline"
            >
              취소
            </Button>
          </div>
        </div>
      ) : (
        // </form>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            onClick={() => setIsEditingWhy(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Why 입력하기
          </Button>
        </div>
      )}
    </div>
  );
}

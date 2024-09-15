import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RecordDialog({ user, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("");

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setSelectedMedium("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      reflection,
      medium: selectedMedium === "없음" ? null : selectedMedium,
    });
    resetForm();
  };

  const resetForm = () => {
    setReflection("");
    setSelectedMedium("");
    setIsOpen(false);
  };

  return (
    <div className="flex-grow bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200">
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="w-full flex items-center space-x-3 p-4 cursor-pointer">
            <span className="text-3xl" role="img" aria-label="pencil">
              ✏️
            </span>
            <span className="text-lg text-gray-700">
              오늘은 어떤 배움이 있으셨나요?
            </span>
          </button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">기록하기</DialogTitle>
          </DialogHeader>
          <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-lg text-gray-700">
              {user.why || "아직 'Why'를 설정하지 않았습니다."}
            </p>
          </div>
          <RecordForm
            reflection={reflection}
            setReflection={setReflection}
            selectedMedium={selectedMedium}
            setSelectedMedium={setSelectedMedium}
            handleSubmit={handleSubmit}
            mediums={user.medium}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

const RecordForm = ({
  reflection,
  setReflection,
  selectedMedium,
  setSelectedMedium,
  handleSubmit,
  mediums,
}) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    <Select onValueChange={setSelectedMedium} value={selectedMedium}>
      <SelectTrigger className="text-base">
        <SelectValue placeholder="미디엄 선택 (선택사항)" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="없음" className="text-base">
          없음
        </SelectItem>
        {mediums &&
          mediums.map((med, index) => (
            <SelectItem key={index} value={med} className="text-base">
              {med}
            </SelectItem>
          ))}
      </SelectContent>
    </Select>
    <Textarea
      placeholder="오늘의 배움을 적어주세요..."
      value={reflection}
      onChange={(e) => setReflection(e.target.value)}
      className="min-h-[150px] w-full text-base"
    />
    <div className="flex justify-end">
      <Button type="submit" className="text-base">
        공유
      </Button>
    </div>
  </form>
);

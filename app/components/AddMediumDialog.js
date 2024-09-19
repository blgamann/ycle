import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function AddMediumDialog({ user, isOpen, onClose, onAddMedium }) {
  const [newMedium, setNewMedium] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newMedium.trim()) {
      onAddMedium(user, newMedium.trim());
      setNewMedium("");
      onClose();
    }

    alert(`${newMedium} 추가되었습니다.`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>새로운 Medium 추가</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={newMedium}
            onChange={(e) => setNewMedium(e.target.value)}
            placeholder="새로운 Medium을 입력하세요"
          />
          <Button type="submit">추가</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";

export function EventDialog({ user, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [cycleDescription, setCycleDescription] = useState("");
  const [newCycleMedium, setNewCycleMedium] = useState("");
  const [newCycleDate, setNewCycleDate] = useState(new Date());
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [newCycleLocation, setNewCycleLocation] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can add validation logic
    onSubmit({
      event_description: cycleDescription,
      medium: newCycleMedium === "없음" ? null : newCycleMedium,
      event_date: newCycleDate,
      event_start_time: startTime,
      event_end_time: endTime,
      event_location: newCycleLocation,
    });
    setIsOpen(false);
    // Reset form
    setCycleDescription("");
    setNewCycleMedium("");
    setNewCycleDate(new Date());
    setStartTime("09:00");
    setEndTime("17:00");
    setNewCycleLocation("");
    setErrors({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="ml-4 bg-primary text-white hover:bg-primary/90 rounded-full w-16 h-16 flex items-center justify-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-10 h-10"
          >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span className="sr-only">새 사이클 계획</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[450px] h-[90vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            사이클 일정 생성
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.submit && (
            <p className="text-red-500 text-sm">{errors.submit}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="cycleDescription">설명</Label>
            <Textarea
              id="cycleDescription"
              value={cycleDescription}
              onChange={(e) => setCycleDescription(e.target.value)}
              placeholder="무엇을 하시나요?"
              className="min-h-[100px]"
            />
            {errors.cycleDescription && (
              <p className="text-red-500 text-sm">{errors.cycleDescription}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycleMedium">미디엄 선택</Label>
            <Select onValueChange={setNewCycleMedium} value={newCycleMedium}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="미디엄 선택" />
              </SelectTrigger>
              <SelectContent>
                {user.medium &&
                  user.medium.map((med, index) => (
                    <SelectItem key={index} value={med}>
                      {med}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            {errors.newCycleMedium && (
              <p className="text-red-500 text-sm">{errors.newCycleMedium}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>일자</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={newCycleDate}
                onSelect={setNewCycleDate}
                className="rounded-md border mx-auto w-full max-w-[300px]"
              />
            </div>
            {errors.newCycleDate && (
              <p className="text-red-500 text-sm">{errors.newCycleDate}</p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:space-x-4">
              <div className="flex-1 space-y-2 mb-2 sm:mb-0">
                <Label htmlFor="startTime">시작 시간</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                {errors.startTime && (
                  <p className="text-red-500 text-sm">{errors.startTime}</p>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="endTime">종료 시간</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
                {errors.endTime && (
                  <p className="text-red-500 text-sm">{errors.endTime}</p>
                )}
              </div>
            </div>
            {errors.time && (
              <p className="text-red-500 text-sm">{errors.time}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cycleLocation">장소</Label>
            <Input
              id="cycleLocation"
              value={newCycleLocation}
              onChange={(e) => setNewCycleLocation(e.target.value)}
              placeholder="장소를 입력하세요"
            />
            {errors.newCycleLocation && (
              <p className="text-red-500 text-sm">{errors.newCycleLocation}</p>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="text-base">
              만들기
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

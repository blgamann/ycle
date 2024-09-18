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
import { FiCalendar } from "react-icons/fi";

const FormGroup = ({ label, htmlFor, error, children, className }) => (
  <div className={`space-y-2 ${className}`}>
    {label && <Label htmlFor={htmlFor}>{label}</Label>}
    {children}
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

const TimeInput = ({ id, label, value, onChange, error, className }) => (
  <FormGroup label={label} htmlFor={id} error={error} className={className}>
    <Input
      id={id}
      type="time"
      value={value}
      onChange={onChange}
      aria-invalid={!!error}
      aria-describedby={error ? `${id}-error` : undefined}
    />
  </FormGroup>
);

const EventForm = ({ formState, handleChange, handleSubmit, errors, user }) => (
  <form onSubmit={handleSubmit} className="space-y-4">
    {errors.submit && (
      <p className="text-red-500 text-sm" role="alert">
        {errors.submit}
      </p>
    )}

    <FormGroup
      label="설명"
      htmlFor="cycleDescription"
      error={errors.cycleDescription}
    >
      <Textarea
        id="cycleDescription"
        value={formState.cycleDescription}
        onChange={(e) => handleChange("cycleDescription", e.target.value)}
        placeholder="무엇을 하시나요?"
        className="min-h-[100px]"
        aria-invalid={!!errors.cycleDescription}
        aria-describedby={
          errors.cycleDescription ? "cycleDescription-error" : undefined
        }
      />
    </FormGroup>

    <FormGroup
      label="미디엄 선택"
      htmlFor="newCycleMedium"
      error={errors.newCycleMedium}
    >
      <Select
        onValueChange={(value) => handleChange("newCycleMedium", value)}
        value={formState.newCycleMedium}
      >
        <SelectTrigger className="w-full" aria-label="미디엄 선택">
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
    </FormGroup>

    <FormGroup label="일자" htmlFor="newCycleDate" error={errors.newCycleDate}>
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={formState.newCycleDate}
          onSelect={(date) => handleChange("newCycleDate", date)}
          className="rounded-md border mx-auto w-full max-w-[300px]"
          aria-label="일자 선택"
        />
      </div>
    </FormGroup>

    <div className="flex flex-col sm:flex-row sm:space-x-4">
      <TimeInput
        id="startTime"
        label="시작 시간"
        value={formState.startTime}
        onChange={(e) => handleChange("startTime", e.target.value)}
        error={errors.startTime}
        className="w-full"
      />
      <TimeInput
        id="endTime"
        label="종료 시간"
        value={formState.endTime}
        onChange={(e) => handleChange("endTime", e.target.value)}
        error={errors.endTime}
        className="w-full"
      />
    </div>

    <FormGroup
      label="장소"
      htmlFor="newCycleLocation"
      error={errors.newCycleLocation}
    >
      <Input
        id="newCycleLocation"
        value={formState.newCycleLocation}
        onChange={(e) => handleChange("newCycleLocation", e.target.value)}
        placeholder="장소를 입력하세요"
        aria-invalid={!!errors.newCycleLocation}
        aria-describedby={
          errors.newCycleLocation ? "newCycleLocation-error" : undefined
        }
      />
    </FormGroup>

    <div className="flex justify-end pt-4">
      <Button type="submit" className="text-base">
        만들기
      </Button>
    </div>
  </form>
);

export function EventDialog({ user, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formState, setFormState] = useState({
    cycleDescription: "",
    newCycleMedium: "",
    newCycleDate: new Date(),
    startTime: "09:00",
    endTime: "17:00",
    newCycleLocation: "",
  });
  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setFormState({
      cycleDescription: "",
      newCycleMedium: "",
      newCycleDate: new Date(),
      startTime: "09:00",
      endTime: "17:00",
      newCycleLocation: "",
    });
    setErrors({});
  };

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      resetForm();
    }
  };

  const handleChange = (key, value) => {
    setFormState((prevState) => ({
      ...prevState,
      [key]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formState.cycleDescription.trim()) {
      newErrors.cycleDescription = "설명을 입력하세요.";
    }
    if (!formState.newCycleMedium.trim()) {
      newErrors.newCycleMedium = "미디엄을 선택하세요.";
    }
    if (!formState.newCycleDate) {
      newErrors.newCycleDate = "일자를 선택하세요.";
    }
    if (!formState.startTime) {
      newErrors.startTime = "시작 시간을 입력하세요.";
    }
    if (!formState.endTime) {
      newErrors.endTime = "종료 시간을 입력하세요.";
    }
    if (
      formState.startTime &&
      formState.endTime &&
      formState.endTime <= formState.startTime
    ) {
      newErrors.endTime = "종료 시간은 시작 시간보다 늦어야 합니다.";
    }
    if (!formState.newCycleLocation.trim()) {
      newErrors.newCycleLocation = "장소를 입력하세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      event_description: formState.cycleDescription,
      medium:
        formState.newCycleMedium === "없음" ? null : formState.newCycleMedium,
      event_date: formState.newCycleDate,
      event_start_time: formState.startTime,
      event_end_time: formState.endTime,
      event_location: formState.newCycleLocation,
    });

    resetForm();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="cursor-pointer flex items-center justify-center"
        >
          <FiCalendar className="w-5 h-5" />
        </button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-[450px] h-[90vh] sm:h-auto overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            사이클 일정 생성
          </DialogTitle>
        </DialogHeader>
        <EventForm
          formState={formState}
          handleChange={handleChange}
          handleSubmit={handleSubmitForm}
          errors={errors}
          user={user}
        />
      </DialogContent>
    </Dialog>
  );
}

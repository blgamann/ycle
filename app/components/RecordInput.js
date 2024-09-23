import React, { useState, useEffect, useRef } from "react";
import { uploadImage } from "../lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FiImage, FiX } from "react-icons/fi";
import { EventDialog } from "./EventDialog";
import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { formatFullDate } from "../utils/date";

export function RecordInput({ user, onSubmit }) {
  const [reflection, setReflection] = useState("");
  const [selectedMedium, setSelectedMedium] = useState(""); // Changed to empty string
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [eventData, setEventData] = useState(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    adjustTextareaHeight();
  }, [reflection]);

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const resetForm = () => {
    setReflection("");
    setSelectedMedium("");
    setImage(null);
    setEventData(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reflection.trim()) return; // Prevent empty submissions

    setIsUploading(true);
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }

      // 디버깅을 위해 로그 추가
      console.log("RecordInput: handleSubmit 호출");

      await onSubmit({
        reflection,
        medium: selectedMedium === "없음" ? null : selectedMedium,
        imgUrl: imageUrl,
        event: eventData,
      });
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      // Optionally, display an error message to the user
    } finally {
      setIsUploading(false);
    }
  };

  const handleEventSubmit = (event) => {
    // 변경된 부분
    console.log("RecordInput: handleEventSubmit 호출");
    setEventData(event);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleImageRemove = () => {
    setImage(null);
  };

  const handleRemoveEvent = () => {
    setEventData(null);
  };

  const EventContent = ({ event, onRemove }) => (
    <div className="bg-gray-100 rounded-lg p-4 mt-4 relative">
      <button
        onClick={onRemove}
        className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
        type="button"
      >
        <FiX className="w-4 h-4 text-gray-600" />
      </button>
      <h4 className="text-xl font-bold mb-2">{event.event_description}</h4>
      <div className="flex items-center mb-1">
        <CalendarIcon className="w-5 h-5 mr-2" />
        <span>{formatFullDate(event.event_date)}</span>
      </div>
      <div className="flex items-center mb-1">
        <ClockIcon className="w-5 h-5 mr-2" />
        <span>
          {event.event_start_time || "N/A"} - {event.event_end_time || "N/A"}
        </span>
      </div>
      {event.event_location && (
        <div className="flex items-center">
          <MapPinIcon className="w-5 h-5 mr-2" />
          <span>{event.event_location}</span>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-grow bg-white rounded-lg shadow p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {eventData && (
          <EventContent event={eventData} onRemove={handleRemoveEvent} />
        )}

        <Textarea
          ref={textareaRef}
          placeholder={`오늘은 어떤 배움이 있으셨나요? (${user.why})`}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="w-full text-base resize-none overflow-hidden"
          rows={4}
        />

        {image && (
          <div className="mt-2 relative inline-block">
            <img
              src={URL.createObjectURL(image)}
              alt="Selected"
              className="max-w-full h-auto rounded-md max-h-40"
            />
            <button
              type="button" // button 타입으로 변경
              onClick={handleImageRemove}
              className="absolute top-1 right-1 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <FiX className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        )}

        <div className="flex justify-between items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Select
              onValueChange={setSelectedMedium}
              value={selectedMedium}
              className="text-base"
            >
              <SelectTrigger className="text-base w-48">
                <SelectValue placeholder="미디엄 선택 (선택사항)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="없음">없음</SelectItem>
                {user.medium?.map((med, index) => (
                  <SelectItem key={index} value={med}>
                    {med}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <label htmlFor="image-upload" className="cursor-pointer p-2">
              <FiImage className="w-5 h-5" />
            </label>

            <EventDialog user={user} onEventSubmit={handleEventSubmit} />

            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <Button
            type="submit"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isUploading || !reflection.trim()}
          >
            {isUploading ? "업로드 중..." : "공유하기"}
          </Button>
        </div>
      </form>
    </div>
  );
}

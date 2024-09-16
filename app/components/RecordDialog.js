import React, { useState } from "react";
import { uploadImage, deleteImage } from "../lib/supabase";
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
import { Input } from "@/components/ui/input";
import { FiImage, FiX } from "react-icons/fi"; // FiX 아이콘 추가

export function RecordDialog({ user, onSubmit }) {
  const [isOpen, setIsOpen] = useState(false);
  const [reflection, setReflection] = useState("");
  const [selectedMedium, setSelectedMedium] = useState("");
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleOpenChange = (open) => {
    setIsOpen(open);
    if (open) {
      setSelectedMedium("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image);
      }
      await onSubmit({
        reflection,
        medium: selectedMedium === "없음" ? null : selectedMedium,
        imgUrl: imageUrl,
      });
      resetForm();
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setReflection("");
    setSelectedMedium("");
    setImage(null);
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
            <DialogTitle className="text-2xl font-bold">기록하기</DialogTitle>
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
            image={image}
            setImage={setImage}
            isUploading={isUploading}
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
  image,
  setImage,
  isUploading,
}) => {
  const handleImageDelete = async () => {
    if (image && image.publicUrl) {
      try {
        await deleteImage(image.publicUrl);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
    setImage(null);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Select onValueChange={setSelectedMedium} value={selectedMedium}>
        <SelectTrigger className="w-full text-base">
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
        className="min-h-[150px] w-full text-base resize-none"
      />
      <div className="space-y-2">
        <p className="block text-sm font-medium text-gray-700">
          이미지 추가 (선택사항)
        </p>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="image-upload"
            className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiImage className="w-5 h-5 mr-2" />
            사진 선택
          </label>
          <Input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="hidden"
          />
        </div>
      </div>
      {image && (
        <div className="mt-2 relative">
          <img
            src={URL.createObjectURL(image)}
            alt="Selected"
            className="max-w-full h-auto rounded-md"
          />
          <button
            type="button"
            onClick={handleImageDelete}
            className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiX className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      )}
      <div className="flex justify-end">
        <Button
          type="submit"
          className="text-base bg-blue-600 hover:bg-blue-700 text-white"
          disabled={isUploading}
        >
          {isUploading ? "업로드 중..." : "공유하기"}
        </Button>
      </div>
    </form>
  );
};

import { useState, useEffect } from "react";

export default function AddCycleModal({ isOpen, onClose, onSubmit }) {
  const [date, setDate] = useState("");
  const [activity, setActivity] = useState("");
  const [participants, setParticipants] = useState([]);
  const [newParticipant, setNewParticipant] = useState("");

  // 모달이 열릴 때마다 데이터 초기화
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setDate("");
    setActivity("");
    setParticipants([]);
    setNewParticipant("");
  };

  const addParticipant = () => {
    if (newParticipant.trim() !== "") {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant("");
    }
  };

  const removeParticipant = (index) => {
    setParticipants(participants.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSubmit({ date, activity, participants: participants.join(", ") });
    onClose();
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Medium 데이터 입력</h1>

        <div className="mb-4">
          <label className="block mb-2 font-bold">참여자:</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={newParticipant}
              onChange={(e) => setNewParticipant(e.target.value)}
              className="flex-grow p-2 border rounded-l"
              placeholder="참여자 이름"
            />
            <button
              onClick={addParticipant}
              className="px-4 py-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              추가
            </button>
          </div>
          <ul className="list-disc pl-5">
            {participants.map((participant, index) => (
              <li
                key={index}
                className="flex justify-between items-center mb-1"
              >
                {participant}
                <button
                  onClick={() => removeParticipant(index)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold" htmlFor="date">
            날짜:
          </label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-bold" htmlFor="activity">
            활동 소개:
          </label>
          <textarea
            id="activity"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="py-2 px-4 bg-gray-300 text-black rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="py-2 px-4 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

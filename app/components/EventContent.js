import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { formatFullDate, formatTimeOfDay } from "../utils/date";

const slice = (time) => {
  return time.slice(0, 5);
};

export function EventContent({ cycle }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 mt-4 mb-4">
      <h4 className="text-xl font-bold mb-2">{cycle.eventDescription}</h4>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center mt-4">
          <CalendarIcon className="w-5 h-5 mr-2" />
          <span>{formatFullDate(cycle.eventDate)}</span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          <span>
            {slice(cycle.eventStartTime)} - {slice(cycle.eventEndTime)}
          </span>
        </div>
        {cycle.eventLocation && (
          <div className="flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2" />
            <span>{cycle.eventLocation}</span>
          </div>
        )}
      </div>
    </div>
  );
}

import { CalendarIcon, ClockIcon, MapPinIcon } from "lucide-react";
import { formatFullDate } from "../utils/date";

export function EventContent({ cycle }) {
  return (
    <div className="bg-gray-100 rounded-lg p-4 mt-4 mb-4">
      <h4 className="text-xl font-bold mb-2">{cycle.event_description}</h4>
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center mt-4">
          <CalendarIcon className="w-5 h-5 mr-2" />
          <span>{formatFullDate(cycle.event_date)}</span>
        </div>
        <div className="flex items-center">
          <ClockIcon className="w-5 h-5 mr-2" />
          <span>
            {cycle.event_start_time} - {cycle.event_end_time}
          </span>
        </div>
        {cycle.event_location && (
          <div className="flex items-center">
            <MapPinIcon className="w-5 h-5 mr-2" />
            <span>{cycle.event_location}</span>
          </div>
        )}
      </div>
    </div>
  );
}

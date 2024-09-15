import { CycleCard } from "./CycleCard";

export function CycleList({ cycles, currentUser, onDelete, onRecycle }) {
  return (
    <>
      {cycles.length > 0 ? (
        <>
          {cycles.map((cycle) => (
            <CycleCard
              key={cycle.id}
              cycle={cycle}
              currentUser={currentUser}
              onDelete={onDelete}
              onRecycle={onRecycle}
            />
          ))}
        </>
      ) : (
        <p>사이클이나 이벤트가 없습니다.</p>
      )}
    </>
  );
}

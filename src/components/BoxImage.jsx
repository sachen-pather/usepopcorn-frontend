import { useState } from "react";

export function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}
export function BoxImage({ children }) {
  return <div className="box">{children}</div>;
}

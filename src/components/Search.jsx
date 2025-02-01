// components/Search.jsx
import { memo, useRef } from "react";

function Search({ query, setQuery }) {
  const inputRef = useRef(null);

  return (
    <input
      ref={inputRef}
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => {
        const value = e.target.value;
        setQuery(value);
        // Keep focus on input after value changes
        inputRef.current?.focus();
      }}
      // Prevent default behaviors that might cause focus loss
      onBlur={(e) => {
        if (!e.relatedTarget) {
          inputRef.current?.focus();
        }
      }}
    />
  );
}

export default memo(Search);

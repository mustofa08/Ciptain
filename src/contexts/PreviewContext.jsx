// src/contexts/PreviewContext.jsx
import { createContext, useContext, useState } from "react";

const PreviewContext = createContext();

export const PreviewProvider = ({ children }) => {
  const [previewMode, setPreviewMode] = useState("none");
  // "none" | "public" | "user" | "mobile" | "desktop"

  return (
    <PreviewContext.Provider value={{ previewMode, setPreviewMode }}>
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = () => useContext(PreviewContext);

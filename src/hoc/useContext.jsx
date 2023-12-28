import React, { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const nameRevealedProvider = ({ children }) => {
  const [isNameRevealed, setIsNameRevealed] = useState(false);

  return (
    <AppContext.Provider value={{ isNameRevealed, setIsNameRevealed }}>
      {children}
    </AppContext.Provider>
  );
};

export const useNameRevealedContext = () => {
  return useContext(AppContext);
};

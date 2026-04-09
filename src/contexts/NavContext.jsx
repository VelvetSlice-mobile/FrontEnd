import React, { createContext, useState, useContext } from 'react';

const NavContext = createContext();

export function NavProvider({ children }) {
  const [showNav, setShowNav] = useState(true);
  return (
    <NavContext.Provider value={{ showNav, setShowNav }}>
      {children}
    </NavContext.Provider>
  );
}

export const useNav = () => useContext(NavContext);
import React, { createContext, useState, useContext, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

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

export function useNavVisibleOnFocus() {
  const { setShowNav } = useNav();

  useFocusEffect(
    useCallback(() => {
      setShowNav(true);
    }, [setShowNav]),
  );
}

export function useNavScrollBehavior() {
  const { setShowNav } = useNav();
  const lastOffset = useRef(0);

  useFocusEffect(
    useCallback(() => {
      lastOffset.current = 0;
      setShowNav(true);

      return () => {
        setShowNav(true);
      };
    }, [setShowNav]),
  );

  return useCallback(
    (event) => {
      const currentOffset = event.nativeEvent.contentOffset.y;
      const delta = currentOffset - lastOffset.current;

      if (currentOffset <= 10 || delta < 0) {
        setShowNav(true);
      } else if (delta > 0) {
        setShowNav(false);
      }

      lastOffset.current = currentOffset;
    },
    [setShowNav],
  );
}
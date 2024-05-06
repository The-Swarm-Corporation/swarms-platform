'use client';

import { useState, useEffect } from 'react';

export default function useToggle(init?: 'on' | 'off', storageKey?: string) {
  const [toggleState, setToggle] = useState(
    init || (storageKey ? localStorage.getItem(storageKey) || 'off' : 'off'),
  );

  useEffect(() => {
    if (storageKey) {
      const storedValue = localStorage.getItem(storageKey);
      if (storedValue !== null) {
        setToggle(storedValue);
      }
    }
  }, [storageKey]);

  function setOn() {
    setToggle('on');
    if (storageKey) {
      localStorage.setItem(storageKey, 'on');
    }
  }

  function setOff() {
    setToggle('off');
    if (storageKey) {
      localStorage.setItem(storageKey, 'off');
    }
  }

  function toggle() {
    if (toggleState === 'off') setOn();
    else setOff();
  }

  return {
    isOn: toggleState === 'on',
    isOff: toggleState === 'off',
    setOn,
    setOff,
    toggle,
  };
}

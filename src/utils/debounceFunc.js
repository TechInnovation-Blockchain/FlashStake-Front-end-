import { useEffect, useState } from "react";

export const debounce = (func, wait) => {
  let timeout;

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const useDebouncedValue = (value, wait) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const _timeout = setTimeout(() => {
      setDebouncedValue(value);
    }, wait);

    return () => {
      clearTimeout(_timeout);
    };
  }, [value, wait]);

  return debouncedValue;
};

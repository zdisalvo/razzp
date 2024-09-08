import { useEffect, useRef, useState } from "react";

const useIntersectionObserver = (callback, options) => {
  const observer = useRef(null);
  const [observedElements, setObservedElements] = useState([]);

  useEffect(() => {
    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
        }
      });
    }, options);

    observedElements.forEach((element) => {
      if (element) observer.current.observe(element);
    });

    return () => {
      if (observer.current) observer.current.disconnect();
    };
  }, [options]); // Removed 'callback' and 'observedElements' from the dependency array

  const addElementsToObserve = (elements) => {
    setObservedElements((prev) => [...prev, ...elements]);
  };

  return addElementsToObserve;
};

export default useIntersectionObserver;

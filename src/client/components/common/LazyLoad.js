"use client";
import { useState, useEffect, useRef } from "react";

function LazyLoadComponent({ onLoad, loader = <div>Loading...</div> }) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current; // Store the reference in a variable
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          onLoad(); // Trigger the loading of more content
          observer.disconnect();
        }
      },
      {
        rootMargin: "0px 0px 100px 0px", // Trigger loading before the element is fully in view
      }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      if (node) observer.unobserve(node);
    };
  }, [onLoad]);

  return <div ref={ref}>{isInView ? null : loader}</div>;
}

export default LazyLoadComponent;

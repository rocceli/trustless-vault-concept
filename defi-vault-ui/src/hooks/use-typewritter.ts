import { useState, useEffect } from "react";

interface Options {
  speed?: number;
  delayBetween?: number;
  loop?: boolean; 
}

export function useTypewriter(
  texts: string[],
  { speed = 100, delayBetween = 1500, loop = true }: Options = {}
) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [forward, setForward] = useState(true);
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    const currentText = texts[index];
    let timer: NodeJS.Timeout;

    if (forward) {
      if (subIndex < currentText.length) {
        timer = setTimeout(() => {
          setDisplayed(currentText.slice(0, subIndex + 1));
          setSubIndex(subIndex + 1);
        }, speed);
      } else {
        timer = setTimeout(() => setForward(false), delayBetween);
      }
    } else {
      if (subIndex > 0) {
        timer = setTimeout(() => {
          setDisplayed(currentText.slice(0, subIndex - 1));
          setSubIndex(subIndex - 1);
        }, speed / 2);
      } else {
        setForward(true);
        setIndex((prev) =>
          prev + 1 < texts.length ? prev + 1 : loop ? 0 : prev
        );
      }
    }

    return () => clearTimeout(timer);
  }, [texts, index, subIndex, forward, speed, delayBetween, loop]);

  return displayed;
}

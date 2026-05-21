import * as React from "react";
import {
  motion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useEffect, useState } from "react";

const fontSize = 50;
const padding = 15;
const height = fontSize + padding;

function NumberComponent({ mv, number }) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center font-semibold"
    >
      {number}
    </motion.span>
  );
}

function Digit({ place, value }) {
  let valueRoundedToPlace = Math.floor(value / place);
  let animatedValue = useSpring(valueRoundedToPlace, {
    stiffness: 80,
    damping: 15,
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {[...Array(10).keys()].map((i) => (
        <NumberComponent key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

export function Counter({ value, className = "" }) {
  const valueStr = Math.floor(value).toString();
  const digitsCount = valueStr.length;

  return (
    <div
      style={{ fontSize }}
      className={`flex items-center justify-center overflow-hidden leading-none select-none font-bold tracking-tight ${className}`}
    >
      {Array.from({ length: digitsCount }).map((_, idx) => {
        const place = Math.pow(10, digitsCount - 1 - idx);
        const showSeparator = idx > 0 && (digitsCount - idx) % 3 === 0;

        return (
          <React.Fragment key={idx}>
            {showSeparator && (
              <span className="opacity-80" style={{ marginRight: "0.05em", marginLeft: "0.05em" }}>
                '
              </span>
            )}
            <Digit place={place} value={value} />
          </React.Fragment>
        );
      })}
    </div>
  );
}

const FollowerMilestone = React.forwardRef(
  ({ targetCount, headerText, footerText, className = "", ...props }, ref) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        setCount(targetCount);
      }, 300);
      return () => clearTimeout(timer);
    }, [targetCount]);

    return (
      <div
        ref={ref}
        className={`flex flex-col items-center justify-center ${className}`}
        {...props}
      >
        <div className="flex flex-col items-center justify-center text-white">
          {headerText && (
            <motion.h3
              className="w-full text-center text-lg uppercase tracking-wider opacity-60 mb-2 font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {headerText}
            </motion.h3>
          )}
          <Counter value={count} className="text-white" />
          {footerText && (
            <motion.p
              className="w-full text-center text-[15px] font-normal tracking-wide text-white/90 mt-4"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {footerText}
            </motion.p>
          )}
        </div>
      </div>
    );
  }
);

FollowerMilestone.displayName = "FollowerMilestone";

export default FollowerMilestone;

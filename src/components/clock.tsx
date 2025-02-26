"use client";
import { useState } from "react";
import { useEffect } from "react";
import { SlidingNumber } from "./ui/sliding-number";

const LOCATION = "Phoenix, AZ";

function Clock() {
  const [hours, setHours] = useState(new Date().getHours());
  const [minutes, setMinutes] = useState(new Date().getMinutes());
  const [seconds, setSeconds] = useState(new Date().getSeconds());

  useEffect(() => {
    const interval = setInterval(() => {
      setHours(new Date().getHours());
      setMinutes(new Date().getMinutes());
      setSeconds(new Date().getSeconds());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-0.5 font-mono text-sm text-muted-foreground">
      <SlidingNumber value={hours} padStart={true} />
      <span className="text-muted-foreground">:</span>
      <SlidingNumber value={minutes} padStart={true} />
      <span className="text-muted-foreground">:</span>
      <SlidingNumber value={seconds} padStart={true} />
    </div>
  );
}

export default Clock;

import React, { useEffect, useState } from "react";

const CountDown = ({ data }) => {

  function calculateTimeLeft() {

    // safety check
    if (!data?.Finish_Date) return {};

    const difference = +new Date(data.Finish_Date) - +new Date();

    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timeComponents = Object.keys(timeLeft).map((interval) => {

    if (!timeLeft[interval]) return null;

    return (
      <span
        key={interval}
        className="text-[25px] text-[#475ad2]"
      >
        {timeLeft[interval]} {interval}{" "}
      </span>
    );
  });

  return (
    <div className="text-lg font-semibold text-gray-700">
      {timeComponents.length ? (
        timeComponents
      ) : (
        <span className="text-[red] text-[25px]">
          Time's up
        </span>
      )}
    </div>
  );
};

export default CountDown;
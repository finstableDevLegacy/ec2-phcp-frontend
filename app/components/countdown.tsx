import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { ClientOnly } from "remix-utils";

export const getTimestampDiff = (targetTimestamp: string) => {
  const target = +new Date(Number(targetTimestamp) * 1000);
  const diff = target - +new Date();
  let timeLeft = {
    timeDiff: diff,
    minute: 0,
    second: 0,
  };
  if (diff >= 0) {
    timeLeft = {
      timeDiff: diff,
      minute: Math.floor((diff / 1000 / 60) % 60),
      second: Math.floor((diff / 1000) % 60),
    };
  }
  return timeLeft;
};

export default function Countdown({
  message,
  deadline,
  isCountDownFinish,
  setIsCountDownFinish,
}: {
  message: string;
  deadline: string;
  isCountDownFinish: boolean;
  setIsCountDownFinish: Dispatch<SetStateAction<boolean>>;
}) {
  const [diff, setDiff] = useState<{
    minute: number;
    second: number;
  }>(() => {
    const { minute, second } = getTimestampDiff(deadline);
    return { minute, second };
  });

  useEffect(() => {
    let timer: NodeJS.Timer;
    if (!isCountDownFinish) {
      timer = setInterval(() => {
        const { timeDiff, minute, second } = getTimestampDiff(deadline);
        if (timeDiff > 0) {
          setDiff({ minute, second });
        } else {
          setDiff({ minute: 0, second: 0 });
          setIsCountDownFinish(true);
          clearInterval(timer);
        }
      }, 1000);
    }

    return () => clearInterval(timer);
  }, [deadline, isCountDownFinish]);

  const second = String(diff.second % 60).padStart(2, "0");
  const minute = String(diff.minute % 60).padStart(2, "0");
  return (
    <ClientOnly>
      {() => (
        <div className="text-center text-sm text-white">
          {message} {minute}:{second}
        </div>
      )}
    </ClientOnly>
  );
}

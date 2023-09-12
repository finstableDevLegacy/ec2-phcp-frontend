import { FC, memo, useEffect, useMemo } from "react";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/solid";

type IPagination = {
  currentPage: number;
  totalItems: number;
  itemPerPage: number;
  onPrev: (page: number) => void;
  onNext: (page: number) => void;
  onSelect: (page: number) => void;
  color?: string;
};

const Pagination: FC<IPagination> = ({
  currentPage = 1,
  totalItems = 0,
  itemPerPage = 10,
  onPrev,
  onNext,
  onSelect,
  color = "yellow",
}) => {
  const renderColor = useMemo(() => {
    switch (color) {
      case "blue":
        return "text-primary-light-blue";
      case "orange":
        return "text-orange-500";
      case "gray":
        return "text-gray-200";
      case "yellow":
        return "text-primary-yellow";
      default:
        return "text-primary-light-blue";
    }
  }, [color]);

  const numberOfPage = Array.from({
    length: Math.ceil(totalItems / itemPerPage),
  }).map((_, index) => index + 1);

  const handlePrev = () => {
    Boolean(currentPage - 1) && onPrev(currentPage - 1);
  };

  const handleNext = () => {
    Boolean(currentPage + 1 < Math.ceil(totalItems / itemPerPage) + 1) &&
      onNext(currentPage + 1);
  };

  return (
    <>
      {totalItems > 0 ? (
        <div className="flex items-center">
          <ChevronLeftIcon
            className={`w-8 cursor-pointer ${
              currentPage === 1
                ? "cursor-not-allowed fill-gray-400"
                : "fill-primary-yellow"
            }  ${renderColor}`}
            onClick={() => handlePrev()}
          />
          {numberOfPage.map((item, index) => {
            return (
              <button
                className={`mx-1 cursor-pointer text-lg hover:${renderColor} ${
                  currentPage === index + 1
                    ? `font-semibold ${renderColor}`
                    : "text-white"
                }`}
                key={index}
                onClick={() => onSelect(item)}
              >
                {item}
              </button>
            );
          })}
          <ChevronRightIcon
            className={`w-8 cursor-pointer ${
              numberOfPage.length === currentPage
                ? "cursor-not-allowed fill-gray-400"
                : "fill-primary-yellow"
            } ${renderColor}`}
            onClick={() => handleNext()}
          />
        </div>
      ) : null}
    </>
  );
};

export default memo(Pagination);

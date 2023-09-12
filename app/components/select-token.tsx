import { Fragment } from "react";
import { TokenType } from "~/type/token";
import LoadingIcon from "./loading-icon";

interface PropsType {
  list?: TokenType[];
  select?: TokenType | null;
  onSelect?: (token: TokenType) => void;
  loading?: boolean;
}

const SelectToken: React.FC<PropsType> = ({
  list,
  select,
  onSelect,
  loading,
}) => {
  const handleSelect = (token: TokenType) => {
    if (!onSelect) return;
    onSelect(token);
  };

  return (
    <div className="w-full ">
      <h1 className="mb-3 text-xl">Choose Token</h1>
      <div className="grid grid-cols-4 gap-1 md:gap-2">
        {loading && (
          <div className="col-span-4 flex h-24 items-center justify-center">
            <LoadingIcon />
          </div>
        )}
        {list?.map((token) => {
          return (
            <Fragment>
              {token?.isDisplayOrder && (
                <div
                  key={token?.id}
                  onClick={() => handleSelect(token)}
                  className="cursor-pointer select-none rounded border"
                >
                  <div
                    className={`flex flex-col items-center rounded p-4 ${
                      token.tokenAddress == select?.tokenAddress
                        ? "bg-sky-100 font-semibold"
                        : ""
                    }`}
                  >
                    <div className="mb-2">
                      <div className="xs:h-12 w-12 sm:h-14 md:w-14">
                        <img
                          src={token?.tokenLogoUri}
                          alt="token"
                          className="h-full w-full"
                        />
                      </div>
                    </div>
                    <label htmlFor="tokenAddress">{token?.tokenSymbol}</label>
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default SelectToken;

import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import Flickity from "react-flickity-component";

//icon
//changeimgname
import USDTIcon from "../../../public/assets/USDTi_icon.png";
import BUSDIcon from "../../../public/assets/BUSD_icon.png";
import WISDOMICon from "../../../public/assets/wisdom-token-logo.png";
import PhuketCoin from "../../../public/assets/PHC_icon.png";

export default function SlideBanner() {
  return (
    <div className="flex flex-row items-cente justify-center mb-2">
        <img
          src={USDTIcon}
          className="token-icon-hover m-4 h-10 w-10 object-contain md:w-16 lg:w-16 lg:h-16 xl:h-16"
        />
        <img
          src={PhuketCoin}
          className="token-icon-hover m-4 h-10 w-10 object-contain md:w-16 lg:w-16 lg:h-16 xl:h-16"
        />
        <img
          src={BUSDIcon}
          className="token-icon-hover m-4 h-10 w-106 object-contain md:w-16 lg:w-16 lg:h-16 xl:h-16"
        />
        <img
          src={WISDOMICon}
          className="token-icon-hover m-4 h-10 w-10 object-contain md:w-16 lg:w-16 lg:h-16 xl:h-16"
        />
    </div>
  );
}

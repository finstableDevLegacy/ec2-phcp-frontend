import Telegram from "../../../public/assets/Telegram.png";
import Telephone from "../../../public/assets/Telephone.png";
import Line from "../../../public/assets/Line.png";

export default function ContactUs() {
  return (
    <div className="mt-3 flex flex-col items-start md:mt-[4px]">
      {/* <div className="flex flex-row items-center">
        <img src={Line} className="h-4 w-full object-fill mr-2"></img>
        <span className="text-primary-yellow">@phcpay</span>
      </div> */}
      <div className="flex flex-row items-center">
        <img src={Telegram} className="w-50% mr-2 h-6 object-fill"></img>
        <a href="https://t.me/+HVlYdFd20ag0Y2I1">
          <span className="text-primary-yellow">phcpay telegram</span>
        </a>
      </div>
      {/* <div className="flex flex-row items-center">
        <img src={Telephone} className="h-4 w-full object-fill mr-2"></img>
        <span className="text-primary-yellow">0123456789</span>
      </div> */}
    </div>
  );
}

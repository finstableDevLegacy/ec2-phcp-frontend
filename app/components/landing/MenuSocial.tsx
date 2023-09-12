import Facebook from "../../../public/assets/Facebook.png";
import Twitter from "../../../public/assets/Twitter.png";
import Telegram from "../../../public/assets/Telegram.png";
import InstagramIcon from "../../../public/assets/instagram_icon.png";
import YouTube from "../../../public/assets/YouTube.png";

export default function MenuSocial() {
  return (
    <div className="mt-3 flex flex-row items-center gap-x-5 md:mt-[4px]">
      <a href="https://twitter.com/CoinPhc">
        <img src={Twitter} className="h-5 w-5 object-fill"></img>
      </a>
      <a href="https://www.facebook.com/CoinPHC">
        <img src={Facebook} className="h-5 w-5 object-fill"></img>
      </a>
      <a href="https://t.me/PHC_coin">
        <img src={Telegram} className="h-5 w-5 object-fill"></img>
      </a>
      <a href="https://instagram.com/phuket_holiday_coin">
        <img src={InstagramIcon} className="h-6 w-6 object-fill"></img>
      </a>
      <a href="https://www.youtube.com/watch?v=nmfYhrGOMns">
        <img src={YouTube} className="h-6 w-6 object-fill"></img>
      </a>
    </div>
  );
}

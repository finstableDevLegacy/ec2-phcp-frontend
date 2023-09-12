import ScanQRCard from "~/components/qrcode";

export let handle = {
  i18n: ["wallet"],
};

export default function ScanQR() {
  return (
    <div className="flex min-h-full w-full justify-center">
      <ScanQRCard />
    </div>
  );
}

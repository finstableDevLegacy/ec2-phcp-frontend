import { LogoutIcon } from "@heroicons/react/outline";
import { ManagerData } from "~/type/manager";
import { MemberDetail } from "~/type/member";
import { formatCapitalize } from "~/utils/format";

export default function UserNavBar({
  data,
  onLogout,
}: {
  data: MemberDetail | ManagerData;
  onLogout?: () => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <span className="text-primary-yellow">
        {formatCapitalize(data.firstName)}
      </span>
      <span className="text-primary-yellow">
        {formatCapitalize(data.lastName)}
      </span>
      <div>
        <button onClick={onLogout}>
          <LogoutIcon className="-mb-1 w-6 text-gray-400" />
        </button>
      </div>
    </div>
  );
}

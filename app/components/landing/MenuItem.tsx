import { useNavigate } from "@remix-run/react";
export default function MenuItem({
  title,
  icon,
  path = "/",
}: {
  title: string;
  icon: any;
  path?: string;
}) {
  const navigate = useNavigate();

  return (
    <div onClick={() => navigate(path)}>
      <div className="flex cursor-pointer flex-col items-center justify-center text-center">
        <div className="mb-1 flex h-[3rem] w-40 items-center justify-center rounded-md border border-primary-yellow bg-primary-yellow text-center md:h-[4rem] hover:border-primary-yellow hover:bg-transparent hover:text-primary-yellow lg:h-14">
          <p className="m-0 p-0 flex justify-center text-center text-lg font-medium sm:text-lg md:text-xl lg:text-xl">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}

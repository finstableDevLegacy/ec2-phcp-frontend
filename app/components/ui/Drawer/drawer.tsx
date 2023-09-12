import { useEffect, useRef, FC } from "react";
import {
  disableBodyScroll,
  enableBodyScroll,
  clearAllBodyScrollLocks,
} from "body-scroll-lock";

interface SidebarProps {
  children: any;
  onClose: () => void;
}

const Drawer: FC<SidebarProps> = ({ children, onClose }) => {
  const sidebarRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const contentRef = useRef() as React.MutableRefObject<HTMLDivElement>;

  const onKeyDownSidebar = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.code === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.focus();
    }

    const contentElement = contentRef.current;

    if (contentElement) {
      disableBodyScroll(contentElement, { reserveScrollBarGap: true });
    }

    return () => {
      if (contentElement) enableBodyScroll(contentElement);
      clearAllBodyScrollLocks();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 box-border h-full outline-none"
      ref={sidebarRef}
      onKeyDown={onKeyDownSidebar}
      tabIndex={1}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div
          className={`flex h-full flex-col overflow-y-auto overflow-x-hidden text-base shadow-xl`}
          onClick={() => { }}
        />
        <section className="sidebar absolute inset-y-0 right-0 flex max-w-full pl-10 outline-none">
          <div className="h-full w-screen">
            <div
              className={`absolute inset-0 bg-primary-black-gray`}
              ref={contentRef}
            >
              {children}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Drawer;

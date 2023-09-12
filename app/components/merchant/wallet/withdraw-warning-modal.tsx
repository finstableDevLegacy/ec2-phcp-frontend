import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationCircleIcon } from "@heroicons/react/solid";

type WithdrawWarningModalType = {
  isOpen: boolean;
  closeModal: () => void;
};

const WithdrawWarningModal = ({
  isOpen,
  closeModal,
}: WithdrawWarningModalType) => {
  return (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-primary-black-gray p-6 text-left align-middle text-white shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="flex justify-center text-lg font-medium leading-6 text-white"
                  ></Dialog.Title>
                  <div className="mt-4 flex w-full flex-col justify-center items-center space-y-3">
                    <ExclamationCircleIcon className="h-32 text-orange-400" />
                    <p className="md:text-md text-sm text-center">
                      <div>Unable to withdraw</div>
                      <div>Because your Balance is less than 1000 THB</div>
                    </p>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-lg   border border-transparent bg-yellow-400 px-4 py-2 text-sm font-medium
                                text-slate-900 hover:bg-primary-yellow focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500
                                focus-visible:ring-offset-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default WithdrawWarningModal;

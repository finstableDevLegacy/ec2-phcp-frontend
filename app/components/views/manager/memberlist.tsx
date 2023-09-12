import { useEffect, useState, Fragment, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Table, { ColumnsProps } from "~/components/ui/Table/table";
import Pagination from "~/components/ui/Pagination/pagination";
import {
  createMember,
  deleteMember,
  getMemberList,
} from "~/api/merchant/member.api";
import { useAccount, useBalance } from "wagmi";
import { IAddMemberForm, MemberResponseType } from "~/type/member";
import { Dialog, Transition } from "@headlessui/react";
import Swal from "sweetalert2";
import localService from "~/services/localstorage";
import STORAGE_KEYS from "~/constants/storage-key";
import { useManagerInfo } from "~/hooks/useManagerInfo";
import Loading from "~/components/loading";

type FetchOrderForm = {
  currentPage: number;
  itemPerPage: number;
};

const addMemberSchema = yup.object({
  firstName: yup.string().required("Please enter the firstname"),
  lastName: yup.string().required("Please enter the lastname"),
  email: yup.string().required("Please enter your email"),
  phoneNumber: yup.string().required("Please enter your phone number"),
});

export default function MemberListView() {
  const { t } = useTranslation("manager-member");
  const [{ data: accountData }] = useAccount();
  const [memberList, setMemberList] = useState<any>([]);
  const [limit, setLimit] = useState(10);
  const [meta, setMeta] = useState({
    currentPage: 1,
    totalItems: 0,
    itemPerPage: 10,
    walletAddress: "",
  });
  const managerWalletAddress = accountData?.address!;
  const { managerData } = useManagerInfo(accountData?.address!);
  const [managerId, setManagerId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isIdDelete, setIsIdDelete] = useState("");
  const [isStatusText, setIsStatusText] = useState("");
  const [isErrorPhoneNumber, setIsErrorPhoneNumber] = useState("");
  const [isErrorEmail, setIsErrorEmail] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IAddMemberForm>({
    resolver: yupResolver(addMemberSchema),
  });

  let [isOpenAddMember, setIsOpenAddMember] = useState(false);
  let [isOpenDeleteMember, setIsOpenDeleteMember] = useState(false);
  let completeButtonRef = useRef(null);

  const columnsList: ColumnsProps[] = [
    {
      title: "#",
      dataIndex: "no",
      key: "no",
      render: (no: string) => <div className="font-bold text-white">{no}</div>,
    },
    { title: t("name"), dataIndex: "name", key: "name" },
    { title: t("email"), dataIndex: "email", key: "email" },
    { title: t("phone_number"), dataIndex: "phoneNumber", key: "phoneNumber" },
    { title: t("added_date"), dataIndex: "createAt", key: "createAt" },
    {
      title: t("action"),
      dataIndex: "id",
      key: "id",
      render: (id: string) => modalDeleteMember(id),
    },
  ];

  useEffect(() => {
    if (managerWalletAddress) {
      setIsLoading(true);
      setMeta({ ...meta, walletAddress: managerWalletAddress });
      fetchMemberList({
        currentPage: 1,
        itemPerPage: 10,
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [managerWalletAddress]);

  const onHandleSubmit = async (form: IAddMemberForm) => {
    try {
      if (!isAdding) {
        setIsAdding(true);
        setIsErrorEmail("");
        setIsErrorPhoneNumber("");
        const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
        const response = await createMember(accessToken, {
          ...form,
          managerId: managerData?.id!,
          platformStore: "phc",
        });

        if (response.data) {
          Swal.fire({
            title: t("create_member_success"),
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          await fetchMemberList({ ...meta, currentPage: meta.currentPage });
        } else {
          Swal.fire({
            title: t("please_fill_info"),
            icon: t("warning"),
            showConfirmButton: true,
            confirmButtonColor: "#3b82f6",
          });
        }
        setIsAdding(false);
      }
      setIsOpenAddMember(false);
    } catch (e: any) {
      const errorPhoneNumber =
        e.response.data.message[0].includes("phoneNumber");
      const errorEmail = e.response.data.message[0].includes("email");
      const duplicatePhoneNumber = e.response.data.message.includes(
        "must be unique phone number"
      );
      const duplicateEmail = e.response.data.message.includes(
        "must be unique email"
      );
      if (
        e.response.data.message instanceof Array &&
        e.response.data.message.length > 1
      ) {
        setIsErrorEmail(e.response.data.message[0]);
        setIsErrorPhoneNumber("Invalid Phone number");
      }

      if (errorPhoneNumber) {
        setIsErrorPhoneNumber("Invalid Phone number");
      } else if (errorEmail) {
        setIsErrorEmail(e.response.data.message[0]);
      } else if (duplicatePhoneNumber) {
        setIsErrorPhoneNumber(e.response.data.message);
      } else if (duplicateEmail) {
        setIsErrorEmail(e.response.data.message);
      } else {
        Swal.fire({
          title: e.response.data.message,
          icon: "error",
          showConfirmButton: true,
          confirmButtonColor: "#3b82f6",
        });
      }
    } finally {
      setIsAdding(false);

      // setIsOpenAddMember(false);
    }
  };

  const confirmDeleteMember = async (id: string) => {
    if (!isDeleting) {
      setIsDeleting(true);
      const accessToken = localService.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const result = await deleteMember(accessToken, id);
      setIsLoading(true);
      setIsStatusText(result.statusText);
      setIsDeleting(false);
    }
    setIsOpenDeleteMember(false);
  };

  useEffect(() => {
    const deleteMemberList = async () => {
      await fetchMemberList({ ...meta, currentPage: meta.currentPage });
    };
    if (isStatusText === "OK") {
      deleteMemberList();
    }
    setIsLoading(false);
  }, [isDeleting && memberList]);

  const fetchMemberList = async ({
    currentPage,
    itemPerPage,
  }: FetchOrderForm) => {
    const data = await getMemberList({
      managerId: managerData?.id,
      page: currentPage,
      limit: itemPerPage,
    });
    const result = mappingMember(data.data.data);
    result.map((m) => {
      if (m.role === "manager") {
        setManagerId(m.id);
      }
    });
    setMemberList(result);
    setMeta({
      ...meta,
      currentPage: data.data.page,
      totalItems: data.data.total,
    });
  };

  const mappingMember = (memberList: MemberResponseType[]) => {
    return memberList.reverse().map((item, index) => {
      return {
        no: index + 1,
        id: item.id,
        name: item.firstName + " " + item.lastName,
        createAt: new Date(item.createdAt).toLocaleString(),
        email: item.email,
        role: item.role,
        phoneNumber: item.phoneNumber,
      };
    });
  };

  const handlePagination = (page: number) => {
    fetchMemberList({ ...meta, currentPage: page });
  };

  const handleShowEntries = (entries: number) => {
    setMeta({ ...meta, itemPerPage: entries });
    setLimit(entries);
    fetchMemberList({ ...meta, itemPerPage: entries });
  };

  const modalAddMember = () => {
    return (
      <>
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={() => setIsOpenAddMember(true)}
            className="rounded-full bg-primary-yellow px-4 py-2 text-sm font-medium text-white hover:bg-opacity-30 "
          >
            {t("add_member")}
          </button>
        </div>

        <Transition appear show={isOpenAddMember} as={Fragment}>
          <Dialog
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={() => setIsOpenAddMember(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="wallet-pay my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="my-4 text-center text-3xl font-bold text-primary-yellow">
                    {t("add_member")}
                  </div>
                  <div className="flex flex-col rounded-xl p-2 px-4">
                    {/* first name */}
                    <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 font-semibold text-white">
                        {t("first_name")}
                      </label>
                      <input
                        className="w-full rounded border-none bg-inherit px-3 text-sm text-black outline-none"
                        placeholder="Staff's first name"
                        {...register("firstName")}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.firstName && (
                        <div className="text-xs text-red-600">
                          {errors.firstName?.message}
                        </div>
                      )}
                    </div>
                    {/* last name */}
                    <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 font-semibold text-white">
                        {t("last_name")}
                      </label>
                      <input
                        className="w-full rounded border-none bg-inherit px-3 text-sm text-black outline-none"
                        placeholder="Staff's last name"
                        {...register("lastName")}
                      ></input>
                    </div>
                    <div className="h-4 w-full">
                      {errors.lastName && (
                        <div className="text-xs text-red-600">
                          {errors.lastName?.message}
                        </div>
                      )}
                    </div>
                    {/* email name */}
                    <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 font-semibold text-white">
                        {t("email")}
                      </label>
                      <input
                        className="w-full rounded border-none bg-inherit px-3 text-sm text-black outline-none"
                        placeholder="Staff's email"
                        {...register("email")}
                        onChange={() => {
                          setIsErrorEmail("");
                        }}
                      ></input>
                    </div>
                    {isErrorEmail && (
                      <div className="h-4 w-full">
                        <div className="text-xs text-red-600">
                          {isErrorEmail}
                        </div>
                      </div>
                    )}
                    <div className="h-4 w-full">
                      {errors.email && (
                        <div className="text-xs text-red-600">
                          {errors.email?.message}
                        </div>
                      )}
                    </div>
                    {/* first name */}
                    <div className="relative mt-8 inline-flex h-12 w-full items-center rounded border bg-[#f5f5f5]">
                      <label className="absolute left-0 -top-8 font-semibold text-white">
                        {t("phone_number")}
                      </label>
                      <input
                        className="w-full rounded border-none bg-inherit px-3 text-sm text-black outline-none"
                        placeholder="Staff's phone number"
                        {...register("phoneNumber")}
                        maxLength={10}
                        onChange={() => {
                          setIsErrorPhoneNumber("");
                        }}
                      ></input>
                    </div>
                    {isErrorPhoneNumber && (
                      <div className="h-4 w-full">
                        <div className="text-xs text-red-600">
                          {isErrorPhoneNumber}
                        </div>
                      </div>
                    )}
                    <div className="h-4 w-full">
                      {errors.phoneNumber && (
                        <div className="text-xs text-red-600">
                          {errors.phoneNumber?.message}
                        </div>
                      )}
                    </div>
                    {/* submit */}
                  </div>
                  <button
                    className="my-2 flex w-full items-center justify-center rounded-lg bg-primary-yellow py-2 text-white"
                    onClick={handleSubmit(onHandleSubmit)}
                  >
                    {isAdding ? <Loading /> : t("submit")}
                  </button>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </>
    );
  };

  const modalDeleteMember = (id: string) => {
    return (
      <div>
        <div className="flex items-center justify-center">
          {managerId === id ? (
            <button
              type="button"
              onClick={() => setIsOpenDeleteMember(true)}
              className="cursor-not-allowed rounded-md bg-gray-400 px-4 py-2 text-sm font-medium text-white"
              disabled
            >
              {t("delete")}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsOpenDeleteMember(true), setIsIdDelete(id);
              }}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75"
            >
              {t("delete")}
            </button>
          )}
        </div>

        <Transition appear show={isOpenDeleteMember} as={Fragment}>
          <Dialog
            initialFocus={completeButtonRef}
            as="div"
            className="fixed inset-0 z-10 overflow-y-auto"
            onClose={() => setIsOpenDeleteMember(false)}
          >
            <div className="min-h-screen px-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Dialog.Overlay className="fixed inset-0" />
              </Transition.Child>

              {/* This element is to trick the browser into centering the modal contents. */}
              <span
                className="inline-block h-screen align-middle"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="wallet-pay my-8 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <div className="flex min-h-[220px] flex-col">
                    <div className="my-4 text-left text-base font-bold text-white">
                      {t("confirm_your_action")}
                    </div>
                    <div className="flex-grow text-white">
                      {t("are_you_sure")}
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        className="my-2 flex w-36 items-center justify-center rounded-lg bg-red-700 py-2 text-white"
                        ref={completeButtonRef}
                        onClick={() => confirmDeleteMember(isIdDelete)}
                      >
                        {isDeleting ? <Loading /> : "Confirm"}
                      </button>
                      <button
                        className="my-2 w-36 rounded-lg bg-gray-700 py-2 text-white"
                        onClick={() => setIsOpenDeleteMember(false)}
                      >
                        {t("cancel")}
                      </button>
                    </div>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </Dialog>
        </Transition>
      </div>
    );
  };

  return (
    <div className="mx-auto mt-28 max-w-5xl">
      <div className="mb-5 flex items-center justify-between">
        <p className="text-2xl font-bold text-primary-yellow lg:text-3xl">
          {t("Member")}
        </p>
        {modalAddMember()}
      </div>
      <Table
        columns={columnsList}
        dataSource={memberList}
        onEntries={handleShowEntries}
        isLoading={isLoading}
      />
      <div className="mt-7 flex justify-end">
        <Pagination
          currentPage={meta.currentPage}
          totalItems={meta.totalItems}
          itemPerPage={limit}
          onPrev={handlePagination}
          onNext={handlePagination}
          onSelect={handlePagination}
        />
      </div>
    </div>
  );
}

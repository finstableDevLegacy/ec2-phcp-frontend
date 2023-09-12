import React, { FC, useRef } from "react";

interface UploadWrapperProps {
  name: string;
  children: React.ReactNode;
  accept: string[];
  multiple?: boolean | undefined;
  callbackFiles: (file: File[]) => void;
  callbackFileUploadFailed?: (file: File[]) => void;
  disabled?: boolean;
}

export enum AcceptTypeFile {
  PNG = "image/png",
  JPEG = "image/jpeg",
  PDF = "application/pdf",
  CSV = "text/csv",
  CSV_XLS = "application/vnd.ms-excel",
}

export const UploadWrapper: FC<UploadWrapperProps> = ({
  name,
  children,
  accept,
  multiple,
  callbackFiles,
  callbackFileUploadFailed,
  disabled,
}) => {
  const fileRef: any = useRef(null);
  const onUploadClick = () => {
    document.getElementById(name)?.click();
  };

  const beforeUpload = (file: File) => {
    const isCorrectType = accept.includes(file.type);
    return isCorrectType;
  };

  const onFileChange = () => {
    let failFile: any[] = [];
    let fileList = [...fileRef?.current?.files];
    fileList = fileList.map((file) => {
      if (beforeUpload(file)) {
        return file;
      } else {
        failFile.push(file?.name);
      }
    });
    if (callbackFileUploadFailed) {
      callbackFileUploadFailed(failFile);
    }
    callbackFiles(fileList);
  };

  return (
    <React.Fragment>
      {" "}
      <input
        id={name}
        type="file"
        ref={fileRef}
        accept={`${accept.join(",")}`}
        multiple={multiple}
        hidden
        onChange={onFileChange}
      />
      <button onClick={onUploadClick} disabled={disabled}>
        {children}
      </button>
    </React.Fragment>
  );
};

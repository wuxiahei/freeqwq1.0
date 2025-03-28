import React from "react";
import type { FC } from "react";
import { useTranslation } from "react-i18next";
import { useTranslationName } from "@/utils";
import {
  ChatBubbleOvalLeftEllipsisIcon as ChatBubbleOvalLeftEllipsisSolidIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import Button from "@/app/components/base/button";
import type { ConversationItem } from "@/types/app";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const MAX_CONVERSATION_LENTH = 20;

// 使用从utils导入的翻译函数

export type ISidebarProps = {
  copyRight: string;
  currentId: string;
  onCurrentIdChange: (id: string) => void;
  list: ConversationItem[];
};

const Sidebar: FC<ISidebarProps> = ({
  copyRight,
  currentId,
  onCurrentIdChange,
  list,
}) => {
  const { t } = useTranslation();
  const translateName = useTranslationName();
  return (
    <div className="linear-bg shrink-0 flex flex-col overflow-y-auto bg-white pc:w-[244px] tablet:w-[192px] mobile:w-[240px]  border-r border-gray-200 tablet:h-[calc(100vh_-_3rem)] mobile:h-screen">
      {list.length < MAX_CONVERSATION_LENTH && (
        <div className="flex flex-shrink-0 p-4 !pb-0">
          <Button
            onClick={() => {
              onCurrentIdChange("-1");
            }}
            className="group block w-full flex-shrink-0 !justify-start !h-9 text-primary-600 items-center text-sm"
          >
            <PlusCircleIcon className="mr-3 h-5 w-5 " /> {t("app.chat.newChat")}
          </Button>
        </div>
      )}

      <nav className="mt-4 flex-1 space-y-3 bg-white p-4 !pt-0 linear-bg ">
        {list.map((item) => {
          const isCurrent = item.id === currentId;
          const ItemIcon = isCurrent
            ? ChatBubbleOvalLeftEllipsisSolidIcon
            : ChatBubbleOvalLeftEllipsisSolidIcon;
          return (
            <div
              onClick={() => onCurrentIdChange(item.id)}
              key={item.id}
              className={classNames(
                isCurrent
                  ? "bg-primary-50 text-primary-600"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-700",
                "group flex border border-gray-300 items-center rounded-md px-2 py-2 text-sm text-[12px] font-medium cursor-pointer"
              )}
            >
              <ItemIcon
                className={classNames(
                  isCurrent
                    ? "text-primary-600"
                    : "text-[#A4B5D6] group-hover:text-gray-500",
                  "mr-3 h-5 w-5 flex-shrink-0"
                )}
                aria-hidden="true"
              />
              <div className="text-nowrap overflow-hidden text-ellipsis">
                {translateName(item.name)}
              </div>
            </div>
          );
        })}
      </nav>
      {/* <a className="flex flex-shrink-0 p-4" href="https://langgenius.ai/" target="_blank">
        <Card><div className="flex flex-row items-center"><ChatBubbleOvalLeftEllipsisSolidIcon className="text-primary-600 h-6 w-6 mr-2" /><span>LangGenius</span></div></Card>
      </a> */}
      <div className="flex flex-shrink-0 pr-4 pb-4 pl-4">
        <div className="text-gray-400 font-normal text-[13px]">
          © {copyRight} {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);

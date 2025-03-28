"use client";
import type { FC } from "react";
import React, { useEffect, useRef, useState } from "react";

import { useTranslation } from "react-i18next";
import produce, { setAutoFreeze } from "immer";
import { useBoolean, useGetState } from "ahooks";
import useConversation from "@/hooks/use-conversation";

import Sidebar from "@/app/components/sidebar";
import ConfigSence from "@/app/components/config-scence";
import {
  fetchAppParams,
  fetchChatList,
  fetchConversations,
  generationConversationName,
  sendChatMessage,
  updateFeedback,
} from "@/service";
import type {
  ChatItem,
  ConversationItem,
  Feedbacktype,
  PromptConfig,
  VisionFile,
  VisionSettings,
} from "@/types/app";
import { Resolution, TransferMethod, WorkflowRunningStatus } from "@/types/app";
import Chat from "@/app/components/chat";
import { setLocaleOnClient } from "@/i18n/client";
import useBreakpoints, { MediaType } from "@/hooks/use-breakpoints";
import Loading from "@/app/components/base/loading";
import {
  replaceVarWithValues,
  userInputsFormToPromptVariables,
} from "@/utils/prompt";
import AppUnavailable from "@/app/components/app-unavailable";
import {
  API_KEY,
  APP_ID,
  APP_INFO,
  isShowPrompt,
  promptTemplate,
} from "@/config";
import type { Annotation as AnnotationType } from "@/types/log";
import { addFileInfos, sortAgentSorts } from "@/utils/tools";
import { getCustomUrlParams } from "@/utils/string";

export type IMainProps = {
  params: any;
};

const Main: FC<IMainProps> = () => {
  const { t } = useTranslation();
  const media = useBreakpoints();
  const isMobile = media === MediaType.mobile;
  const hasSetAppConfig = APP_ID && API_KEY;
  const [appUnavailable, setAppUnavailable] = useState<boolean>(false);
  const [isUnknownReason, setIsUnknownReason] = useState<boolean>(false);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [inited, setInited] = useState<boolean>(false);
  // in mobile, show sidebar by click button
  const [isShowSidebar, { setTrue: showSidebar, setFalse: hideSidebar }] =
    useBoolean(false);
  const [visionConfig, setVisionConfig] = useState<VisionSettings | undefined>({
    enabled: false,
    number_limits: 2,
    detail: Resolution.high,
    transfer_methods: [TransferMethod.local_file],
  });

  // Rest of the code remains the same...

  // Added placeholder functions for the missing imports
  const fetchAllProjectName = async (token: string) => {
    // Placeholder implementation
    return { data: [] };
  };

  const replaceArrText = (arr: string[], replacements: any[]) => {
    // Placeholder implementation
    return arr;
  };

  useEffect(() => {
    if (!hasSetAppConfig) {
      setAppUnavailable(true);
      return;
    }
    (async () => {
      try {
        if (
          !fetchedDataRef.current.conversationData ||
          !fetchedDataRef.current.appParams
        ) {
          const [conversationData, appParams, precinctNames] =
            await Promise.all([
              fetchConversations(),
              fetchAppParams(),
              fetchAllProjectName(token || ""), // Using the placeholder function
            ]);
          fetchedDataRef.current = {
            conversationData,
            appParams,
            precinctNames,
          };
        }
        const { conversationData, appParams, precinctNames } =
          fetchedDataRef.current;

        // Rest of your existing initialization logic...
        const repSuggested_questions = replaceArrText( // Using the placeholder function
          appParams.suggested_questions || [],
          precinctNames
        );
        setSuggestedQuestions(repSuggested_questions);

        // ... rest of the code remains the same
      } catch (e: any) {
        console.error("获取会话列表失败:", e);
        
        // Error handling remains the same
        if (e.status === 404) {
          setAppUnavailable(true);
          return;
        }
        
        setIsUnknownReason(true);
        setAppUnavailable(true);
      }
    })();
  }, [APP_ID, API_KEY]);

  // Rest of the component remains the same...

  return (
    <div>
      {/* Your existing return JSX */}
    </div>
  );
};

export default React.memo(Main);
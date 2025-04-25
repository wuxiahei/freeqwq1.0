import axios from "axios";

export const BASE_URL = "https://api.dify.ai/v1";

export const routes = {
    application: {
        method: "GET",
        url: () => `/parameters`,
    },
    feedback: {
        method: "POST",
        url: (message_id: string) => `/messages/${message_id}/feedbacks`,
    },
    createCompletionMessage: {
        method: "POST",
        url: () => `/completion-messages`,
    },
    createChatMessage: {
        method: "POST",
        url: () => `/chat-messages`,
    },
    getConversationMessages: {
        method: "GET",
        url: () => `/messages`,
    },
    getConversations: {
        method: "GET",
        url: () => `/conversations`,
    },
    renameConversation: {
        method: "POST",
        url: (conversation_id: string) => `/conversations/${conversation_id}/name`,
    },
    deleteConversation: {
        method: "DELETE",
        url: (conversation_id: string) => `/conversations/${conversation_id}`,
    },
    fileUpload: {
        method: "POST",
        url: () => `/files/upload`,
    },
    runWorkflow: {
        method: "POST",
        url: () => `/workflows/run`,
    },
    stopChatMessageResponding: {
        method: "POST",
        url: (task_id: string) => `/chat-messages/${task_id}/stop`,
    },
};

export interface MessageFeedback {
    rating: boolean;
    user: string;
}

export interface FileUpload {
    file: File;
}

export class DifyClient {
    protected apiKey: string;
    protected baseUrl: string;

    constructor(apiKey: string, baseUrl: string = BASE_URL) {
        this.apiKey = apiKey;
        this.baseUrl = baseUrl;
    }

    updateApiKey(apiKey: string) {
        this.apiKey = apiKey;
    }

    protected async sendRequest(
        method: string,
        endpoint: string,
        data: any = null,
        params: any = null,
        stream = false,
        headerParams = {}
    ) {
        const headers = {
            ...{
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            ...headerParams
        };

        const url = `${this.baseUrl}${endpoint}`;
        let response;
        if (stream) {
            response = await axios({
                method,
                url,
                data,
                params,
                headers,
                responseType: "stream",
            });
        } else {
            response = await axios({
                method,
                url,
                ...(method !== "GET" && { data }),
                params,
                headers,
                responseType: "json",
            });
        }

        return response;
    }

    messageFeedback(message_id: string, feedback: MessageFeedback) {
        return this.sendRequest(
            routes.feedback.method,
            routes.feedback.url(message_id),
            feedback
        );
    }

    getApplicationParameters(user: string) {
        const params = { user };
        return this.sendRequest(
            routes.application.method,
            routes.application.url(),
            null,
            params
        );
    }

    fileUpload(data: FormData) {
        return this.sendRequest(
            routes.fileUpload.method,
            routes.fileUpload.url(),
            data,
            null,
            false,
            {
                "Content-Type": 'multipart/form-data'
            }
        );
    }

    stopChatMessageResponding(task_id: string, user: string) {
        return this.sendRequest(
            routes.stopChatMessageResponding.method,
            routes.stopChatMessageResponding.url(task_id),
            { user }
        );
    }
}

export class CompletionClient extends DifyClient {
    createCompletionMessage(inputs: Record<string, any>, user: string, stream = false, files: any[] = []) {
        const data = {
            inputs,
            user,
            response_mode: stream ? "streaming" : "blocking",
            files,
        };
        return this.sendRequest(
            routes.createCompletionMessage.method,
            routes.createCompletionMessage.url(),
            data,
            null,
            stream
        );
    }

    runWorkflow(inputs: Record<string, any>, user: string, stream = false) {
        const data = {
            inputs,
            user,
            response_mode: stream ? "streaming" : "blocking",
        };
        return this.sendRequest(
            routes.runWorkflow.method,
            routes.runWorkflow.url(),
            data,
            null,
            stream
        );
    }
}

export class ChatClient extends DifyClient {
    createChatMessage(
        inputs: Record<string, any>,
        query: string,
        user: string,
        stream = false,
        conversation_id: string | null = null,
        files: any[] = []
    ) {
        const data: {
            inputs: Record<string, any>;
            query: string;
            user: string;
            response_mode: string;
            files: any[];
            conversation_id?: string;
        } = {
            inputs,
            query,
            user,
            response_mode: stream ? "streaming" : "blocking",
            files,
        };
        if (conversation_id) data.conversation_id = conversation_id;

        return this.sendRequest(
            routes.createChatMessage.method,
            routes.createChatMessage.url(),
            data,
            null,
            stream
        );
    }

    getConversationMessages(
        user: string,
        conversation_id = "",
        first_id: string | null = null,
        limit: number | null = null
    ) {
        const params = { user, conversation_id, first_id, limit };
        return this.sendRequest(
            routes.getConversationMessages.method,
            routes.getConversationMessages.url(),
            null,
            params
        );
    }

    getConversations(
        user: string,
        first_id: string | null = null,
        limit: number | null = null,
        pinned: boolean | null = null
    ) {
        const params = { user, first_id, limit, pinned };
        return this.sendRequest(
            routes.getConversations.method,
            routes.getConversations.url(),
            null,
            params
        );
    }

    renameConversation(
        conversation_id: string,
        name: string,
        user: string,
        auto_generate: boolean
    ) {
        const data = { name, user, auto_generate };
        return this.sendRequest(
            routes.renameConversation.method,
            routes.renameConversation.url(conversation_id),
            data
        );
    }

    deleteConversation(conversation_id: string, user: string) {
        const data = { user };
        return this.sendRequest(
            routes.deleteConversation.method,
            routes.deleteConversation.url(conversation_id),
            data
        );
    }

    stopChatMessageResponding(task_id: string, user: string) {
        return this.sendRequest(
            routes.stopChatMessageResponding.method,
            routes.stopChatMessageResponding.url(task_id),
            { user }
        );
    }
} 
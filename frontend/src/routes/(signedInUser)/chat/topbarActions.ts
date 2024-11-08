import { sidebar } from '$/components/layout/sidebar.svelte';
import { goto } from '$app/navigation';
import type { HistoryChatDetails } from '$lib/types/chat';
import { chatState } from '../../../routes/(signedInUser)/chat/[chatId]/chat.svelte';

export const actions = {
	deleteChat: async (chatId: string) => {
		const access_token = await (await fetch('/hooks_fetchHandler')).text();
		const res = await fetch(`/axum-api/chat/${chatId}`, {
			method: 'DELETE',
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		});
		if (res.ok) {
			if (chatState.starred) {
				const chatIndex = sidebar.chatHistory.starred_history.findIndex(
					(chat) => chat.id === chatId
				);
				sidebar.chatHistory.starred_history.splice(chatIndex, 1);
			} else {
				for (const time_period of sidebar.chatHistory.unstarred_history) {
					const chatIndex = time_period.period_chats.findIndex((chat) => chat.id === chatId);
					if (chatIndex !== -1) {
						time_period.period_chats.splice(chatIndex, 1);
						break;
					}
				}
			}
			goto('/chat/new');
		} else {
			throw new Error(await res.text());
		}
	},
	renameChat: async (chatId: string, title: string) => {
		const access_token = await (await fetch('/hooks_fetchHandler')).text();
		const res = await fetch(`/axum-api/chat/${chatId}/rename`, {
			method: 'PATCH',
			headers: {
				'Content-Type': 'text/plain',
				Authorization: `Bearer ${access_token}`
			},
			body: title
		});
		if (res.ok) {
			if (chatState.starred) {
				const chatIndex = sidebar.chatHistory.starred_history.findIndex(
					(chat) => chat.id === chatId
				);
				sidebar.chatHistory.starred_history[chatIndex].title = title;
			} else {
				for (const time_period of sidebar.chatHistory.unstarred_history) {
					const chatIndex = time_period.period_chats.findIndex((chat) => chat.id === chatId);
					if (chatIndex !== -1) {
						time_period.period_chats[chatIndex].title = title;
						break;
					}
				}
			}
		} else {
			throw new Error(await res.text());
		}
	},
	starChat: async (chatId: string) => {
		const access_token = await (await fetch('/hooks_fetchHandler')).text();
		const res = await fetch(`/axum-api/chat/${chatId}/starred`, {
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${access_token}`
			}
		});
		if (res.ok) {
			chatState.starred = !chatState.starred;
			if (chatState.starred) {
				let currentChat: HistoryChatDetails | undefined = undefined;
				for (const time_period of sidebar.chatHistory.unstarred_history) {
					const chatIndex = time_period.period_chats.findIndex((chat) => chat.id === chatId);
					if (chatIndex !== -1) {
						currentChat = time_period.period_chats.splice(chatIndex, 1)[0];
						break; // Exit the loop once the chat is found
					}
				}
				sidebar.chatHistory.starred_history.unshift(currentChat!);
			} else {
				const index = sidebar.chatHistory.starred_history.findIndex((chat) => chat.id === chatId);
				const currentChat = sidebar.chatHistory.starred_history.splice(index, 1)[0];
				sidebar.addUnstarredChatToHistory(currentChat);
			}
		} else {
			throw new Error(await res.text());
		}
	}
};

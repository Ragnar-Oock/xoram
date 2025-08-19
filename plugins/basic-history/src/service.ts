import type { HistoryService } from './api/history.service';

declare module '@xoram/core' {
	interface ServiceCollection {
		history: HistoryService;
	}
}
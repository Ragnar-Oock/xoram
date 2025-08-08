import type { CommandService } from './api/command.service';
import type { HistoryService } from './api/history.service';
import type { StateService } from './api/state.service';

declare module '@xoram/core' {
	interface ServiceCollection {
		commander: CommandService;
		state: StateService;
		history: HistoryService;
	}
}
import type { Commander } from './commander.service';

declare module '@xoram/core' {
	interface ServiceCollection {
		commander: Commander;
	}
}
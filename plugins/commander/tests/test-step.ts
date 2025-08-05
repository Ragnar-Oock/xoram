import type { Step } from '../src/commander.service';


// todo : make a test step that actually do something...

export class TestStep implements Step {
	public status: undefined | 'applied' | 'removed' = undefined;

	constructor(public readonly msg: string) {}

	public apply(): void {
		this.status = 'applied';
	}

	public remove(): void {
		this.status = 'removed';
	};

}
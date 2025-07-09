type Content = string;

type Rope = {
	left: Rope;
	right: Rope;
	index: number;
} | {
	content: Content;
	index: number;
}

const test = {
	left: {
		left: { content: 'my ', index: 0 },
		right: { content: 'name ', index: 3 },
		index: 0,
	},
	right: {
		left: { content: 'is ', index: 8 },
		right: { content: 'bob.', index: 11 },
		index: 8,
	},
	index: 0,
} satisfies Rope;


console.log(test);
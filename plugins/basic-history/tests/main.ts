import { createApp } from '@xoram/core';
import { basicHistoryPlugin } from '../src';

const app = createApp([
	basicHistoryPlugin,
]);

console.log(app);
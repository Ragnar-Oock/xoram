import { createApp } from '@xoram/core';
import { commanderPlugin } from '../src';

const app = createApp([
	commanderPlugin,
]);

console.log(app);
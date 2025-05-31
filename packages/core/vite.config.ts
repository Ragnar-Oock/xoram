import { defineLibConfig } from '@repo/config-vite';
import pkg from './package.json' with { type: 'json' };

export default defineLibConfig(pkg);
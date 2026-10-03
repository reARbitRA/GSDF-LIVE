import { defineConfig } from 'vitest/config';
import path from 'path';
export default defineConfig({ resolve: { alias: { '@': path.resolve(__dirname, '../..') } }, esbuild: { jsx: 'automatic' }, test: { environment: 'jsdom', include: ['audit/probe/**/*.test.tsx'], root: path.resolve(__dirname, '../..') } });

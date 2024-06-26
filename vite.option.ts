import { AliasOptions, BuildOptions, DepOptimizationOptions, ResolveOptions } from 'vite';
import path from 'path';

export const resolve: ResolveOptions & {
  alias?: AliasOptions;
} = {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
export const test = {
  root: path.resolve(__dirname, './src'),
}

export const optimizeDeps: DepOptimizationOptions = {
  include: [
    '@storybook/blocks',
    '@mdx-js/react'
  ]
}

export const build:BuildOptions = {
  rollupOptions: {
    external: [
      'node:assert',
      'node:crypto',
      'node:util',
      'fs',
      'path',
      'os',
      'argon2',
      '@prisma/client',
      'prisma',
      'node:process',
      'crypto',
      'viteser',
      'stream'
    ]
  }
}

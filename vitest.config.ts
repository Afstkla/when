import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['tests/**/*.test.ts', 'src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      // Excluded: tests, the library entry-point, type-only files, and
      // re-export barrels (no executable code worth measuring).
      exclude: [
        'src/**/*.test.ts',
        'src/index.ts',
        'src/types.ts',
        'src/vocabulary/Vocabulary.ts',
        'src/**/index.ts',
      ],
    },
  },
});

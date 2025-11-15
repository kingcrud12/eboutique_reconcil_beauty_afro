module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    '**/*.ts',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/dist/**',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
  testTimeout: 30000, // 30 secondes pour les tests E2E
  maxWorkers: 1, // Exécuter les tests séquentiellement pour éviter les conflits
};


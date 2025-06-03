import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'z3eavq',
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: ['cypress/e2e/**/*.cy.{js,jsx,ts,tsx}', 'cypress/integration/**/*.spec.{js,jsx,ts,tsx}'],
    supportFile: 'cypress/support/index.js',
  },
  viewportWidth: 1280,
  viewportHeight: 720,
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  fixturesFolder: 'cypress/fixtures',
});

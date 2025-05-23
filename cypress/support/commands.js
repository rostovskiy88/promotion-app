// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom command for file upload
Cypress.Commands.add('attachFile', { prevSubject: 'element' }, (subject, fileName) => {
  cy.fixture(fileName).then(fileContent => {
    const testFile = new File([fileContent], fileName, { type: 'image/jpeg' });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(testFile);
    const input = subject[0];
    input.files = dataTransfer.files;
    cy.wrap(input).trigger('change', { force: true });
  });
}); 
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
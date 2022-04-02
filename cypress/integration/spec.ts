describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.contains('Sign In');
    cy.get('.sign-in--form-field').type('ajain@fyle.in');
    cy.get('#sign-in--continue').click();
    cy.get('#sign-in--password').type('KalaChashma');
    cy.get('#sign-in--btn-sign-in').click();
  });
});
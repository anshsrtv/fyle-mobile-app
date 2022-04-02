describe('My First Test', () => {
  it('Visits the initial project page', () => {
    cy.visit('/');
    cy.contains('Sign In');
    cy.wait(60000);
    cy.get('#sign-in--email').should('be.visible').type('ajain@fyle.in');
    cy.get('#sign-in--continue').click();
    cy.get('#sign-in--password').type('KalaChashma');
    cy.get('#sign-in--btn-sign-in').click();
  });
});

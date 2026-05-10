describe('Add New Account', () => {
  beforeEach(() => {
    // Clear localStorage to ensure a clean state
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    cy.visit('/')
  })

  it('should create a new bank account', () => {
    // 1. We need a CSV setting first because it's required in the New Account form
    cy.visit('/settings/csvsettings/new')
    
    // Fill CSV setting name
    cy.get('#setting-name').scrollIntoView()
    cy.get('#setting-name').type('Test CSV Setting', { force: true })
    
    // Go to "Use Demo Data" tab
    cy.contains('Use Demo Data').scrollIntoView()
    cy.contains('Use Demo Data').click({ force: true })
    
    // Select the first demo file
    cy.get('label').contains('Select Demo File').parent().click({ force: true })
    cy.get('.v-overlay-container').contains('statement-august-2025.csv').click({ force: true })

    // Wait for CSV preview to be populated
    cy.contains('Match information with the right CSV column').should('be.visible')
    
    // Map at least one column to enable saving if there are validations (though save seems enabled)
    // Looking at the code, it seems we can just save
    cy.contains('button', 'Save').click({ force: true })

    // Redirection back to settings or where we came from. 
    // In the code it's router.go(-1).
    
    // 2. Now go to Add New Account page
    cy.visit('/accounts/new')

    const accountName = 'My Test Account'
    const accountNumber = '123456789'

    cy.get('label').contains('Account Name').parent().find('input').type(accountName, { force: true })
    cy.get('label').contains('Account Number').parent().find('input').type(accountNumber, { force: true })
    
    // Select Account Type
    cy.get('label').contains('Account Type').parent().click({ force: true })
    cy.get('.v-overlay-container').contains('Checking').click({ force: true })

    // Select CSV Setting
    cy.get('label').contains('CSV Setting').parent().click({ force: true })
    cy.get('.v-overlay-container').contains('Test CSV Setting').click({ force: true })

    // Create Account
    cy.get('button[type="submit"]').click({ force: true })

    // 3. Verify redirection to /accounts and presence of the new account
    cy.url().should('include', '/accounts')
    cy.contains(accountName).should('be.visible')
    cy.contains(accountNumber).should('be.visible')
  })
})

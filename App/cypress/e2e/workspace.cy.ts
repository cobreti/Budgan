describe('Workspace Management', () => {
  beforeEach(() => {
    cy.visit('/en/workspace')
  })

  it('should show the initial CSV selection state', () => {
    cy.url().should('include', '/en/workspace')
    cy.contains('Workspace Management').should('be.visible')
    cy.contains('No CSV file selected').should('be.visible')
    cy.contains('Select CSV File').should('be.visible')
  })

  it('should allow selecting a CSV file from disk', () => {
    cy.get('[data-testid="workspace-csv-input"]').selectFile(
      {
        contents: Cypress.Buffer.from(
          'card_number,date_transaction,amount,description,date_inscription\n1111222233334444,2026-03-27,-4.20,Coffee,2026-03-28\n'
        ),
        fileName: 'statement.csv',
        mimeType: 'text/csv',
        lastModified: Date.now()
      },
      { force: true }
    )

    cy.get('[data-testid="workspace-status"]').contains('Selected CSV file: statement.csv')
    cy.get('[data-testid="workspace-file-meta"]').contains('File size:')
    cy.get('[data-testid="workspace-toggle-json"]').contains('Hide JSON')
    cy.get('[data-testid="workspace-json-output"]').should('contain.text', '"delimiter": ","')
    cy.get('[data-testid="workspace-json-output"]').should('contain.text', '"header"')
    cy.get('[data-testid="workspace-json-output"]').should(
      'contain.text',
      '"card_number": "1111222233334444"'
    )
    cy.get('[data-testid="workspace-json-output"]').should(
      'contain.text',
      '"description": "Coffee"'
    )

    cy.get('[data-testid="workspace-mapping-panel"]').should('be.visible')
    cy.get('[data-testid="workspace-apply-mapping"]').should('be.disabled')

    cy.get('[data-testid="workspace-mapping-card-number"]').select('card_number')
    cy.get('[data-testid="workspace-mapping-date-transaction"]').select('date_transaction')
    cy.get('[data-testid="workspace-mapping-amount"]').select('amount')
    cy.get('[data-testid="workspace-mapping-description"]').select('description')

    cy.get('[data-testid="workspace-mapping-required-error"]').should('not.exist')
    cy.get('[data-testid="workspace-apply-mapping"]').should('not.be.disabled').click()
    cy.get('[data-testid="workspace-mapping-output"]').should('contain.text', '"card-number": 0')
    cy.get('[data-testid="workspace-mapping-output"]').should(
      'contain.text',
      '"date-transaction": 1'
    )
    cy.get('[data-testid="workspace-mapping-output"]').should('contain.text', '"amount": 2')
    cy.get('[data-testid="workspace-mapping-output"]').should('contain.text', '"description": 3')

    cy.get('[data-testid="workspace-toggle-json"]').click()
    cy.get('[data-testid="workspace-json-output"]').should('not.exist')
    cy.get('[data-testid="workspace-toggle-json"]').contains('Show JSON')
  })
})

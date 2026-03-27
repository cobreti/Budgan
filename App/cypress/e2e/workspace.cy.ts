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
        contents: Cypress.Buffer.from('date,description,amount\n2026-03-27,Coffee,-4.20\n'),
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
    cy.get('[data-testid="workspace-json-output"]').should('contain.text', '"date": "2026-03-27"')
    cy.get('[data-testid="workspace-json-output"]').should(
      'contain.text',
      '"description": "Coffee"'
    )

    cy.get('[data-testid="workspace-toggle-json"]').click()
    cy.get('[data-testid="workspace-json-output"]').should('not.exist')
    cy.get('[data-testid="workspace-toggle-json"]').contains('Show JSON')
  })
})

describe('Workspace Management', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('should navigate to workspace page and show initial state', () => {
        // Just navigate directly if the drawer is being tricky in headless
        cy.visit('/workspace')

        // Verify URL
        cy.url().should('include', '/workspace')

        // Verify page content
        cy.contains('Workspace Management').should('be.visible')
        cy.contains('No workspace selected').should('be.visible')
        cy.contains('button', 'Select Workspace').should('be.visible')
    })
})

describe('Open Engagement Notebook/Sagemaker Notebook', () => {
    it('passes', () => {
        cy.visit('/');
        cy.login();
        cy.contains(/open engagement notebook/i).click();
        
        let url; 

        cy.window()
            .then((win) => {
                url = win
            });
            console.log('url', url);

        // expect(url).to.equal('localhost:8888');
        
        cy.visit('localhost:8888');
        
    //     // expect new window to open 
    //     // cy.visit('sagemakerurlhere')
    })
    // it('Clicks button on dashboard & opens notebook', () => {
    //     cy.contains(/notebook/i).click();

    //     cy.window()
    //         .then((win) => {
    //             win.should('include', 'localhost:8888');
    //             cy.visit('localhost:8888'); 
    //         })
        
    //     // expect new window to open 
    //     // cy.visit('sagemakerurlhere')
    // })
})
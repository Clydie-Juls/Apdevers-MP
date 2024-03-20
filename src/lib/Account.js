export const Account = {
    async isLoggedIn() {
        return await this.getDetails() !== null;
    },

    async getDetails() {
        const response = await fetch('/api/account/logincheck');
        const details = await response.json();

        return details.isNull ? null : details;
    },
    
    async logout() {
        const details = await this.getDetails();
        const id = details.id;

        await fetch(`/api/account/logout/${id}`, {
            method: 'post'
        });
    }
};
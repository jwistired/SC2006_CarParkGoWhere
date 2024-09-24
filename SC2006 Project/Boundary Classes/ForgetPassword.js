export class ForgotPassword {
    constructor() {
        this.username = '';
        this.email = '';
    }

    sendResetLink(email) {
        this.email = email;
        console.log(`Reset link sent to ${email}`);
    }

    resetPassword(newPassword) {
        console.log("Password reset successfully");
    }
}
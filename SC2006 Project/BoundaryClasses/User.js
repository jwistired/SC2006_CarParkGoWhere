const bcrypt = require('bcrypt');

class User {
    constructor(name, email, password, securityQuestion, securityAnswer) {
        this.id = Date.now().toString();
        this.name = name;
        this.email = email;
        this.password = password;
        this.securityQuestion = securityQuestion;
        this.securityAnswer = securityAnswer;
    }

    static async hashPassword(password) {
        const bcrypt = require('bcrypt');
        return await bcrypt.hash(password, 10);
    }
}

module.exports = User;

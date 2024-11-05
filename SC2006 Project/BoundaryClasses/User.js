const bcrypt = require('bcrypt');
//user parameters
class User {
    constructor(name, email, password) {
        this.id = Date.now().toString();
        this.name = name;
        this.email = email;
        this.password = password;
    }
}

module.exports = User;

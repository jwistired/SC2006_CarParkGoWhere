const { authenticate } = require('passport')

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, {message: "No user with that email"})
        }
        try{
            if (await bcrypt.compare(password, user.password)){
                return done(null, user)
            } else {
                return done(null, false, {message: "Password incorrect"})
            }
        } catch (e) {
            return done(e)
        }

    }

    const verifyUserForForgetPassword = (email, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, {message: "No user with that email"})
        } else {
            return done(null, user)
        }
    }

    passport.use('local-login', new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.use('local-forget-password', new LocalStrategy({ usernameField: 'email'}, verifyUserForForgetPassword))


    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => { 
        return done(null, getUserById(id))
    })
}

module.exports = initialize
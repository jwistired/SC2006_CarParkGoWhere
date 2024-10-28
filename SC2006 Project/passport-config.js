const { authenticate } = require('passport')

const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')
const {getByEmail, getByID} = require('./BoundaryClasses/Database')

function initialize(passport) {
    // using own validators for email and id through Database.js
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await getByEmail(email);
            
            if (!user) {
                console.log("No user with that email");
                return done(null, false, { message: "No user with that email" });
            }
    
            const isMatch = await bcrypt.compare(password, user.password);
    
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Password incorrect" });
            }
        } catch (error) {
            console.error("Error in authentication:", error);
            return done(error);
        }
    }
    
    const verifyUserForForgetPassword = async (req, email, done) => {
        console.log(email)
        try {
            const user = await getByEmail(email);
            if (user) {
                return done(null, user)
            } else {
                return done(null, false, { message: "No user with that email" })
            }
        } catch (error) {
            return done(error)
        }
    }


    passport.use('local-login', new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    passport.use('local-forget-password', new LocalStrategy({ usernameField: 'email', passwordField: 'email', passReqToCallBack: true}, verifyUserForForgetPassword))

    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser((id, done) => { 
        return done(null, getByID(id))
    })
}

module.exports = initialize
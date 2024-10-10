// If login details are present continue on, else go back to login page
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

// If not logged in redirect continue on, else proceed to main dashboard 
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    next()
}

function terminateAuthentication(req) {
    // Clear the req.user object to terminate Passport authentication
    req.user = null

    // isAuthenticated() status
    if (req.session && req.session.passport) {
        delete req.session.passport
    }
}


module.exports = {
    checkAuthenticated,
    checkNotAuthenticated,
    terminateAuthentication
}
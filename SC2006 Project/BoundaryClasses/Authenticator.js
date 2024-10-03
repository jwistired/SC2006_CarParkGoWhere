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

module.exports = {
    checkAuthenticated,
    checkNotAuthenticated
}
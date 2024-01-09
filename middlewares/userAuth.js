const User = require('../model/userModel')


const isLogin = async (req, res, next) => {
    try {

        if (req.session.user_id) {
            const user = await User.findById(req.session.user_id);
            if (user && user.is_block) {
                // User is blocked, logout them and redirect to login page
                delete req.session.user_id;
                res.redirect('/register');
            } else {
                next()
            }
        }
        else {
            res.redirect('/register')
        }

    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async (req, res, next) => {
    try {
        if (!req.session.user_id) {
            next();
        }
        else {
            res.redirect('/')
            // Redirect to the home page if the user is logged in
        }
    } catch (error) {
        console.log(error.message);
    }
}


module.exports = {
    isLogin,
    isLogout
}
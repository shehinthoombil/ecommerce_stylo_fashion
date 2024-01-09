const isLogin = async(req,res,next)=>{
    try {
        if(req.session.user_id){
            console.log('session');
        }else{
            res.redirect('/admin');
        }
        next();
        
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next) => {
    try {
        if(req.session.user_id){
            res.redirect('/admin/adminSign')
        }
        next()
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}
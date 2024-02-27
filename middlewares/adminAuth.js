const isLogin = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            next();  
        }else{
            res.redirect('/admin');  
        }
    } catch (error) {
        console.log(error.message);
    }
}

const isLogout = async(req,res,next) => {
    try {
        console.log(req.session.admin_id,'adminsession')
        if(!req.session.admin_id){
            console.log('session')
            next();
        }else{
            res.redirect('/admin/dashboard');  
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    isLogin,
    isLogout
}
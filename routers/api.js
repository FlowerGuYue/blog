var express=require('express');
var mysql=require("mysql");
var session=require('express-session');
var app=express();
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:1000*60*60}   //最大时间为60s
}));

var pool=mysql.createPool({
    host:'127.0.0.1',
    port:3306,
    database:'blog',
    user:'root',
    password:'a'
});
//路由操作    第一步需要加载路由
var router=express.Router();
//第二部 处理请求
//统一返回格式
var resData;
router.use(function (req,res,next) {
    resData={
        code:-1,
        message:""
    };
    next();
});

//注册
router.post("/user/register",function (req,res,next) {
    var uname=req.body.username;
    var pwd=req.body.password;
    pool.getConnection(function (err,conn) {
        if(err){
            resData.code=0;
            resData.message="网路链接失败，请稍后再重试";
            res.json(resData);
        }else{
            conn.query("select *from user where uname=?",[uname],function (err,result) {
                if(err){
                    resData.code=0;
                    resData.message="网路链接失败，请稍后再重试";
                    res.json(resData);
                }else if(result.length>0){
                    resData.code=1;
                    resData.message="该用户已经注册过";
                    res.json(resData);
                }else{
                    //说明没有注册过 那就注册
                    conn.query("insert into user values(null,?,?,0)",[uname,pwd],function (err,result) {
                        conn.release();
                        if(err){
                            resData.code=0;
                            resData.message="网路链接失败，请稍后再重试";
                            res.json(resData);
                        }else{
                            resData.code=2;
                            resData.message="注册成功";
                            res.json(resData);
                        }
                    });
                }
            });
        }
    })
});


//登录
router.post("/user/login",function (req,res,next) {
    var uname=req.body.username;
    var pwd=req.body.password;
    pool.getConnection(function (err,conn) {
        if(err){
            resData.code=0;
            resData.message="网路链接失败，请稍后再重试";
            res.json(resData);//服务器要求返回json数据
        }else{
            conn.query("select *from user where uname=?",[uname],function (err,result) {
                conn.release();
                if(err){
                    resData.code=0;
                    resData.message="网路链接失败，请稍后再重试";
                    res.json(resData);
                }else if(result.length<=0){
                    resData.code=1;
                    resData.message="用户名或者密码错误";
                    res.json(resData);
                }else{
                            resData.code=2;
                            resData.message="登陆成功";
                             resData.info=result[0];
                            req.session.userInfo=result[0];
                            res.json(resData);
                }
            })
        }
    });
});

//退出
router.post("/user/logout",function (req,res) {
    req.session.userInfo="";
    req.session.userInfo=null;
    res.send("1");

})



//第三步  将这个支线模块   加载到主模块去

module.exports=router;
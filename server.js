/**
 * Created by Administrator on 17-3-4.
 */
var express=require('express');
var cookieParser=require("cookie-parser");
var bodyParser=require("body-parser");
var session=require('express-session'); //session模块
var mysql=require("mysql"); //数据库模块
var fs=require('fs'); //文件操作
//引入模板引擎     模板引擎是前端一个划时代的技术点
var swig=require("swig");

var app=express(); //创建web应用程序

//session的使用也需要配置
app.use(session({
    secret:'keyboard cat',
    resave:false,
    saveUninitialized:true,
    cookie:{maxAge:1000*60*60}   //最大时间为60s
}));
//配置  swig
app.engine("html",swig.renderFile);//模板引擎的名称，用来强调后缀名解析模板引擎的方法
app.set("views","./view");//第一个参数固定  指设置模板引擎的页面在哪
app.set("view engine","html");//注册引擎 可以开始使用了
swig.setDefaults({cache:false});//关闭缓存

app.use("/public",express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended:true}));

var pool=mysql.createPool({
   host:'127.0.0.1',
    port:3306,
    database:'blog',
    user:'root',
    password:'a'
});


//路由 ：考虑到把所有的业务请求 全部写在一个server.js里面 这个文记者你的逻辑就会比较混乱 也比较难找
//所以，我们可以将一些功能类似的  把它放到一个模块里面去，然后 让这个模块，搭建到主模块里面
//这样  就相当于 一个主模块  分支了很多支线模块
app.use("/",require("./routers/main"));//所有的主模块都在这里
app.use("/admin",require("./routers/admin"));//所有的后台模块，都在这里
app.use("/api",require("./routers/api"));//所有的前台逻辑模块  都在这里

//{%%}  代表语法  for if
//{{}}  具体数据



app.listen(80,"127.0.0.1",function(err){
    if(err){
        console.log(err);
    }else{
        console.log("服务器启动成功");
    }
});


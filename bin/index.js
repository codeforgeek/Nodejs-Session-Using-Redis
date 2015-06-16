var express		=	require("express");
var redis		=	require("redis");
var mysql		=	require("mysql");
var nodeUUID	=	require("node-uuid");
var session		=	require('express-session');
var redisStore  = 	require('connect-redis')(session);
var bodyParser  =	require('body-parser');
var path 		= 	require("path");
var client 		= 	redis.createClient();
var app			=	express();
var router 		= 	express.Router();

app.set('views', path.join(__dirname,'../','views'));
app.engine('html', require('ejs').renderFile);

app.use(session(
	{
		secret: 'ssshhhhh',
		store: new redisStore({ host: 'localhost', port: 6379, client: client }),
		saveUninitialized: false,
		resave: false
	}
));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

router.get('/',function(req,res){
	res.render('index.html');
});

router.post('/login',function(req,res){
	console.log("at lohin" + req.body.user_email)
	var key = nodeUUID.v4();	
	req.session.key = {"session_key" : key,"email" : req.body.user_email};
	res.redirect('/home');
});

router.get('/home',function(req,res){
	if(req.session.key) {
		res.render("home.html",{ email : req.session.key["email"]});
	}
});

app.use('/',router);

app.listen(3000,function(){
	console.log("I am running at 3000");
});

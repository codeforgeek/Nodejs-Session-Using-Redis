var express			=	require("express");
var redis			=	require("redis");
var mysql			=	require("mysql");
var session			=	require('express-session');
var redisStore		=	require('connect-redis')(session);
var bodyParser		=	require('body-parser');
var cookieParser	=	require('cookie-parser');
var path			=	require("path");
var client			=	redis.createClient();
var app				=	express();
var router			=	express.Router();

var pool	=	mysql.createPool({
    connectionLimit : 100, 
    host     : 'localhost',
    user     : 'root',
    password : 'toor',
    database : 'redis_demo',
    debug    :  false
});

app.set('views', path.join(__dirname,'../','views'));
app.engine('html', require('ejs').renderFile);

app.use(session(
	{
		secret: 'ssshhhhh',
		store: new redisStore({ host: 'localhost', port: 6379, client: client,ttl :  60}),
		saveUninitialized: false,
		resave: false
	}
));
app.use(cookieParser("secretSign#143_!223"));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

function handle_database(req,type,callback) {
	var db_error = false;
	pool.getConnection(function(err,connection){
		if (err) {
		  db_error = true;
		  callback(null);
		  return;
		}
		switch(type) {
			case "login" : 
			connection.query("SELECT * from user_login WHERE user_email='"+req.body.user_email+"'",function(err,rows){
				connection.release();
				if(!err) {
					callback(rows.length === 0 ? false : rows[0]);
				} else {
					db_error = true;
				}
			});
			break;
			case "register" : 
			connection.query("INSERT into user_login(user_email,user_password,user_name) VALUES ("+req.body.user_email+","+req.body.user_pass+","+req.body.user_name+")",function(err,rows){
				connection.release();
				if(!err) {
					callback(true);
				} else {
					db_error = true;
				}
			});
			break;
			case "addStatus" : 
			connection.query("INSERT into user_status(user_id,user_status) VALUES ("+req.session.key["user_id"]+","+req.body.status+")",function(err,rows){
				connection.release();
				if(!err) {
					callback(true);
				} else {
					db_error = true;
				}
			});
			break;
			case "getStatus" : 
			connection.query("SELECT * FROM user_status WHERE user_id="+req.session.key["user_id"],function(err,rows){
				connection.release();
				if(!err) {
					callback(rows.length === 0 ? false : rows);
				} else {
					db_error = true;
				}
			});
			break;
			default :
			break;
		}
		connection.on('error', function(err) {      
			db_error = true;			
		});
	});
	if(db_error) {
		callback(null);
		return;
	}
}

router.get('/',function(req,res){
	res.render('index.html');
});

router.post('/login',function(req,res){
	handle_database(req,"login",function(response){
		if(response === null) {
			res.json({"error" : "true","message" : "Database error occured"});
		} else {
			if(!response) {
				res.json({"error" : "true","message" : "Login failed ! Please register"});
			} else {
				req.session.key = response;
				res.redirect('/home');
			}
		}
	});
});

router.get('/home',function(req,res){
	if(req.session.key) {
		res.render("home.html",{ email : req.session.key["user_email"]});
	} else {
		res.render("index.html");
	}
});

router.get('/logout',function(req,res){
	if(req.session.key) {
		client.del(req.session.key);
	} else {
		res.redirect('/');
	}
});

app.use('/',router);

app.listen(3000,function(){
	console.log("I am running at 3000");
});

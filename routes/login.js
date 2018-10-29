var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var nodemailer = require('nodemailer');
var app = express();

var pool = mysql.createPool({
	connectionLimit:5,
	host:'localhost',
	user:'root',
	database:'testshop',
	password:'ghkdlxld'
});

var stmpTransport = nodemailer.createTransport('SMTP', {
  service: 'Gmail',
  auth: {
    user: 'gksquddn1@gmail.com',
    pass: 'ghgh3939'
  }
});

router.get('/', function(req, res, next) {
	

	var user = req.session.user_id;
	var user_login = '';
	console.log('req session', req.session);
	try {
		if(req.session.user_id) {
			console.log("여길들어온다고?????????????");
			user_login = req.session.user_id;
		}
	} catch(e) {}

	console.log('member - session : ' + req.session.user_id + user_login);

	if(user_login=='') {
		console.log("로그인 안된거.......!!!!!!");
		res.render('login', { title : '로그인',user_id : req.session.user_id, department : req.session.department});
	} else {
		console.log("로그인 된건데.......!!!!!!");
		res.send('<script>alert("이미 로그인 되었습니다.");history.back();</script>');
	}
});

router.post('/', function(req, res, next) {
	
	var id = req.body.id;
	var passwd = req.body.passwd;

	pool.getConnection(function(err, connection) {
		if(err) console.error("커넥션 로그인 에러 : ", err);

		var sql = "SELECT memberid, pw, department FROM member WHERE memberid = ? and pw = ?";
		connection.query(sql, [id, passwd], function(err, rows) {
			if(err) {
				console.error(err);
				console.log("로그인 못한다!!!!!!", rows);
				connection.release();
			}
			else if(!rows.length) {
				connection.release();
				console.log("로그인 못한다!!!!!!", rows);
				// res.render('error_page', { title : '로그인 실패했습니다.'});
				res.send('<script>alert("아이디나 비밀번호가 다릅니다. 다시 시도해주세요!");history.back();</script>');
			} else {
				console.log("로그인 한다!!!!!!", rows);
				console.log("password : : : :", rows[0].pw);
	
				req.session.user_id = id;
				req.session.department = rows[0].department;
				console.log("req.session.user_id", req.session.user_id);
				res.redirect('/');
				connection.release();
			}
		});
	});
});

router.get('/logout', function(req, res) {
	req.session.destroy(function(err) {
		if(err) console.error('err', err);
		res.send('<script>alert("로그아웃 되었습니다");location.href="/";</script>');
	});
});


router.get('/error_page', function(req, res, next) {
	res.render('error_page', { title : '에러',user_id : req.session.user_id, department : req.session.department});
});

router.get('/find_id', function(req, res, next) {
	res.render('find_id', { title : '아이디 찾기',user_id : req.session.user_id, department : req.session.department});
});

router.post('/find_id', function(req, res, next) {
	res.render('find_id', { title : '아이디 찾기',user_id : req.session.user_id, department : req.session.department});
});

router.get('/find_pw', function(req, res, next) {
	res.render('find_pw', { title : '비밀번호 찾기',user_id : req.session.user_id, department : req.session.department});
});

router.post('/find_pw', function(req, res, next) {
	res.render('find_pw', { title : '비밀번호 찾기',user_id : req.session.user_id, department : req.session.department});
});

router.get('/result_id', function(req, res, next) {
	var name = req.query.name;
	var email = req.query.email;

	pool.getConnection(function(err, connection) {
		var sqlForSelectList = "SELECT memberid FROM member WHERE nickname=? and email=?";
		connection.query(sqlForSelectList, [name, email], function(err, rows) {

			if(err) {
				console.error(err);
				connection.release();
			}
			else if(!rows.length) {
				connection.release();
				console.log("해당 사용자 없음", rows);
				res.render('error_page', { title : '사용자가 없습니다.',user_id : req.session.user_id, department : req.session.department});
				// res.redirect('/login/error_page');

			} else {
				console.log("rows : " + JSON.stringify(rows));
				res.render('result', {title: '아이디 찾기', row:rows[0],user_id : req.session.user_id, department : req.session.department});
				connection.release();
			}
		});
	});
})


router.post('/result_pw', function(req, res, next) {
	var passwd = req.body.temp;
	var memberid = req.body.id;
	var name = req.body.name;
	var email = req.body.email;
	var data = [name, email, memberid];
	var data2 = [passwd, name, email, memberid];

	console.log("memberid", memberid, name, email, passwd);

	pool.getConnection(function(err, connection) {
		var sqlForSelectList = "SELECT * FROM member WHERE nickname=? and email=? and memberid=?";
		var sqlUpdatePassword = "UPDATE member SET pw=? WHERE nickname=? and email=? and memberid=?";
		connection.query(sqlForSelectList, data, function(err, rows) {
			console.log(rows);
			if(err) {
				console.error(err);
				connection.release();
			}
			else if(!rows.length) {
				connection.release();
				console.log("해당 사용자 없음", rows);
				res.render('error_page', { title : '사용자가 없습니다.',user_id : req.session.user_id, department : req.session.department});
				// res.redirect('/login/error_page');

			} else {
				console.log("rows : " + JSON.stringify(rows));
				// res.render('error_page', {title: '임시비밀번호가 해당 메일로 전송되었습니다.'});
				// connection.release();


				connection.query(sqlUpdatePassword, data2, function(err, row) {
					if(err) {
						console.error(err);
						connection.release();
					}
					else if(!rows.length) {
						connection.release();
						console.log("UPDATE실패", rows);
						res.render('error_page', { title : '사용자가 없습니다.',user_id : req.session.user_id, department : req.session.department});
					} else {

						var message = "비밀번호가 " + passwd + " 로 변경되었습니다.";
					    var mailOptions = {
							from: '관리자<gksquddn1@gmail.com>',
							to: email,
							subject: '새로운 비밀번호',
							// text: '평문 보내기 테스트 ',
							html:message
						};


						stmpTransport.sendMail(mailOptions, function(err, response) {
							if(err) {
								console.log(err);
								res.end("error");
							} else {
								console.log("Message sent : " + response.message);
								res.render('error_page', {title: '해당 메일로 전송되었습니다.',user_id : req.session.user_id, department : req.session.department});
							}
							stmpTransport.close();
						});
						
						
					}
				});

			}
			
		});
	});

})

module.exports = router;
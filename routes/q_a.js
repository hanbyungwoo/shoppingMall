	var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit:5,
	host:'localhost',
	user:'root',
	database:'testshop',
	password: 'ghkdlxld',
	dateStrings: 'date'		
});


router.get('/', function(req, res, next) {
	res.redirect('/Q&A/list/1');
});

router.get('/list/:page', function(req, res, next) {
	pool.getConnection(function(err, connection) {
		if(err) console.error("커넥션 Q&A 에러 : ", err);

		var sql = "SELECT * FROM q_a";
		connection.query(sql, function(err, rows) {
			if(err) {
				console.error(err);
				console.log("Q&A error", rows);
				connection.release();
			}
			// else if(!rows.length) {
			// 	connection.release();
			// 	console.log("로그인 못한다!!!!!!", rows);
			// 	res.redirect('/login/error_page');

			// } 
			else {
				var sql = "SELECT * FROM q_a_reply";
				connection.query(sql, function(err, row) {
					if(err) {
						console.error(err);
						console.log("Q&A error", rows);
						connection.release();
					} else {
						res.render('list', {title:'고객센터(Q&A)', rows:rows, row:row,user_id : req.session.user_id, department : req.session.department});
						connection.release();

					}
				});

				
			}
		});
	});
});

//글쓰기 화면 표시 GET
router.get('/write', function(req, res, next) {
	if(req.session.user_id === undefined) {
		res.send('<script>alert("해당 기능 사용을 위해서는 로그인 해주세요");location.href="/login";</script>');
	} else {
		res.render('write', {title : "게시판 글 쓰기",user_id : req.session.user_id, department : req.session.department});
	}
});





// 글쓰기 로직 처리 POST
// router.post('/write', multer_settings.single('image'), function(req, res, next) {
router.post('/write', function(req, res, next) {
	var title = req.body.title;
	var content = req.body.content;
	var passwd = req.body.passwd;
	var today = req.body.today;
	var memberid = req.session.user_id;
	

	console.log("today->", today);
	// if(req.file) {
	// 	var img_name ="/uploads/" + req.file.filename;
	// 	console.log(req.file);

	// 	var datas = [creator_id, title, content, passwd, img_name];
	// }

	// var datas = [creator_id, title, content, passwd, img_name];
	var datas = [memberid, title, content, passwd, today];

	pool.getConnection(function (err, connection) {
		// Use the connection
		var sqlForInsertBoard = "insert into q_a(memberid, title, context, passwd, q_adate) values (?,?,?,?,?)";
		connection.query(sqlForInsertBoard, datas, function(err, rows) {
			if(err) {
				console.error("err: " + err);
				connection.release();
			} else {
				console.log("rows : " + JSON.stringify(rows));

				res.redirect('/Q&A');
				connection.release();
			}
			// Don't use the connection here, it has been returned to the pool
		});
	});
});

// 글조회 로직 처리 GET
router.get('/read/:contentnum', function(req, res, next) {
	var contentnum = req.params.contentnum;

	pool.getConnection(function(err, connection) {
		var sql = "SELECT * FROM q_a WHERE contentnum=?";
		connection.query(sql, [contentnum], function(err, row) {
			if(err) console.error(err);
			console.log("1개 글 조회 결과 확인 : ", row);

			var sql = "SELECT * FROM q_a_reply WHERE contentnum=?";
			connection.query(sql, [contentnum], function(err, rows) {
				if(err) console.error(err);
				console.log("1개 글 조회 결과 확인 : ", rows);
				connection.release();
				res.render('read', {title:"글 조회", row:row[0], rows:rows[0], user_id:req.session.user_id, department:req.session.department});
			});

		});
	});
});

router.get('/delete', function (req, res, next) {

    var contentnum = req.query.contentnum;
    console.log("aaaaaaaaaaaaaaaaaaaaaaa", contentnum);
    pool.getConnection(function (err, connection) {
        if (err) console.error("object error : ", err);
        var sql = " select * from q_a where contentnum=?";
        connection.query(sql, [contentnum], function (err, rows) {
            if (err) console.error(err);
            console.log("delete 확인 : ", rows);
            res.render('delete', { title: "Delete", row: rows[0] ,user_id : req.session.user_id, department : req.session.department});
            connection.release();
        });

    });
});

// 글 삭제 로직 처리
router.post('/delete', function(req, res, next) {
	var contentnum = req.body.contentnum;
	var passwd = req.body.passwd;
	var datas = [contentnum, passwd];

	pool.getConnection(function(err, connection) {
		if(err) console.error("커넥션 객체 삭제 에러 : ", err);

		var sql = "DELETE FROM q_a WHERE contentnum = ? and passwd = ?";
		connection.query(sql, datas, function(err, rows) {
			if(err) console.error(err);
			console.log("aaaaaaaaaaaa" + sql);
			console.log("delete에서 1개 글 삭제 : ", rows);
			if(rows.affectedRpws==0) {
				res.send("<script>alert('패스워드가 일치하지 않습니다.');history.back();</script>");
				connection.release();
			} else {
				// res.render('delete', {title:"글 삭제", row:rows[0]});
				res.redirect('/Q&A/list/1');
				connection.release();
			}
		});
	});
});

router.get('/q_acontent/:contentnum', function(req, res, next) {
		var contentnum = req.params.contentnum;
  		 pool.getConnection(function (err, connection) {
        if (err) console.error("object error : ", err);
        var sql = " select contentnum from q_a where contentnum=?";
        connection.query(sql, [contentnum], function (err, rows) {
            if (err) console.error(err);
            console.log("contentnum: ", rows);
            res.render('q_acontent', { title: "Q_A", row: rows[0] ,user_id : req.session.user_id, department : req.session.department});
        });
    });
      
});
router.post('/q_acontent', function(req, res, next) {
		var contentnum = req.body.contentnum;
		var passwd = req.body.passwd;
		pool.getConnection(function(err, connection) {
		if(err) console.error("커넥션 객체 얻어오기 에러 : ",err);

		var sql = "SELECT * FROM q_a WHERE contentnum=? and passwd = ?";
		connection.query(sql, [contentnum,passwd], function(err, rows) {
			if(err) console.error(err);
			console.log(" contetnt ", rows);
			if (!rows.length) {
                res.send("<script>alert('password is not equal.');history.back();</script>");
            }
            else {
                res.redirect('/Q&A/read/'+contentnum);
            }
            connection.release();
		});
	});


});

// 글수정 화면 표시 GET
router.get('/update', function(req, res, next) {
	var contentnum = req.query.contentnum;

	pool.getConnection(function(err, connection) {
		if(err) console.error("커넥션 객체 얻어오기 에러 : ",err);

		var sql = "SELECT * FROM q_a WHERE contentnum=?";
		connection.query(sql, [contentnum], function(err, rows) {
			if(err) console.error(err);
			console.log("update에서 1개 글 조회 결과 확인 : ", rows);
			res.render('update', {title:"글 수정", row:rows[0],user_id : req.session.user_id, department : req.session.department});
			connection.release();
		});
	});
});

// 글수정 로직 처리 POST
router.post('/update', function(req, res, next) {
	var contentnum = req.body.contentnum;
	var memberid = req.body.memberid;
	var title = req.body.title;
	var context = req.body.context;
	var passwd = req.body.passwd;
	var today = req.body.today;

	var datas = [memberid,title,context,today,contentnum,passwd];

	pool.getConnection(function(err, connection) {
		var sql = "UPDATE q_a SET memberid=?, title=?, context=?, q_adate=? WHERE contentnum=? and passwd=?";
		connection.query(sql, datas, function(err, result) {

			console.log(result);
			if(err) console.error("글 수정 및 에러 발생 err : ", err);

			if(result.affectedRpws == 0) {
				res.send("<script>alert('패스워드가 일치하지 않거나, 잘못된 요청으로 인해 값이 변경되지 않았습니다.');history.back();</script>");
			} else {
				res.redirect('/Q&A/read/' + contentnum);
			}
			connection.release();
		});
	});
});

// 글수정 화면 표시 GET
router.get('/reply', function(req, res, next) {
	var reply = req.query.reply;
	var contentnum = req.query.contentnum;
	var today = req.query.today;

	var data = [contentnum, reply, today];

	pool.getConnection(function(err, connection) {
		if(err) console.error("커넥션 객체 얻어오기 에러 : ",err);

		var sqlForInsertBoard = "INSERT INTO q_a_reply(contentnum, context, q_adate) values (?,?,?)";
		connection.query(sqlForInsertBoard, data, function(err, rows) {
			if(err) console.error(err);
			res.redirect('/Q&A/read/' + contentnum);
			connection.release();
		});
	});
});


// 글수정 화면 표시 GET
router.get('/reply_update', function(req, res, next) {
	var contentnum = req.query.contentnum;

	pool.getConnection(function(err, connection) {
		if(err) console.error("커넥션 객체 얻어오기 에러 : ",err);

		var sql = "SELECT * FROM q_a_reply WHERE contentnum=?";
		connection.query(sql, [contentnum], function(err, rows) {
			if(err) console.error(err);
			res.render('reply_update', {title:"Reply 수정", row:rows[0],user_id : req.session.user_id, department : req.session.department});
			connection.release();
		});
	});
});

// 글수정 로직 처리 POST
router.post('/reply_update', function(req, res, next) {
	var contentnum = req.body.contentnum;
	var context = req.body.context;
	var today = req.body.today;

	var data = [context, today, contentnum];
	console.log("??????????????????", context, today, contentnum);

	pool.getConnection(function(err, connection) {
		var sql = "UPDATE q_a_reply SET context=?, q_adate=? WHERE contentnum=?";
		connection.query(sql, data, function(err, result) {

			console.log(result);
			if(err) console.error("글 수정 및 에러 발생 err : ", err);

			if(result.affectedRpws == 0) {
			} else {
				res.redirect('/Q&A/read/' + contentnum);
			}
			connection.release();
		});
	});
});

router.post('/reply_delete', function (req, res, next) {

    var contentnum = req.body.contentnum;
    console.log("ssssssssssssssss", contentnum);
    pool.getConnection(function (err, connection) {
        if (err) console.error("object error : ", err);
        var sql = "DELETE FROM q_a_reply WHERE contentnum = ?";
        connection.query(sql, [contentnum], function (err, rows) {
            if (err) console.error(err);
            console.log("delete 확인 : ", rows);
            res.redirect('/Q&A/read/' + contentnum);
            connection.release();
        });

    });
});

module.exports = router;
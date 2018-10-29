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
	if(req.session.department == "manager") {
		res.redirect('/manager/main');
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}

});

router.get('/manager_list', function(req, res, next) {
	res.redirect('/manager/manager_list/1');
});

router.get('/manager_list/:page', function(req, res, next) {
	var page = req.params.page;
	var count;
	
	if(req.session.department == "manager") {
		if(!isNaN(Number(page))){
			pool.getConnection(function(err, connection) {
				if(err) console.error("커넥션 Q&A 에러 : ", err);
	
				var sqlCount = "SELECT count(*) as count FROM q_a";
				connection.query(sqlCount, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("Q&A error", rows);
						connection.release();
					}
					else{
						count = rows[0].count;
					}
				});
				
				var sql = "SELECT * FROM q_a LIMIT ?, 20";
				connection.query(sql, (page-1)*20, function(err, rows) {
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
								res.render('manager/manager_list', {title:'고객센터(Q&A)', count: count, rows:rows, row:row,user_id : req.session.user_id, department : req.session.department});
								connection.release();
	
							}
						});
					}
				});
			});
		}
		else
		{
			res.render('manager/manager_list');
		}
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}
});

router.get('/point', function(req, res, next) {
	res.redirect('/manager/point/1');
});

router.get('/point/:page', function(req, res, next) {
	var page = req.params.page;
	var count;
	
	if(req.session.department == "manager") {
		if(!isNaN(Number(page))){
			pool.getConnection(function(err, connection) {
				if(err) console.error("커넥션 Q&A 에러 : ", err);
	
				var sqlCount = "SELECT count(*) as count FROM point";
				connection.query(sqlCount, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager point error", rows);
						connection.release();
					}
					else{
						count = rows[0].count;
					}
				});
				
				var sql = "SELECT * FROM point LIMIT ?, 20";
				connection.query(sql, (page-1)*20, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager point error", rows);
						connection.release();
					}
					// else if(!rows.length) {
					// 	connection.release();
					// 	console.log("로그인 못한다!!!!!!", rows);
					// 	res.redirect('/login/error_page');
	
					// } 
					else {
						res.render('manager/point', {title:'Point', count: count, rows:rows, user_id : req.session.user_id, department : req.session.department});
						connection.release();
					}
				});
			});
		}
		else{
			res.render('manager/point');
		}
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}
	

});

router.get('/point_update', function(req, res, next) {
	var memberid = req.query.check_update;

	console.log("--------point_update GET----", memberid);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			var sql = "SELECT * FROM point WHERE memberid=?";
			connection.query(sql, memberid, function(err, rows) {
				if(err) {
					console.error(err);
					console.log("manager point error", rows);
					connection.release();
				}
				// else if(!rows.length) {
				// 	connection.release();
				// 	console.log("로그인 못한다!!!!!!", rows);
				// 	res.redirect('/login/error_page');

				// } 
				else {
					res.render('manager/point_update', {title:'Point', row:rows[0], user_id : req.session.user_id, department : req.session.department});
					connection.release();
				}
			});
		});
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}
	

});

router.post('/point_update', function(req, res, next) {
	var memberid = req.body.memberid;
	var point = req.body.point;
	var purchaseprice = req.body.purchaseprice;

	var data = [point, purchaseprice, memberid];

	console.log("--------point_update----", data);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);
			var sql = "UPDATE point SET point=?, purchaseprice=? WHERE memberid=?";
			connection.query(sql, data, function(err, rows) {
				if(err) {
					console.error(err);
					console.log("manager point_update error", rows);
					connection.release();
				}
				// else if(!rows.length) {
				// 	connection.release();
				// 	console.log("로그인 못한다!!!!!!", rows);
				// 	res.redirect('/login/error_page');

				// } 
				else {
					res.redirect('/manager/point');
					connection.release();
				}
			});
		});
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}
	

});

router.get('/main', function(req, res, next) {
	res.redirect('/manager/main/1');
});

router.get('/main/:page', function(req, res, next) {
	console.log("main 화면");
	var page = req.params.page;
	var count;
    
	if(req.session.department == "manager") {
		if(!isNaN(Number(page))){
			pool.getConnection(function(err, connection) {
				if(err) console.error("커넥션 로그인 에러 : ", err);
				var sqlCount = "SELECT count(*) as count FROM member";
				connection.query(sqlCount, (page-1)*20, function(err, rows) {
					if(err) {
						console.error(err);
						connection.release();
					}
					else if(!rows.length) {
						connection.release();
						console.log("가입자가 없습니다.");
						res.send('<script>alert("가입자가 없습니다.");history.back();</script>');
					}else{
						count = rows[0].count;
						console.log("회원 수는", count);
					}
				});
				
				var sql = "SELECT * FROM member LIMIT ?, 20";
				connection.query(sql, (page-1)*20, function(err, rows) {
					if(err) {
						console.error(err);
						connection.release();
					}
					else if(!rows.length) {
						connection.release();
						console.log("가입자가 없습니다.");
						// res.render('error_page', { title : '로그인 실패했습니다.'});
						res.send('<script>alert("가입자가 없습니다.");history.back();</script>');
					} else {
						console.log("유저들 정보!", rows);
						res.render('manager/main', {count: count, rows:rows});
						connection.release();
					}
				});
			});
		}
		else res.render('manager/main');
	}
	else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}
});

router.get('/product', function(req, res, next) {
	res.redirect('/manager/product/1');
});

router.get('/product/:page', function(req, res, next) {
	var page = req.params.page;
	var count;
	
	if(req.session.department == "manager") {
		if(!isNaN(Number(page))){
			pool.getConnection(function(err, connection) {
				if(err) console.error("커넥션 Q&A 에러 : ", err);

				var sqlCount = "SELECT count(*) as count FROM product";
				connection.query(sqlCount, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager product error", rows);
						connection.release();
					}
					else{
						count = rows[0].count;
					}
				});
				
				var sql = "SELECT * FROM product LIMIT ?, 20";
				connection.query(sql, (page-1)*20, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager product error", rows);
						connection.release();
					}
					// else if(!rows.length) {
					// 	connection.release();
					// 	console.log("로그인 못한다!!!!!!", rows);
					// 	res.redirect('/login/error_page');
	
					// } 
					else {
						var sql = "SELECT * FROM product_info";
						connection.query(sql, function(err, row) {
							if(err) {
								console.error(err);
								console.log("manager product error", row);
								connection.release();
							} else {
								res.render('manager/product', {title:'product', count: count, rows:rows, user_id : req.session.user_id, department : req.session.department, row:row});
								connection.release();		
							}
						});
						
					}
				});
			});
		}
		else res.render('manager/product');
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}

	

});

router.post('/member_delete', function(req, res, next) {
	var memberid = req.body.check_del;

	console.log("memberid delete", memberid);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			for(var i=0; i<memberid.length; i++) {
				var oneItem = memberid[i];
				var sql = "DELETE FROM member WHERE memberid=?";
				connection.query(sql, oneItem, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager member_delete error", rows);
						connection.release();
					}

				});
			}
			res.redirect('/manager');
			connection.release();
			
		});
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}

	

});

router.post('/q_a_delete', function(req, res, next) {
	var contentnum = req.body.check_del;

	console.log("q_a_delete delete", contentnum);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			for(var i=0; i<contentnum.length; i++) {
				var oneItem = contentnum[i];
				console.log("-------111111111111111111", oneItem);
				var sql_DEL = "DELETE FROM q_a WHERE contentnum=?";
				connection.query(sql_DEL, oneItem, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager q_a_delete error", rows);
						connection.release();
					}

				});
				
			}
			res.redirect('/manager/manager_list');
			connection.release();
			
		});
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}

	

});

router.post('/product_delete', function(req, res, next) {
	var productnum = req.body.check_del;

	console.log("product_delete", productnum);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			for(var i=0; i<productnum.length; i++) {
				var oneItem = productnum[i];
				var sql = "DELETE FROM product WHERE productnum=?";
				connection.query(sql, oneItem, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager product_delete error", rows);
						connection.release();
					}

				});
				var sql = "DELETE FROM product_info WHERE productnum=?";
				connection.query(sql, oneItem, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager product_info_delete error", rows);
						connection.release();
					}

				});
			}
			res.redirect('/manager/product');
			connection.release();
			
		});
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}

	

});



router.get('/member_update', function(req, res, next) {
	var memberid = req.query.check_del;

	console.log("--------product_update GET----", memberid);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			var sql = "select * from member where memberid=?";
			connection.query(sql, memberid, function(err, rows) {
				if(err) {
					console.error(err);
					console.log("manager point error", rows);
					connection.release();
				}
				else {
					res.render('manager/member_update', {row:rows[0], user_id : req.session.user_id, department : req.session.department});
					connection.release();
				}
			});
		});
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}
	

});

router.post('/member_update', function(req, res, next) {
	var memberid = req.body.memberid;
	var sellerorbuyer = req.body.sellerorbuyer;
	var nickname = req.body.nickname;
	var passwd = req.body.passwd;
	var address = req.body.address;
	var phone = req.body.phone;
	var email = req.body.email;

	var data = [nickname, passwd, address, phone, sellerorbuyer, email, memberid];
	console.log("--------product_update seller----", data);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);
			var sql = "UPDATE member SET nickname=?, pw=?, address=?, phone=?, department=?, email=? WHERE memberid=?";
			connection.query(sql, data, function(err, rows) {
				if(err) {
					console.error(err);
					console.log("manager product_update error", rows);
					connection.release();
				}
				else {
					res.redirect('/manager/main');
					connection.release();
				}
			});
		});
	} else {
		res.send('<script>alert("관리자만 접근 가능합니다.");location.href="/";</script>');
	}
	

});



router.get('/product_update', function(req, res, next) {
	var productnum = req.query.check_del;

	console.log("--------product_update GET----", productnum);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			console.log("--------111111111111111111 GET----");
			var sql = "select * from product, product_info where product.productnum = ? and product_info.productnum = ?";
			connection.query(sql, [productnum, productnum], function(err, rows) {
				if(err) {
					console.error(err);
					console.log("manager point error", rows);
					connection.release();
				}
				else {
					console.log("--------22222222222222222222 GET----");
					res.render('manager/product_update', {title:'Point', row:rows[0], user_id : req.session.user_id, department : req.session.department});
					connection.release();
				}
			});
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}
	

});

router.post('/product_update', function(req, res, next) {
	var productnum = req.body.productnum;
	var sellerid = req.body.sellerid;
	var productname = req.body.productname;
	var company = req.body.company;
	var producttype = req.body.producttype;
	var s = req.body.s;
	var m = req.body.m;
	var l = req.body.l;
	var price = req.body.price;

	var data = [productname, company, productnum];
	var data2 = [producttype, s, m, l, price, productnum];

	console.log("--------product_update seller----", data, data2);

	if(req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);
			var sql = "UPDATE product SET productname=?, company=? WHERE productnum=?";
			connection.query(sql, data, function(err, rows) {
				if(err) {
					console.error(err);
					console.log("manager product_update error", rows);
					connection.release();
				}
				else {
					var sql = "UPDATE product_info SET producttype=?, s=?, m=?, l=?, price=? WHERE productnum=?";
					connection.query(sql, data2, function(err, rows) {
						if(err) {
							console.error(err);
							console.log("manager product_update error", rows);
							connection.release();
						}
						res.redirect('/manager/product');
						connection.release();
					});
					
				}
			});
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}
	

});

module.exports = router;
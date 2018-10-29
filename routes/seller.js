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
	if(req.session.department == "seller" || req.session.department == "manager") {
		res.redirect('/seller/product');
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}

});


router.get('/main', function(req, res, next) {
	console.log("main 화면");
	if(req.session.department == "seller" || req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 로그인 에러 : ", err);
			var sql = "SELECT * FROM member";
			connection.query(sql, function(err, rows) {
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
					res.render('seller/main', {rows:rows});
					connection.release();
				}
			});
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}

	

});

router.get('/product', function(req, res, next) {
	

	if(req.session.department == "seller" || req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);
			var sql = "select * from product, product_info where product.productnum = product_info.productnum and sellerid = ?";
			connection.query(sql, req.session.user_id, function(err, rows) {
				if(err) {
					console.error(err);
					console.log("manager product error", rows);
					connection.release();
				} 
				else {
					res.render('seller/product', {title:'product', rows:rows, user_id : req.session.user_id, department : req.session.department});
				
					
				}
			});
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}

	

});


router.post('/q_a_delete', function(req, res, next) {
	var contentnum = req.body.check_del;

	console.log("q_a_delete delete", contentnum);

	if(req.session.department == "seller" || req.session.department == "manager") {
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
			res.redirect('/seller/manager_list');
			connection.release();
			
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}

	

});

router.post('/product_delete', function(req, res, next) {
	var productnum = req.body.check_del;

	console.log("product_delete", productnum);

	if(req.session.department == "seller" || req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			for(var i=0; i<productnum.length; i++) {
				var oneItem = productnum[i];
				var sql = "DELETE FROM ranking WHERE productnum=?";
				connection.query(sql, productnum, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager ranking_delete error", rows);
						connection.release();
					}

				});
				var sql = "DELETE FROM product_info WHERE productnum=?";
				connection.query(sql, productnum, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager product_info_delete error", rows);
						connection.release();
					}

				});
				var sql = "DELETE FROM product WHERE productnum=?";
				connection.query(sql, productnum, function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager product_delete error", rows);
						connection.release();
					}

				});
			}
			res.redirect('/seller/product');
			connection.release();
			
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}

	

});


router.get('/product_update', function(req, res, next) {
	var productnum = req.query.check_del;

	console.log("--------product_update GET----", productnum);

	if(req.session.department == "manager" || req.session.department == "seller") {
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
					res.render('seller/product_update', {title:'Point', row:rows[0], user_id : req.session.user_id, department : req.session.department});
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

	if(req.session.department == "manager" || req.session.department == "seller") {
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
						res.redirect('/seller/product');
						connection.release();
					});
					
				}
			});
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}
	

});


router.get('/product_review', function(req, res, next) {
	var user_id = req.session.user_id;

	console.log("--------product_update GET----", user_id);

	if(req.session.department == "manager" || req.session.department == "seller") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			var sql = "select distinct * from product, review where product.productnum = review.productnum and product.sellerid = ?";
			connection.query(sql, user_id, function(err, rows) {
				if(err) {
					console.error(err);
					console.log("manager point error", rows);
					connection.release();
				}
				else {
					res.render('seller/product_review', {rows:rows, user_id : req.session.user_id, department : req.session.department});
					connection.release();
				}
			});
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}
	

});

router.post('/product_review_delete', function(req, res, next) {
	var productnum = req.body.check_del;
	var purchasenum = req.body.purchasenum;

	

	console.log("product_review_delete", productnum, purchasenum);

	if(req.session.department == "seller" || req.session.department == "manager") {
		pool.getConnection(function(err, connection) {
			if(err) console.error("커넥션 Q&A 에러 : ", err);

			for(var i=0; i<productnum.length; i++) {
				var oneItem = productnum[i];
				var twoItem = purchasenum[i];
				var sql = "DELETE FROM review WHERE productnum=? and purchasenum=?";
				connection.query(sql, [oneItem, twoItem], function(err, rows) {
					if(err) {
						console.error(err);
						console.log("manager product_delete error", rows);
						connection.release();
					}

				});
			}
			res.redirect('/seller/product_review');
			connection.release();
			
		});
	} else {
		res.send('<script>alert("로그인 후 이용해주세요");location.href="/";</script>');
	}

	

});


module.exports = router;
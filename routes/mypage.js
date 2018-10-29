var express = require('express');
var router = express.Router();

//MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'localhost',
	user: 'root',
	database: 'testshop',
	password:'ghkdlxld',
	dateStrings: 'date'
});

/* 마이페이지 GET */
router.get('/', function(req, res, next){
    var user = req.session.user_id;
    var user_login = '';
    console.log('req session', req.session);
    try {
        if(req.session.user_id) {
            console.log("여길들어온다고?????????????");
            user_login = req.session.user_id;
        }
    } catch(e) {}

    if(user_login == '') {
        console.log("로그인 안된거.......!!!!!!");
        res.send('<script>alert("해당 기능 사용을 위해서는 로그인 해주세요");location.href="/login";</script>');
    } else {

    	var memberid = req.session.user_id;

    	pool.getConnection(function(err, connection){
    		//Use the connection
    		var sqlQuery = "SELECT Member.memberid, nickname, point, purchaseprice " +
    				"FROM Member JOIN Point ON Member.memberid = Point.memberid " +
    				"WHERE Member.memberid = ?";
    		connection.query(sqlQuery, memberid, function(err, row){
    			if(err) console.error("err : " + err);
    			console.log("rows : " + JSON.stringify(row));
    			
    			if(!row.length) {
                    res.send("<script>alert('회원 정보를 확인해주세요.');history.back();</script>");
                } else {
    				res.render('mypage', {title: "마이페이지", row: row[0],user_id : req.session.user_id, department : req.session.department });
    			}
    			
    			// Don't use the connection here, it has been returned to the pool.
    		});
    	});
    }
});

/* 회원탈퇴 GET */
router.get('/withdraw', function(req, res, next){
	res.render('withdraw', {title: '회원탈퇴',user_id : req.session.user_id, department : req.session.department });
});

/* 회원탈퇴 POST */
router.post('/withdraw', function(req, res, next){
	var memberid = req.session.user_id;
	var passwd = req.body.passwd;

	pool.getConnection(function(err, connection){
		//Use the connection
		var sqlQuery = "DELETE FROM Member WHERE memberid = ? and pw = ?";
		connection.query(sqlQuery, [memberid, passwd], function(err, result){
			console.log(result);
			if(err) console.error("회원탈퇴 중 에러 발생 : " + err);
			
			if(result.affectedRows == 0){
				res.send("<script>alert('비밀번호를 확인해주세요.');history.back();</script>");
			}
			else{
				
				req.session.destroy(function(err) {
					if(err) console.error('err', err);
					res.send("<script>alert('정상적으로 탈퇴 되었습니다.');document.location.href='/';</script>");
				});
			}
			connection.release();
			
			// Don't use the connection here, it has been returned to the pool.
		});
	});
});

/* 장바구니 GET */
router.get('/cart/', function(req, res, next){
	var memberid = req.session.user_id;

	pool.getConnection(function(err, connection){
		//Use the connection
		var sqlQuery = "SELECT cart.productnum, productname, size, price, sale " +
				"FROM Product INNER JOIN Product_info ON Product.productnum = Product_info.productnum " +
				"INNER JOIN Cart ON Cart.productnum = Product.productnum " +
				"WHERE Cart.memberid = ?";
		connection.query(sqlQuery, memberid, function(err, rows){
			if(err) console.error("err : " + err);
			console.log("rows : " + JSON.stringify(rows));
			
			if(rows){
				res.render('cart', {title: "장바구니", rows: rows,user_id : req.session.user_id, department : req.session.department });
				connection.release();
			}

			else{
				res.send("<script>alert('회원 정보를 확인해주세요.');history.back();</script>");
			}
			// Don't use the connection here, it has been returned to the pool.
		});
	});
});

/* 장바구니 POST */
router.post('/cart/delete', function(req, res, next){
	var memberid = req.session.user_id;
	if(req.body.num_of_products < 2){
		var productnum = req.body.productnum;
		var size = req.body.size;
	}
	else{
		var productnum = req.body.productnum[req.body.deleteBtn];
		var size = req.body.size[req.body.deleteBtn];
	}
	var datas = [memberid, productnum, size];

	pool.getConnection(function(err, connection){
		//Use the connection
		console.log(datas);
		var sqlQuery = "DELETE FROM Cart WHERE memberid = ? and productnum = ? and size = ?";
		connection.query(sqlQuery, datas, function(err, result){
			console.log(result);
			if(err) console.error("상품 삭제 중 에러 발생 : " + err);
			
			else if(result.affectedRows == 0){
				res.send("<script>alert('상품을 삭제하는데 오류가 발생하였습니다.');history.back();</script>");
			}
			else{
				res.send("<script>alert('상품이 삭제되었습니다.');document.location.href='/mypage/cart';</script>");
			}
			connection.release();
			
			// Don't use the connection here, it has been returned to the pool.
		});
	});
});

/*
 * 2016/05/17
 * 박래현 - 위시리스트->장바구니 기능 추가
 */
router.post('/wishlist/toCart', function(req, res, next){
	var num_of_products = req.body.num_of_products;
	var memberid = req.session.user_id;
	var productnum = req.body.productnum;
	var size = req.body.size;
	var selected = req.body.selected;
	
	console.log(req);

	pool.getConnection(function(err, connection){
		//Use the connection
		var deleteQuery = "DELETE FROM Wishlist WHERE memberid = ? and productnum = ? and size = ?";
		var insertQuery = "INSERT INTO Cart (memberid, productnum, size) VALUES (?, ?, ?)";
		
		//상품이 여러개일 때
		if(num_of_products > 1){
			for(var i = 0; i < num_of_products; i++){
				if(selected[i] == "true"){	//선택된 상품만 진행
					connection.query(deleteQuery, [memberid, productnum[i], size[i]], function(err, result){
						console.log(result);
						if(err) console.error("상품 삭제 중 에러 발생 : " + err);
						
						if(result.affectedRows == 0){
							console.log("124215125251252");
							res.send("<script>alert('상품을 장바구니로 옮기는데 오류가 발생하였습니다.');history.back();</script>");
						}
					});
					
					connection.query(insertQuery, [memberid, productnum[i], size[i]], function(err, rows){
						if(err) console.error("상품 입력 중 에러 발생 : " + err);
					});
				}
			}
		}
		
		//상품이 한 개일 때
		else{
			if(selected == "true"){	//선택된 상품만 진행
				connection.query(deleteQuery, [memberid, productnum, size], function(err, result){
					console.log(result);
					if(err) console.error("상품 삭제 중 에러 발생 : " + err);
					
					if(result.affectedRows == 0){
						res.send("<script>alert('상품을 장바구니로 옮기는데 오류가 발생하였습니다.');history.back();</script>");
					}
				});
				
				connection.query(insertQuery, [memberid, productnum, size], function(err, rows){
					if(err) console.error("상품 입력 중 에러 발생 : " + err);
				});
			}
		}
		
		res.send("<script>alert('선택된 상품이 이동되었습니다.');document.location.href='/mypage/cart';</script>");
		connection.release();
		
		// Don't use the connection here, it has been returned to the pool.
	});
});

router.get('/modify', function (req, res, next) {
    var memberid = req.session.user_id;

    pool.getConnection(function (err, connection) {
        if (err) console.error("Ŀ�ؼ� ��ü ������ ���� : ", err);

        var sql = "select memberid, nickname, pw, address, phone, email from Member where memberid=?";
        connection.query(sql, [memberid], function (err, rows) {
            if (err) console.error(err);
            console.log(memberid);
            console.log("modify���� 1�� �� ��ȸ ��� Ȯ�� : ", rows);
            res.render('modify', { title: "MODIFY", row: rows[0] ,user_id : req.session.user_id, department : req.session.department });
        });
    });
});

router.post('/modify', function (req, res, next) {

    var memberid = req.session.user_id;
    var nickname = req.body.nickname;
    var pw = req.body.pw;
    var address = req.body.address;
    var phone = req.body.phone;
    var email = req.body.email;

    pool.getConnection(function (err, connection) {

        var sql = "update member set  nickname=?, pw=? ,address=? , phone =?, email=? where memberid = ? ";
        connection.query(sql, [nickname, pw,address, phone, email,memberid], function (err, result) {
            console.log(result);
            if (err) console.error("�� ���� �� ���� �߻� err : ", err);

            if (result.affectedRows == 0) {
                res.send("<script>alert('error.');history.back();</script>");

            }
            else if (!result.length) {
                res.redirect('/mypage/cart');

            }
            else {
                res.redirect('/mypage/cart');
            }
            connection.release();
        });
    });
});



router.get('/q_a', function (req, res, next) {
    var memberid = req.session.user_id;

    pool.getConnection(function (err, connection) {
        if (err) console.error("Ŀ�ؼ� ��ü ������ ���� : ", err);

        var sql = "SELECT contentnum, memberid, title, context, passwd, q_adate FROM q_a  WHERE memberid=?";
        connection.query(sql, [memberid], function (err, rows) {
            if (err) console.error(err);
            else if (!rows.length) {
                res.send("<script>alert('There is no Q&A.');history.back();</script>");

            }
            console.log(memberid);
            console.log("rows : " + JSON.stringify(rows));
            res.render('q_a', { title: 'Q&A', rows: rows ,user_id : req.session.user_id, department : req.session.department });
            connection.release();
        });
    });
});
router.get('/mypurchase', function (req, res, next) {
    var memberid = req.session.user_id;

    pool.getConnection(function (err, connection) {
        if (err) console.error("Ŀ�ؼ� ��ü ������ ���� : ", err);

        var sql = "SELECT purchase_list.purchasenum,purchase_list.memberid,purchase_list.productnum,purchase_list.size,purchase_list.delivery,purchase_list.purchasedate,product.productname from Purchase_list inner join product on purchase_list.productnum=product.productnum WHERE purchase_list.memberid=?";
        connection.query(sql, [memberid], function (err, rows) {
            if (err) console.error(err);
            else if (!rows.length) {
                res.redirect('/mypage');

            }
            console.log(memberid);
            console.log("rows : " + JSON.stringify(rows));
            res.render('mypurchase', { title: 'Purchase List', rows: rows ,user_id : req.session.user_id, department : req.session.department });
            connection.release();
        });
    });
});
router.get('/mywishlist', function (req, res, next) {
    var memberid = req.session.user_id;

    pool.getConnection(function (err, connection) {
        if (err) console.error("Ŀ�ؼ� ��ü ������ ���� : ", err);

        var sql = "SELECT memberid, product.productnum, product.productname, size FROM wishlist JOIN product ON wishlist.productnum = product.productnum WHERE memberid=?";
        connection.query(sql, [memberid], function (err, rows) {
            if (err) console.error(err);
            else if (!rows.length) {
                res.redirect('/mypage');

            }
            console.log(memberid);
            console.log("rows : " + JSON.stringify(rows));
            res.render('mywishlist', { title: 'wishlist', rows: rows ,user_id : req.session.user_id, department : req.session.department });
            connection.release();
        });
    });
});

router.post('/wishlist/delete', function (req, res, next) {
	var num_of_products = req.body.num_of_products;
	var memberid = req.session.user_id;
	var productnum = req.body.productnum;
	var size = req.body.size;
	var selected = req.body.selected;
	
	console.log(req.body);

	pool.getConnection(function(err, connection){
		//Use the connection
		var deleteQuery = "DELETE FROM wishlist WHERE memberid = ? and productnum = ? and size = ?";
		
		//상품이 여러개일 때
		if(num_of_products > 1){
			for(var i = 0; i < num_of_products; i++){
				if(selected[i] == "true"){	//선택된 상품만 진행
					connection.query(deleteQuery, [memberid, productnum[i], size[i]], function(err, result){
						console.log(result);
						if(err) console.error("상품 삭제 중 에러 발생 : " + err);

						if(result.affectedRows == 0){
							res.send("<script>alert('상품을 삭제하는데 오류가 발생하였습니다.');history.back();</script>");
						}
					});
				}
			}
		}
		
		//상품이 한 개일 때
		else{
			if(selected == "true"){	//선택된 상품만 진행
				connection.query(deleteQuery, [memberid, productnum, size], function(err, result){
					console.log(result);
					if(err) console.error("상품 삭제 중 에러 발생 : " + err);
					
					if(result.affectedRows == 0){
						res.send("<script>alert('상품을 삭제하는데 오류가 발생하였습니다.');history.back();</script>");
					}
				});
			}
		}
		
		res.send("<script>alert('선택된 상품이 삭제되었습니다.');document.location.href='/mypage/mywishlist';</script>");
		connection.release();
		
		// Don't use the connection here, it has been returned to the pool.
	});
});



router.get('/myq_a/:contentnum', function (req, res, next) {
    var contentnum = req.params.contentnum;
    pool.getConnection(function (err, connection) {
 var sql = "SELECT contentnum, memberid, title, context, passwd, q_adate from q_a  contentnum=? ";
        connection.query(sql, [contentnum], function (err, row) {
            if (err) console.error(err);
            else if (!row.length) {
                res.redirect('/cart');

            }
            console.log("1�� �� ��ȸ ��� Ȯ�� : ", row);
            res.render('q_acontent', { title: "Read", row: row[0] ,user_id : req.session.user_id, department : req.session.department });
            connection.release();
        });
    });
});

router.post('/q_acontent', function (req, res, next) {
    var contentnum = req.body.contentnum;
    var passwd1 = req.body.passwd;

    pool.getConnection(function (err, connection) {
        var sql = "SELECT contentnum, memberid, title, context, passwd, q_adate from q_a where passwd=? and contentnum=? ";
        console.log("passwd" ,passwd1);
        connection.query(sql, [ passwd1,contentnum], function (err, result) {


            if (result.affectedRows == 0) {
                res.send("<script>alert('password is not equal.');history.back();</script>");
            }
            else if (!result.length) {
                res.send("<script>alert('password is not equal.');history.back();</script>");
                res.redirect('/mypage');

            }
            else {
                res.redirect('/mypage/read/'+contentnum);
            }
            connection.release();
        });
    });
});
router.get('/read', function (req, res, next) {
    var contentnum = req.params.contentnum;
    pool.getConnection(function (err, connection) {
        var sql = "SELECT contentnum, memberid, title, context, passwd, q_adate FROM  q_a WHERE contentnum=?";
        console.log(contentnum);
        connection.query(sql, [contentnum], function (err, row) {
            if (err) console.error(err);
            else if (!row.length) {
                res.redirect('/mypage');

            }
            console.log("1�� �� ��ȸ ��� Ȯ�� : ", row);
            res.render('read', { title: "Read", row: row[0] ,user_id : req.session.user_id, department : req.session.department });
            connection.release();
        });
    });
});

router.post('/purchase_completion', function(req, res, next){
    console.log("hahahaa");
    var from = req.body.from;
    var price = req.body.price;
    var point=0;
    var num_of_products = req.body.num_of_products;
    var memberid = req.session.user_id;
    var productnum = req.body.productnum;
    var size = req.body.size;
    var selected = req.body.selected;
   
   console.log("point : " + point);

    pool.getConnection(function(err, connection){
       //Use the connection
    var deleteQuery = "DELETE FROM cart WHERE memberid = ? and productnum = ? and size = ?";
    var updateQuery = "UPDATE point SET point=point+?, purchaseprice=purchaseprice+? WHERE  memberid=?";
    var insertQuery = "INSERT INTO purchase_list (memberid, productnum, size, delivery, purchasedate) VALUES (?, ?, ?, 2500, '2016-05-17')";
    var s_jaegoQuery = "UPDATE product_info SET s=s-1 WHERE productnum=?";
    var m_jaegoQuery = "UPDATE product_info SET m=m-1 WHERE productnum=?";
    var l_jaegoQuery = "UPDATE product_info SET l=l-1 WHERE productnum=?";
    var salenumQuery = "UPDATE ranking SET salenumber=salenumber+1 WHERE productnum=?";

       //상품이 여러개일 때
       if(num_of_products > 1){
          for(var i = 0; i < num_of_products; i++){
          
             if(selected[i] == "true"){   //선택된 상품만 진행
             // point[i]=price*0.05;
             connection.query(salenumQuery, productnum[i], function(err, result){
                if(err) console.error("ranking salmenum++ 중 에러 발생 : " + err);
             });
                connection.query(deleteQuery, [memberid, productnum[i], size[i]], function(err, result){
                   //console.log(result);
                   if(err) console.error("상품 삭제 중 에러 발생 : " + err);
                   
                   if(result.affectedRows == 0){
                      res.send("<script>alert('상품을 장바구니로 옮기는데 오류가 발생하였습니다.');history.back();</script>");
                   }
                });
                
                connection.query(updateQuery, [price[i]*0.05, price[i], memberid], function(err, rows){
                   if(err) console.error("상품 입력 중 에러 발생 : " + err);
                });
             connection.query(insertQuery, [memberid, productnum[i], size[i]], function(err, rows){
                   if(err) console.error("상품 입력 중 에러 발생 : " + err);
                });
             
             if(size[i]=="s")
             {
                connection.query(s_jaegoQuery, productnum[i], function(err, rows){
                if(err) console.error("s 입력 중 에러 발생 : " + err);
                });
             }
             else if(size[i]=="m")
             {
                connection.query(m_jaegoQuery, productnum[i], function(err, rows){
                if(err) console.error("m 입력 중 에러 발생 : " + err);
                });
             }
             else if(size[i]=="l")
             {
                connection.query(l_jaegoQuery, productnum[i], function(err, rows){
                if(err) console.error("l 입력 중 에러 발생 : " + err);
                });
             }
             }
          }
       }
       
       //상품이 한 개일 때
       else{
         
          if(selected == "true"){   //선택된 상품만 진행
           //point = price * 0.05;
         connection.query(salenumQuery, productnum, function(err, result){
                if(err) console.error("ranking salmenum++ 중 에러 발생 : " + err);
             });
         	if(from == "cart"){	//이전 페이지가 장바구니 일때는 장바구니 삭제
                connection.query(deleteQuery, [memberid, productnum, size], function(err, result){
                    //console.log(result);
                    if(err) console.error("상품 삭제 중 에러 발생 : " + err);
                    
                    if(result.affectedRows == 0){
                       res.send("<script>alert('상품을 장바구니로 옮기는데 오류가 발생하였습니다.');history.back();</script>");
                    }
                 });
         	}
              connection.query(updateQuery, [price*0.05, price, memberid], function(err, rows){
                if(err) console.error("상품 입력 중 에러 발생 : " + err);
             });
             connection.query(insertQuery, [memberid, productnum, size], function(err, rows){
                if(err) console.error("상품 입력 중 에러 발생 : " + err);
             });

          if(size=="s")
          {
             connection.query(s_jaegoQuery, productnum, function(err, rows){
             if(err) console.error("s 입력 중 에러 발생 : " + err);
             });
          }
          else if(size=="m")
          {
             connection.query(m_jaegoQuery, productnum, function(err, rows){
             if(err) console.error("m 입력 중 에러 발생 : " + err);
             });
          }
          else if(size=="l")
          {
             connection.query(l_jaegoQuery, productnum, function(err, rows){
             if(err) console.error("l 입력 중 에러 발생 : " + err);
             });
          }
          }
       }
       
       res.send("<script>alert('구매가 완료되었습니다');document.location.href='/mypage/mypurchase';</script>");
       connection.release();
       
       // Don't use the connection here, it has been returned to the pool.
    });
 });         

module.exports = router;
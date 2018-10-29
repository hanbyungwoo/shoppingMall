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

/* GET home page. */
router.get('/', function(req, res, next) {     
	console.log("!!!!!!!!!!!!!!",req.session.user_id);
	var length;
	
    pool.getConnection(function(err, connection) {
        var sql = "select product.productnum, producttype, price, sale, productname, sellerid, company, productdate, salenumber, image1 " +
        		"FROM product  JOIN product_info ON product.productnum = product_info.productnum " +
        		"JOIN ranking ON product_info.productnum = ranking.productnum ORDER BY salenumber DESC LIMIT 0, 9 ";
        connection.query(sql, function(err, rows){
           if(err) console.error(err);
           else if(!rows.length) {
              res.send("<script>alert('결과 없습니다.');history.back();</script>");
           } else {
              console.log(rows);
              length = rows.length;
              //console.log("1개 글 조회 결과 확인 : ", rows);
              res.render('index', {title:"슈나이퍼 샵", length: length, row:rows, user_id : req.session.user_id, department : req.session.department});
              connection.release();   
           } 
           
        });
    });
  
});



// router.post('/', function(req, res, next) {

//   var user = {
//     id : req.body.userid,
//     pswd : req.body.userpswd
//   };  // 사용자 요청 정보

//   var db = {
//     id : "userid",
//     pswd : "userpswd"
//   };  // 사용차 요청 id 와 일치하는 정보를 데이터베이스에서 불러옴

//   if(user.pswd === db.pswd){

//     // 비밀번호가 일치하는 경우
//     req.session.regenerate(function (err) {
//       if(err){
//         console.log(err);
//       } else {
//         req.session.user = user;
//         res.redirect('/login');
//       }
//     });

//   } else {

//     // 비밀번호가 일치하지 않는 경우
//     res.redirect('/');

//   }
// });

// router.get('/login', function(req, res, next) {

//   console.log(req.session.user);

//   if(req.session.user){

//     // 세션 아이디가 존재
//     res.render('login', { title: 'loginSession' });

//   } else {

//     // 세션 아이디가 존재하지 않음
//     res.redirect('/');

//   }
// });

// router.get('/logout', function(req, res, next) {

//   console.log(req.session.user);

//   req.session.destroy(function(err){
//     // 세션 정보 파괴
//     res.redirect('/');
//   })
// });

module.exports = router;

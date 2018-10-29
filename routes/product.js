var express = require('express');
var router = express.Router();

// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
   connectionLimit: 5,
   host: 'localhost',
   user: 'root',
   database: 'testshop',
   password:'ghkdlxld',
   dateStrings: 'date'
});

router.get('/', function(req, res, next) {
   res.redirect('/product/product_type/1');
});

router.get('/best9', function(req, res, next) {     
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
              res.render('best9', {title:"상품 조회", length: length, row:rows, user_id : req.session.user_id, department : req.session.department});
              connection.release();   
           } 
           
        });
    });

});

router.get('/product_type/:page', function(req, res, next) {
   pool.getConnection(function (err, connection) {
      var sqlForSelectList = "select distinct producttype from product_info;";
      connection.query(sqlForSelectList, function(err, rows) {
         if(err) console.error("err : " + err);
         //console.log("rows : " + JSON.stringify(rows));

         res.render('product_type', {title: '상품 type 조회', rows: rows,user_id : req.session.user_id, department : req.session.department});
         connection.release();
      });
   });
});

router.get('/product_list/:producttype', function(req, res, next) {
    var producttype = req.params.producttype;
    var page = req.params.page;
    
   res.redirect('/product/product_list/' + producttype + '/1');
});

router.get('/product_list/:producttype/:page', function(req, res, next) {

     var producttype = req.params.producttype;
     var page = req.params.page;
     var count;
     var length;
     
     if(!isNaN(Number(page))){
        pool.getConnection(function(err, connection) {
          var sqlCount = "SELECT count(*) as count FROM product_info WHERE producttype = ?";
            connection.query(sqlCount, [producttype], function(err, rows){
                if(err) console.error(err);
                
                count = rows[0].count;
             });
            var sql = "SELECT product.productname, product.productnum, price, sale, image1 " +
                  "FROM product INNER JOIN product_info ON product.productnum=product_info.productnum " +
                  "WHERE product_info.producttype=? " +
                  "LIMIT ?, 9";
            connection.query(sql, [producttype, (page-1)*9], function(err, rows){
               if(err) console.error(err);
   
               console.log(rows);
               length = rows.length;
               //console.log("1개 글 조회 결과 확인 : ", rows);
               res.render(producttype, {title:"상품 조회", count: count, length: length, row:rows, user_id : req.session.user_id, department : req.session.department});
               connection.release();
            });
        });
     }
     else res.render(producttype, {title: "상품 조회"});
});

router.get('/product_delete/:productnum', function(req, res, next){
   var productnum = req.params.productnum;
   //console.log(productnum);
   pool.getConnection(function(err, connection) {
      var sql = "delete from product_info where productnum=?";
      connection.query(sql, [productnum], function(err, rows){
         if(err) console.error(err);
         //console.log("1개 글 조회 결과 확인 : ", rows);
      });
      var sql = "delete from product where productnum=?";
      connection.query(sql, [productnum], function(err, rows){
         if(err) console.error(err);
         //console.log("1개 글 조회 결과 확인 : ", rows);
         res.redirect('/product/product_type/1');
         connection.release();
      });
   });
});

router.get('/product_detail/:productnum', function(req, res, next){
   var productnum = req.params.productnum;
   var department = req.session.department;
   //console.log(productnum);

   if(!isNaN(Number(productnum))){
	   pool.getConnection(function(err, connection) {
		      var sql = "SELECT product.sellerid, product.productnum, product.productname, product_info.producttype, product_info.price, " +
		            "product_info.sale, product.productdate, product_info.image1, product_info.image2 " +
		            "FROM product INNER JOIN product_info ON product.productnum=product_info.productnum " +
		            "WHERE product.productnum=?";
		      connection.query(sql, productnum, function(err, rows){
		         if(err) console.error(err);
		         console.log(rows);
		         //console.log("1개 글 조회 결과 확인 : ", rows);
		         res.render('product_detail', {title:"상품 상세 조회", rows:rows, department:department, user_id:req.session.user_id});
		         connection.release();
		      });
	   });
   }
   else res.render('product_detail', {title: "상품 상세 조회"});
});

router.get('/product_review/:productnum', function(req, res, next){
   var productnum = req.params.productnum;
   // console.log("------------------------",productnum);
   
   pool.getConnection(function(err, connection) {
      var sql = "select review.purchasenum, review.title, review.reviewdate, review.score, purchase_list.memberid from review inner join purchase_list on review.productnum=purchase_list.productnum where review.productnum=?";
      connection.query(sql, [productnum], function(err, rows){
         if(err) console.error(err);
         //console.log("1개 글 조회 결과 확인 : ", rows);
         res.render('product_review', {title:"Review 게시판", rows:rows, productnum:productnum,user_id : req.session.user_id, department : req.session.department});
         connection.release();
      });
   });
});

router.get('/product_review_content/:purchasenum', function(req, res, next){
   var purchasenum = req.params.purchasenum;
   console.log(purchasenum);

   pool.getConnection(function(err, connection) {
      var sqlForSelectList = "select * from purchase_list where purchasenum=?";
      connection.query(sqlForSelectList, [purchasenum], function(err, row){
         if(err) console.error(err);
         console.log("1개 글 조회 결과 확인 : ", row);

         var productnum = row[0].productnum;
            
         var sql = "select review.context, review.purchasenum, review.title, review.reviewdate, purchase_list.memberid from review inner join purchase_list on review.productnum=purchase_list.productnum where review.purchasenum=?";
         connection.query(sql, [purchasenum], function(err, rows){
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ", rows);
            res.render('product_review_content', {title:"Review 게시판 상세", rows:rows[0], user_id:req.session.user_id, department:req.session.department, productnum:productnum});
            connection.release();
         });

      });
      
   });
});

router.get('/review_write/:purchasenum', function(req, res, next) {

   var purchasenum = req.params.purchasenum;
   if(req.session.user_id === undefined) {
      res.send('<script>alert("해당 기능 사용을 위해서는 로그인 해주세요");location.href="/login";</script>');
   } else {
      pool.getConnection(function(err, connection) {
         var user_id = req.session.user_id;
         var sqlForSelectList = "select * from purchase_list where memberid=?";
         connection.query(sqlForSelectList, user_id, function(err, row){
            if(err) console.error(err);
            
            if(!row.length) {
               res.send('<script>alert("해당 물건을 구매하신 적이 없습니다.");history.back();</script>');
            } else {
               res.render('review_write', {title : "Review 쓰기", purchasenum:purchasenum,user_id : req.session.user_id, department : req.session.department});
            }
         });
      });
   }
});

router.post('/review_write/:purchasenum', function(req, res, next) {

   var purchasenum = req.params.purchasenum;
   var title = req.body.title;
   var content = req.body.content;
   var today = req.body.today;
   // var productnum;
   var score = req.body.score;

   var data;

// console.log("잠깐만.............1 ", productnum);

   pool.getConnection(function(err, connection) {
      var sqlForSelectList = "select * from purchase_list where purchase_list.productnum=?";
      connection.query(sqlForSelectList, purchasenum, function(err, row){
         if(err) console.error(err);
         console.log("잠깐만.............2 ",  row[0].productnum);
         // productnum = row[0].productnum;


         data = [row[0].productnum, purchasenum, content, title, today, score];

         console.log("data", data);

         var sql = "INSERT INTO review (productnum, purchasenum, context, title, reviewdate, score) VALUES (?,?,?,?,?,?)";
         connection.query(sql, data, function(err, rows){
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ", rows);
            
            connection.release();
         });

         var sql = "select * from point where memberid=?";
         connection.query(sql, req.session.user_id, function(err, rows){
            if(err) console.error(err);
            console.log("1개 글 조회 결과 확인 : ", rows);
            var point = rows[0].point;
            point = point + 10;
            var sql = "UPDATE point SET point=? where memberid=?";
            connection.query(sql, [point,req.session.user_id], function(err, rows){
               if(err) console.error(err);
               
               connection.release();
            });

         });

      res.redirect('/product/product_review/'+purchasenum);
      
      });
   });
   //res.render('review_write', {title : "Review 쓰기", purchasenum:purchasenum});

});

// 글수정 화면 표시 GET
router.get('/review_update', function(req, res, next) {
   var purchasenum = req.query.purchasenum;

   console.log("dddddddddddddddddddddddd", purchasenum);

   pool.getConnection(function(err, connection) {
      var sqlForSelectList = "select * from purchase_list where purchase_list.productnum=?";
      connection.query(sqlForSelectList, purchasenum, function(err, row){
         if(err) console.error(err);
         console.log("잠깐만.............review ",  row[0].productnum);


         var sql = "SELECT * FROM review WHERE purchasenum=? and productnum=?";
         connection.query(sql, [purchasenum, row[0].productnum], function(err, rows) {
            if(err) console.error(err);
            console.log("review에서 1개 글 조회 결과 확인 : ", rows);
            res.render('review_update', {title:"review 수정", member_id:row[0].memberid, row:rows[0],user_id : req.session.user_id, department : req.session.department});
         });
      });
   });
});

// 글수정 로직 처리 POST
router.post('/review_update', function(req, res, next) {
   var purchasenum = req.body.purchasenum;
   var productnum = req.body.productnum;
   var title = req.body.title;
   var context = req.body.context;
   var today = req.body.today;

   var datas = [title,context,today,productnum,purchasenum];

   pool.getConnection(function(err, connection) {
      var sql = "UPDATE review SET title=?, context=?, reviewdate=? WHERE productnum=? and purchasenum=?";
      connection.query(sql, datas, function(err, result) {

         console.log(result);
         if(err) console.error("글 수정 및 에러 발생 err : ", err);

         if(result.affectedRpws == 0) {
            res.send("<script>alert('잘못된 요청으로 인해 값이 변경되지 않았습니다.');history.back();</script>");
         } else {
            res.redirect('/product/product_review_content/' + purchasenum);
         }
         connection.release();
      });
   });
});

// 글수정 화면 표시 GET
router.get('/review_delete', function(req, res, next) {
   var purchasenum = req.query.purchasenum;
   var productnum = req.query.productnum;

   console.log("dddddddddddddddddddddddd", purchasenum);

   pool.getConnection(function(err, connection) {
      var sqlForSelectList = "delete from review where productnum=? and purchasenum=?";
      connection.query(sqlForSelectList, [productnum,purchasenum], function(err, row){
         if(err) console.error(err);
            console.log("잠깐만.............review delete");
         connection.release();
      });
   });
   res.redirect('/product/product_review/' + purchasenum);
});


router.get('/go_cart', function(req, res, next) {

   var productnum = req.query.productnum;
   var size = req.query.size;

   var memberid = req.session.user_id;

   if(memberid === undefined) {
      res.send('<script>alert("해당 기능 사용을 위해서는 로그인 해주세요");location.href="/login";</script>');
   } else {

      pool.getConnection(function(err, connection) {
         var sqlForSelectList = "insert into cart (memberid, productnum, size) values (?,?,?)";
         connection.query(sqlForSelectList, [memberid,productnum,size], function(err, row){
            if(err) console.error(err);
               console.log("잠깐만.............review delete");
            connection.release();
         });
      });
      res.redirect('/mypage/cart');   
   }

   
});

router.get('/go_wishlist', function(req, res, next) {

   var productnum = req.query.productnum;
   var size = req.query.size;

   var memberid = req.session.user_id;

   if(memberid === undefined) {
      res.send('<script>alert("해당 기능 사용을 위해서는 로그인 해주세요");location.href="/login";</script>');
   } else {

      pool.getConnection(function(err, connection) {
         var sqlForSelectList = "insert into wishlist (memberid, productnum, size) values (?,?,?)";
         connection.query(sqlForSelectList, [memberid,productnum,size], function(err, row){
            if(err) console.error(err);
               console.log("잠깐만.............review delete");
            connection.release();
         });
      });
      res.redirect('/mypage/mywishlist');   
   }

   
});


module.exports = router;
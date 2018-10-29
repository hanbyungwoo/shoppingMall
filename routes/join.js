var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var pool = mysql.createPool({
   connectionLimit:5,
   host:'localhost',
   user:'root',
   database:'testshop',
   password:'ghkdlxld'
});


router.get('/', function(req, res, next) {
    res.render('join', { title: '회원가입' , check: false ,user_id : req.session.user_id, department : req.session.department});
});
router.post('/', function(req, res, next) {
    var sellerormember = req.body.sellerorbuyer;
    var memberid = req.body.id;
    var nickname = req.body.name;
    var pw = req.body.passwd;
    var phone = req.body.tel;
    var people = req.body.people;
  
    var address = req.body.address;
    var email = req.body.email;
    var data = [sellerormember, memberid, nickname, pw, address, phone, email];

    console.log("ddd->:", sellerormember, memberid, nickname, pw, address, phone);
    if (sellerormember == null) {
        res.send("<script>alert('member 와 seller 선택해주세요.');history.back();</script>");
    }
    else {

        pool.getConnection(function (err, connection) {

            var sqlFor = "select memberid from member where memberid=?";
            connection.query(sqlFor, [memberid], function (err, rows) {
                if (err) console.error("err : " + err);
                console.log("rows : " + JSON.stringify(rows));

                if (!rows.length) {
                    console.log("아이디 사용가능");

                    var sqlPointSelect = "select point from point where memberid=?";
                    connection.query(sqlPointSelect, people, function (err, rows) {
                        if (err) {
                            console.error("err : " + err);
                        }
                        else if(!rows.length) { // 결과가 없었을 경우
                            res.send("<script>alert('추천인이 없습니다.');history.back();</script>");
                        } else {
                            rows[0].point = rows[0].point + 2000;
                            var sqlPointupdate = "update point set point=? where memberid=?";
                            connection.query(sqlPointupdate, [rows[0].point, people], function (err, row) {
                                if(err) {
                                    console.error("err : " + err);        
                                } else {
                                    // Use the connection
                                    var sqlForInsertBoard = "insert into member(department ,memberid, nickname, pw, address, phone, email) values (?,?,?,?,?,?,?)";
                                    connection.query(sqlForInsertBoard, data, function (err, rows) {
                                        if (err) console.error("err : " + err);
                                        console.log("rows : " + JSON.stringify(rows));

                                        var sqlForInsertPoint = "insert into point(memberid, point, purchaseprice) values (?,0,0)";
                                        connection.query(sqlForInsertPoint, memberid, function (err, rows) {
                                            if (err) console.error("err : " + err);
                                            console.log("rows : " + JSON.stringify(rows));
                                            res.redirect('/');
                                            connection.release();

                                            // Don't use the connection here, it has been returned to the pool
                                        });

                                        // Don't use the connection here, it has been returned to the pool
                                    });
                                }
                            });

                        }


                    });
                }
                else {

                    console.log("중복아이디 존재");
                    res.send("<script>alert('중복확인을 해주세요');history.back();</script>");

                }

            });
            
        });
    }

});

router.get('/check', function (req, res, next) {
    res.render('check', { title: 'check' ,user_id : req.session.user_id, department : req.session.department});
});
router.post('/check', function(req, res, next) {
   // res.render('check', { title: 'ID중복' });
    var memberid = req.body.memberid;
    var check = true;
    pool.getConnection(function (err, connection) {
        // Use the connection
        var sqlForInsertBoard = "select memberid from member where memberid=?";
        connection.query(sqlForInsertBoard, [memberid], function (err, rows) {
            if (err) console.error("err : " + err);
            console.log("rows : " + JSON.stringify(rows));

            if (!rows.length) {
                res.send("<script>alert('아이디 사용가능');history.back();</script>");
                res.render('join', { title: "id중복체크", rows: check });
            }
            else {
                check = false;
                console.log("중복아이디 존재");
                res.send("<script>alert('중복되는 아이디존재');history.back();</script>");
                res.render('join', { title: "id중복체크", rows: check });
            }
 //           res.redirect('/');
            connection.release();

            // Don't use the connection here, it has been returned to the pool
        });
    });
    


});

router.post('/join', function (req, res, next) {
    var sellerormember = req.body.sellerorbuyer;
   var memberid = req.body.id;
   var nickname = req.body.name;
   var pw = req.body.passwd;
   var phone = req.body.tel;
   var address = req.body.address;
   var email = req.body.email;
   var check = req.body.check;
   var data = [sellerormember,memberid, nickname, pw, address, phone, email];

   console.log("ddd->:",sellerormember, memberid, nickname, pw, address, phone);
   if (sellerormember == null) {
       res.send("<script>alert('member 와 seller 선택해주세요.');history.back();</script>");
   }
   if (check == false)
   {
       res.send("<script>alert('중복확인을 해주세요.');history.back();</script>");
   }

   else {
       pool.getConnection(function (err, connection) {
           // Use the connection
           var sqlForInsertBoard = "insert into member(department ,memberid, nickname, pw, address, phone, email) values (?,?,?,?,?,?,?)";
           connection.query(sqlForInsertBoard, data, function (err, rows) {
               if (err) console.error("err : " + err);
               console.log("rows : " + JSON.stringify(rows));

               res.redirect('/');
               connection.release();

               // Don't use the connection here, it has been returned to the pool
           });
       });
   }

});



module.exports = router;
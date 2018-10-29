var express = require('express');
var router = express.Router();
var multer = require('multer');
var multiparty = require('multiparty');
var fs = require('fs');

// MySQL 로드
var mysql = require('mysql');
var pool = mysql.createPool({
	connectionLimit: 5,
	host: 'localhost',
	user: 'root',
	database: 'testshop',
	password:'ghkdlxld'
});

router.get('/', function(req, res, next) {
	var seller = req.session.department;
	if(seller == "seller") {
		res.render('product_register', {title : "물품 등록",user_id : req.session.user_id, department : req.session.department});
	} else {
		res.send('<script>alert("판매자가 아닙니다.");history.back();</script>');
	}
});

router.post('/', function(req, res, next) {
	var form = new multiparty.Form();

	var productname;
	var sellerid;
	var company;
	var productdate;
	var producttype;
	var s;
	var m;
	var l;
	var price;
	var sale;
	
	var img_name1, img_name2;
	var img_names = [img_name1, img_name2];
	
	var fieldContainer = [productname, company, productdate, producttype, s, m, l, price, sale, sellerid];
	var datas1 = [productname,sellerid,company,productdate];
	var datas2 = [producttype,s,m,l,price,sale,img_name1,img_name2];
	
	var ii = 0;
	var i = 0;
	
	//get field name & value
	form.on('field', function(name, value){
		console.log('normal field / name = ' + name, 'value = ' + value);
		
		fieldContainer[ii++] = value;
		console.log(producttype, ii);
		console.log(fieldContainer);
		
		//필드를 모두 다 받았을 때 데이터 묶음
		if(ii == 9){
			productname = fieldContainer[0];
			company = fieldContainer[1];
			productdate = fieldContainer[2];
			producttype = fieldContainer[3];
			s = fieldContainer[4];
			m = fieldContainer[5];
			l = fieldContainer[6];
			price = fieldContainer[7];
			sale = fieldContainer[8];
			fieldContainer[ii] = req.session.user_id;
			sellerid = fieldContainer[9];
		}
	});
	
	//file upload handling
	form.on('part', function(part){
		var filename;
		var size;
		
		//console.log(part);
		
		if(part.filename){
			img_names[i] = part.filename;
			size = part.byteCount;
		}
		else{
			part.resume();
		}
		
		//console.log("Write Streaming file : " + filename);
		var writeStream = fs.createWriteStream("./public/images/" + producttype + "/" + img_names[i]);
		writeStream.filename = img_names[i++];
		part.pipe(writeStream);
		
		part.on('data', function(chunk){
			//console.log(filename + 'read' + chunk.length + 'bytes');
		});
		
		part.on('end', function(){
			//console.log(filename + ' Part read complete');
			writeStream.end();
		});
	});
	
	//all uploads are completed
	form.on('close', function(){
		img_name1 = img_names[0];
		img_name2 = img_names[1];
		datas1 = [productname,sellerid,company,productdate];
		datas2 = [producttype,s,m,l,price,sale,img_name1,img_name2];
		
		pool.getConnection(function (err, connection) {
			var sqlForSelectList = "INSERT INTO product(productname,sellerid,company,productdate) VALUES(?,?,?,?)";
			connection.query(sqlForSelectList,datas1, function(err, rows) {
				if(err) console.error("err : " + err);
				//connection.release();
			});
			var sqlForSelectList = "INSERT INTO product_info(producttype,s,m,l,price,sale,image1, image2) VALUES(?,?,?,?,?,?,?,?)";
			connection.query(sqlForSelectList,datas2, function(err, rows) {
				if(err) console.error("err : " + err);
				//console.log("rows : " + JSON.stringify(req.body));
	        });
			var sqlForSelectList = "INSERT INTO ranking(accumulatedscore, total, salenumber) VALUES(0, 0, 0)";
			connection.query(sqlForSelectList, function(err, rows) {
				if(err) console.error("err : " + err);
				//console.log("rows : " + JSON.stringify(req.body));
	
		         res.redirect('/product');
		         connection.release();
	        });
	   });
	});
	
	//track progress
	form.on('progress', function(byteRead, byteExpected){
		//console.log(' Reading total ' + byteRead + '/' + byteExpected);
	});
	
	form.parse(req);

});



module.exports = router;
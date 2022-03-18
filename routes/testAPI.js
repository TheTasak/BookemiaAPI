var express = require("express");
var mysql = require("mysql");
var bodyParser = require("body-parser");
var fileUpload = require("express-fileupload");
var router = express.Router();

var multer = require("multer");
var upload = multer({dest: "uploads/"});

const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'react_test'
});
connection.connect(error => {
	if(error) {
		throw error;
	}
});

router.get("/collection/:id", (req, res) => {
	const id = req.params.id;
	connection.query("SELECT b.id, b.title, b.authors, b.image_link FROM books AS b INNER JOIN book_collection ON book_collection.book_id=b.id WHERE book_collection.collection_id=?", [id], (err, rows, fields) => {
		if(err) {
			throw err;
		}
		res.send(rows);
	});
});
router.post("/book", upload.single('imgFile'), (req, res) => {
	var val = req.body;
	var collections = val.collection.split(",");
	console.log(collections);
	connection.query("INSERT INTO books (title, authors, publisher, publish_date, category, page_count, language, description, image_link) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
		val.title,
		val.authors,
		val.publisher,
		val.date,
		val.tags,
		val.pages,
		val.language,
		val.description,
		req.file.filename
	], (err, rows, fields) => {
		if(err) {
			throw err;
		} else {
			var id = rows.insertId;
			for(let i = 0; i < collections.length; i++) {
				connection.query("INSERT INTO book_collection (book_id, collection_id) VALUES (?, ?)", [
					id,
					collections[i]
				], (err, rows, fields) => {
					if(err) {
						throw err;
					}
				});
			}
		}
	});
});
router.get("/book/:id", (req, res) => {
	var id = req.params.id;
	connection.query("SELECT * FROM books WHERE id=?", id, (err, rows, fields) => {
		if(err) {
			throw err;
		} else {
			let object = rows[0];
			connection.query("SELECT collections.name FROM book_collection INNER JOIN collections ON collections.id=book_collection.collection_id WHERE book_collection.book_id=?", [id], (err, rows, fields) => {
				if(err) {
					throw err;
				}
				object.collections = rows.map(collection => collection.name);
				console.log(object);
				res.send(object);
			});
		}
	});
});
router.get("/collections", (req, res) => {
	connection.query("SELECT id, name FROM collections", (err, rows, fields) => {
		if(err) {
			throw err;
		}
		res.send(rows);
	});
});
module.exports = router;

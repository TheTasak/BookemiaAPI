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

router.get("/all", (req, res) => {
	connection.query("SELECT id, title, authors, image_link FROM books", (err, rows, fields) => {
		if(err) {
			throw err;
		}
		res.send(rows);
	});
});
router.post("/book", upload.single('imgFile'), (req, res) => {
	var val = req.body;
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
		}
	});
});
router.get("/book/:id", (req, res) => {
	var id = req.params.id;
	connection.query("SELECT * FROM books WHERE id=?", id, (err, rows, fields) => {
		if(err) {
			throw err;
		}
		res.send(rows[0]);
	});
});
module.exports = router;

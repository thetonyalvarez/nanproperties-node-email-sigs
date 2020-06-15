const express = require("express");
const router = express.Router();
const app = express();
const upload = require('express-fileupload')
const path = require('path');

app.use(upload())

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../views', 'agents-csv-upload.html'))
})

router.post('/', (req, res) => {
	if (req.files) {
		console.log(req.files)
		var file = req.files.file
		var filename = file.name
		console.log(filename)

		file.mv(path.join(__dirname, '../uploads', filename), function(err) {
			if (err) {
				res.send(err)
			} else {
				res.send("File Uploaded")
			}
		})
	}	
})

module.exports = router;

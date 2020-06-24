const express = require("express");
const router = express.Router();
const app = express();
const upload = require('express-fileupload')
const path = require('path');

router.use(upload())

router.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '../views', 'agents-csv-upload.html'))
})

router.post('/uploads', (req, res) => {
	if (req.files) {
		console.log(req.files)
		console.log(req.files.agentlist)
		const file = req.files.agentlist;
		const filename = file.name;
		console.log(filename)

		file.mv(path.join(__dirname, '../uploads', filename), function(err) {
			if (err) {
				res.send(err)
			} else {
				res.send("Success! Check the Resources page in 5 mins")
			}
		})
	}	
})

module.exports = router;

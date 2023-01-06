const express = require("express");
const multer = require('multer')

const PORT = process.env.PORT || 80;

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
	limits: {
        fileSize: 1000000 * 100 // 1000000 Bytes = 1 MB = 100 MB
	},
	fileFilter: function (req, file, callback) {
        var ext = path.extname(file.originalname);
        if(ext !== '.mp4' && ext !== '.mpeg' && ext !== '.webm') {
            return callback(new Error('Only videos are allowed with mp4, mov, mpeg, webm extensions'));
        }
        callback(null, true)
    },
    filename: function (req, file, cb) {
		let newName = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
        newName = newName
            .split(' ')
            .join('_')
            .toLowerCase();
        cb(null, Date.now() + '-' + newName)
    },
})
const upload = multer({ storage: storage })

app.post('/upload-video', upload.single('my-video'), (req, res) => {
	console.log(`Video uploaded: ${req.file.filename}`)
})

app.get("/api", (req, res) => {
	let videos = getMostRecentFile('./uploads')
	videos = videos.map(video => {
		video["channel"] = "Channel 1"
		video["description"] = "Description 1"
		return video
	})
	res.json({
		videos
		
	});
});

const fs = require("fs");
const path = require("path");

const getMostRecentFile = (dir) => {
  const files = orderReccentFiles(dir);
  return files.length ? [...files].splice(0,10) : undefined;
};

const orderReccentFiles = (dir) => {
  return fs.readdirSync(dir)
    .filter((file) => fs.lstatSync(path.join(dir, file)).isFile())
    .map((file) => ({ url: file, mtime: fs.lstatSync(path.join(dir, file)).mtime }))
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
};


app.use(express.static(path.resolve(__dirname, './client/build')));
app.use('/uploads/', express.static(path.resolve(__dirname, './uploads')));

  
// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
	res.sendFile(path.resolve(__dirname, './client/build', 'index.html'));
});

app.listen(PORT, () => {
console.log(`Server listening on ${PORT}`);
});

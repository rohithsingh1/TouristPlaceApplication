var multer = require('multer');
 module.exports = {
      upload : multer({ 
          storage:  multer.diskStorage({
            filename: function (req, file, callback) {
                callback(null, Date.now() + file.originalname);
              }
         }),
          fileFilter: function (req, file, cb) {
            // accept image files only
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
              return cb(new Error('Only image files are allowed!'), false);
            }
            cb(null, true);
          },
        }),
 }
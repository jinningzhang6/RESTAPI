const router = require('express').Router();
router.get('/submission/:filename', function(req, res){
  const file = `${__dirname}/uploads/${req.params.filename}`;
  res.download(file); // Set disposition and send it.
});


module.exports = router;

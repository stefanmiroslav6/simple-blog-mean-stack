var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Post = mongoose.model('Post');

router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts) {
		if(err) { return next(err); }
		var _posts = new Array();
		posts.forEach( function(_post) {
			_posts.push({ id:_post.id, title:_post.title, body:_post.body });
		});
		res.json(_posts);
	});
});

router.post('/posts/delete', function(req, res, next) {
	var rst = {result: false}
	if(req.body.id) {
		Post.findByIdAndRemove(req.body.id, function(err, doc) {
			if( err ) {
				console.log(err);
				return res.send(err);
			}
			rst.result = true;
			res.json(rst);
		});
	} else {
		res.json(rst);
	}
});

router.post('/posts', function(req, res, next) {
	if(req.body.title && req.body.body) {
		if(req.body.id == '') {
			var _post = new Post(req.body);
			_post.save(function (err, post) {
				if (err) {
					return next(err);
				}
				res.json(_post);
			});
		} else {
			Post.findByIdAndUpdate(req.body.id, { 'title':req.body.title, 'body':req.body.body }, function(err, doc) {
				if( err ) {
					console.log(err);
					return res.send(err);
				}
				res.json({result:true});
			});
		}
	}
});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Simple Blog' });
});

module.exports = router;

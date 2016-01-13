var mongoose = require('mongoose');

var postSchema = new mongoose.Schema({
	title: String,
	body: String,
})

mongoose.model('Post', postSchema);
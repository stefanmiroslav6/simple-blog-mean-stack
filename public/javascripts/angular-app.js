var app = angular.module('simpleBlog', ['ui.router']);

app.config(function($stateProvider, $urlRouterProvider) {

	$stateProvider.state('new', {
		url: '/posts/new',
		templateUrl: 'templates/edit.html',
		controller: 'editCtrl'
	});
	$stateProvider.state('edit', {
		url: '/posts/:id/edit',
		templateUrl: 'templates/edit.html',
		controller: 'editCtrl'
	});
	$stateProvider.state('show', {
		url: '/posts/:id/',
		templateUrl: 'templates/show.html',
		controller: 'showCtrl'
	});
	$stateProvider.state('index', {
		url: '/posts',
		templateUrl: 'templates/index.html',
		controller: 'indexCtrl'
	});

	$urlRouterProvider.otherwise('/posts');

});

app.service( 'Posts', function($http) {

	var posts = new Array();

	this.isValid = function(post) {
		return post.title!='' && post.body!='';
	}

	this.getPosts = function(callback) {
		$http
			.get('/posts')
			.then( function(rsp){
				posts = rsp.data;
				callback(posts);
			});
	}

	this.getPost = function(index, callback) {
		if(!posts.length) {
			this.getPosts(function(posts) {
				callback(posts[index]);
			});
		} else {
			callback(posts[index]);
		}
	}

	this.create = function(post, success, error) {
		if(this.isValid(post)) {
			post.id = '';
			$http.post('/posts', post).success(success).error(error);
			return true;
		}
		return false;
	}

	this.updateByIndex = function(index, post, success, error) {
		if(this.isValid(post) && index>=0 && index<posts.length) {
			post.id = posts[index].id;
			console.log(post);
			$http.post('/posts', post).success(success).error(error);
			return true;
		}
		return false;
	}

	this.delete = function(index, success, error) {
		if(index>=0 && index<posts.length) {
			var post = { id:posts[index].id };
			$http.post('/posts/delete', post).success(success).error(error);
		}
	}
});

app.controller('indexCtrl', function($scope, $state, Posts){

	$scope.dataReady = false;
	$scope.posts = new Array();

	function refreshPosts() {
		Posts.getPosts(function(posts) {
			$scope.posts = posts;
			$scope.dataReady = true;
		});
	}

	$scope.init = function() {
		refreshPosts();
	}

	$scope.deletePost = function(index) {
		Posts.delete(index, function() {
			refreshPosts();
		}, function() {
			alert('Failed');
		});
	}

});

app.controller('showCtrl', function($scope, $state, $stateParams, Posts){

	Posts.getPost($stateParams.id, function(post) {
		$scope.post = post;
	});

});

app.controller('editCtrl', function($scope, $state, $stateParams, Posts){

	$scope.current_index = $stateParams.id;
	$scope.dataReady = false;

	function isCreatingNew() {
		return ($scope.current_index < 0 || typeof $scope.current_index === 'undefined' );
	}

	function isFormFilled() {
		return ($scope.post.title!='' && $scope.post.body!='');
	}

	if(isCreatingNew()) {
		$scope.submit_caption = 'Create Post';
		$scope.post = { title:'', body:'' };
		$scope.dataReady = true;
	} else {
		$scope.submit_caption = 'Update Post';
		Posts.getPost($scope.current_index, function(post) {
			$scope.post = post;
			$scope.dataReady = true;
		});
	}

	$scope.updatePost = function() {
		if(isCreatingNew()) {
			if(isFormFilled()) {
				Posts.create($scope.post, function() {
					$state.go('index');
				}, function() {
					alert('Failed');
				});
			}
		} else {
			if(isFormFilled()) {
				Posts.updateByIndex($stateParams.id, $scope.post, function() {
					$state.go('index');
				}, function() {
					alert('Failed');
				});
			}
		}
	}

});
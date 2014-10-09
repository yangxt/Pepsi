var requireArray = [
	"controllers/controller",
	"views/tableView",
	"views/trendsCell",
	"views/imageCell",
	"helpers/serverRequest",
	"models/post",
	"controllers/commentsController",
	"controllers/userController"
];


define(requireArray, function(Controller, TableView, TrendsCell, ImageCell, ServerRequest, Post, CommentsController, UserController) {
var TrendsController = function() {
	Controller.call(this);

	this.$container.attr("id", "trendsController");
	this.$searchForm = $("<form>");
	this.$searchForm.appendTo(this.$container);
	this.$searchFieldDiv = $("<div>");
	this.$searchFieldDiv.appendTo(this.$searchForm);
	this.$searchField = $("<input>");
	this.$searchField.attr("type", "search");
	this.$searchField.attr("placeholder", "Search a tag");
	this.$searchField.appendTo(this.$searchFieldDiv);
	this.$glass = $("<div>");
	this.$glass.appendTo(this.$searchFieldDiv);
	this.tableView = new TableView();
	this.tableView.setCellsSpacing("12px");
	this.tableView.$container.attr("id", "tableView")
	this.tableView.$cellsContainer.attr("id", "cellsContainer");
	this.tableView.$container.appendTo(this.$container);
	this.postsRemaining = true;
	this.posts = [];
	this.postsByIds = {};
	this.usernameClicked = false;

	this.currentSearchTag = null;

	//Event Handlers
	this.tableView.on("didScrollToBottom", this._didScrollToBottom.bind(this));
	this.tableView.on("didSelectRow", this._didSelectRow.bind(this));
	this.tableView.on("rowIsVisible", this._rowIsVisible.bind(this));
	this.$searchForm.on("submit", this._didSearch.bind(this));

	notificationCenter.on("likeNotification", this._onLikeNotification.bind(this));
	notificationCenter.on("seenNotification", this._onSeenNotification.bind(this));
	notificationCenter.on("friendNotification", this._onFriendNotification.bind(this));
	notificationCenter.on("unfriendNotification", this._onUnfriendNotification.bind(this));
	notificationCenter.on("tagNotification", this._onTagNotification.bind(this));

	this.pushNewCells();
};

TrendsController.prototype = new Controller();

TrendsController.prototype.pushNewCells = function() {
	this.tableView.enterLoadingMode();
	var request = new ServerRequest();
	request.method = "GET";
	request.path = "posts/";
	if (this.posts.length != 0)
		request.queryParameters["last_id"] = this.posts[this.posts.length - 1].id;
	if (this.currentSearchTag)
		request.queryParameters["tag"] = this.currentSearchTag;

	request.onSuccess = function(json) {
		this.tableView.exitLoadingMode();
		var posts = json.posts;
		this.postsRemaining = posts.length == 10;
		for (var i in posts) {
			var post = Post.postFromJSONObject(posts[i]);
			this.posts.push(post);
			this.postsByIds[post.id] = post;
			if (this.currentSearchTag)
				var cell = new ImageCell(post);
			else
				var cell = new TrendsCell(post);

			cell.on("didClickLike", this._didClickLike.bind(this, cell, post));
			cell.on("didClickComment", this._didClickComment.bind(this, cell, post));
			cell.on("didClickTag", this._didClickTag.bind(this));
			cell.on("didClickUsername", this._didClickUsername.bind(this, post));

			this.tableView.pushCell(cell);
		}
		if (this.posts.length == 0 && !this.$noPostsMessage && !this.currentSearchTag) {
			this.$noPostsMessage = $("<p>");
			this.$noPostsMessage.html("No post yet.<br/>Be the first one!");
			this.$noPostsMessage.appendTo(this.$container);
		}
		else if (this.posts.length != 0 && this.$noPostsMessage)
			this.$noPostsMessage.remove();
	}.bind(this);
	request.onError = function(status, message) {
		this.tableView.exitLoadingMode();
		alert("Error", "The posts couldn't be loaded. Please check your internet connection.");
	}.bind(this);
	request.execute();
};


///////////////////////////////
// Private
//////////////////////////////

TrendsController.prototype._didScrollToBottom = function() {
	if (!this.tableView.loading && this.postsRemaining) {
		this.pushNewCells();
	}
};

TrendsController.prototype._didSelectRow = function(row) {
};

TrendsController.prototype._didClickLike = function(cell, post) {
	if (post.liked)
		return;

	post.liked = true;
	var request = new ServerRequest();
	request.path = "posts/" + post.id + "/likes";
	request.method = "POST";
	request.onSuccess = function(json) {
		post.likesCount++;
		cell.setLikesCount(cell.getLikesCount() + 1);
		cell.setLiked(true);
		notificationCenter.trigger("likeNotification", {postId: post.id, notifier: this});
	}.bind(this);
	request.onError = function(status, message) {
		if (status != 403) {
			post.liked = false;
		}
	}.bind(this);
	request.execute();
};

TrendsController.prototype._didClickComment = function(cell, post) {
	if (this.commentsController)
		return;
	var commentsController = new CommentsController(post);
	commentsController.$container.on("webkitTransitionEnd transitionend", function() {
        commentsController.$container.off("webkitTransitionEnd transitionend")
        commentsController.init();
    });
    commentsController.$container.appendTo(this.$container);

    //force reload of css
    commentsController.$container[0].offsetHeight;
    commentsController.$container.addClass("slide");

    commentsController.on("clickBack", function() {
        commentsController.$container.on("webkitTransitionEnd transitionend", function() {
            commentsController.$container.off("webkitTransitionEnd transitionend")
            commentsController.$container.remove();
            this.commentsController = null;
        }.bind(this));
       commentsController.$container.removeClass("slide");
    }.bind(this));
    this.commentsController = commentsController;
};

TrendsController.prototype._didClickTag = function(tag) {
	notificationCenter.trigger("tagNotification", {tag: tag, notifier: this});
}

TrendsController.prototype._didClickUsername = function(post) {
	if (this.usernameClicked)
        return;

    this.usernameClicked = true;
	var request = new ServerRequest();
	request.path = "users/" + post.ownerId;
	request.method = "GET";
	request.onSuccess = function(json) {
		var user = json;
    	var userController = new UserController(user);
    	userController.$container.on("webkitTransitionEnd transitionend", function() {
        	userController.$container.off("webkitTransitionEnd transitionend")
        	userController.init();
    	});
    	userController.$container.appendTo(this.$container);

    	//force reload of css
    	userController.$container[0].offsetHeight;
    	userController.$container.addClass("slide");

    	userController.on("clickBack", function() {
	        userController.$container.on("webkitTransitionEnd transitionend", function() {
    	        userController.$container.off("webkitTransitionEnd transitionend")
        	    userController.$container.remove();
            	this.usernameClicked = false;
        	}.bind(this));
       	userController.$container.removeClass("slide");
    	}.bind(this));
	}.bind(this);
	request.onError = function(status, message) {
		alert("Error", "Oups, something bad happened. Please try again");
	};
	request.execute();
};

TrendsController.prototype._didSearch = function() {
	this.$searchField.blur();
	var tag = this.$searchField.val();
	if (tag.length == 0)
		tag = null;
	else if (tag.charAt(0) != "#") {
		tag = "#" + tag;
	}

	if (tag == this.currentSearchTag)
		return false;

	this.currentSearchTag = tag;
	this.posts = [];
	this.tableView.removeAllRows();
	this.pushNewCells();
	return false;
}

TrendsController.prototype._rowIsVisible = function(row) {
	var post = this.posts[row];
	var cell = this.tableView.cellForRow(row);
	if (post.seen)
		return

	post.seen = true;
	var request = new ServerRequest();
	request.path = "posts/" + post.id + "/seens";
	request.method = "POST";
	request.onSuccess = function(json) {
		post.seensCount++;
		if (cell.setSeensCount)
			cell.setSeensCount(cell.getSeensCount() + 1);
		notificationCenter.trigger("seenNotification", {postId: post.id, notifier: this});
	}.bind(this);
	request.onError = function(status, message) {
		if (status != 403) {
			post.seen = false;
		}
	}.bind(this);
	request.execute();
};

TrendsController.prototype._onLikeNotification = function(notification) {
	if (notification.notifier == this)
		return;
	var post = this.postsByIds[notification.postId];
	if (post && !post.liked) {
		post.liked = true;
		post.likesCount++;
		var cell = this.tableView.cellForRow(this.posts.indexOf(post));
		cell.setLikesCount(cell.getLikesCount() + 1);
		cell.setLiked(true);
	}
};

TrendsController.prototype._onSeenNotification = function(notification) {
	if (notification.notifier == this)
		return;
	var post = this.postsByIds[notification.postId];
	if (post && !post.seen) {
		post.seen = true;
		post.seensCount++;
		var cell = this.tableView.cellForRow(this.posts.indexOf(post));
		if (cell.setSeensCount)
			cell.setSeensCount(cell.getSeensCount() + 1);
	}
};

TrendsController.prototype._onFriendNotification = function(notification) {
	for (var i in this.posts) {
		var post = this.posts[i];
		if (post.ownerId == notification.userId) {
			var cell = this.tableView.cellForRow(i);
			cell.setAvatarColor("#d32433");
		}
	}
};

TrendsController.prototype._onUnfriendNotification = function(notification) {
	for (var i in this.posts) {
		var post = this.posts[i];
		if (post.ownerId == notification.userId) {
			var cell = this.tableView.cellForRow(i);
			cell.setAvatarColor("#c7d20c");
		}
	}
};

TrendsController.prototype._onTagNotification = function(notification) {
	this.$searchField.val(notification.tag);
	this._didSearch();
};

return TrendsController;
});
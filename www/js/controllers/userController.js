var requireArray = [
	"controllers/controller",
	"views/tableView",
	"helpers/serverRequest",
	"views/imageCell",
	"models/post",
	"helpers/eventEmitter",
	"controllers/commentsController"
]

define(requireArray, function(Controller, TableView, ServerRequest, ImageCell, Post, EventEmitter, CommentsController) {
var UserController = function(user) {
	Controller.call(this);

	this.user = user;
	this.$container.attr("id", "userController");

	this.tableView = new TableView();
	this.tableView.$container.attr("id", "tableView");
	this.tableView.$cellsContainer.attr("id", "cellsContainer");
	this.tableView.$container.appendTo(this.$container);
	this.tableView.setCellsSpacing("12px");

	this.$header = $("<div>", {"id": "header"});
	this.tableView.setHeader(this.$header);

	this.$avatarWrapper = $("<div>", {"id": "avatarWrapper"});
	this.$avatarWrapper.appendTo(this.$header);

	if (this.user.friend)
		this.$avatarWrapper.css("background-color", "#d32433")
	else
		this.$avatarWrapper.css("background-color", "#c7d20c")

	this.$avatar = $("<div>", {"id": "avatar"});
	this.$avatar.appendTo(this.$avatarWrapper);

	this.$username = $("<p>", {"id": "username"});
	this.$username.appendTo(this.$header);
	this.$username.text("PAUL WALKER");

	this.$description = $("<p>", {"id": "description"});
	this.$description.appendTo(this.$header);
	this.$description.text("Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse imperdiet libero id neque fringilla, in.");
	this.$description.attr("maxlength", "100");

	this.$postsRect = $("<div>", {"id": "postsRect"});
	this.$postsRect.appendTo(this.$header);

	this.$postsCount = $("<span>", {"id": "postsCount"});
	this.$postsCount.text("54");
	this.$postsCount.addClass("rectText");
	this.$postsCount.appendTo(this.$postsRect);

	this.$postsText = $("<span>", {"id": "postsText"});
	this.$postsText.text("POSTS");
	this.$postsText.addClass("rectText");
	this.$postsText.appendTo(this.$postsRect);

	this.$likesRect = $("<div>", {"id": "likesRect"});
	this.$likesRect.appendTo(this.$header);

	this.$likesCount = $("<span>", {"id": "likesCount"});
	this.$likesCount.appendTo(this.$likesRect);
	this.$likesCount.addClass("rectText");
	this.$likesCount.text("134");

	this.$likesText = $("<span>", {"id": "likesText"});
	this.$likesText.appendTo(this.$likesRect);
	this.$likesText.addClass("rectText");
	this.$likesText.text("LIKES");

	this.$backButton = $("<button>", {"id": "backButton"});
	this.$backButton.appendTo(this.$container);
	this.$backButton.on("tapone", this._didClickBack.bind(this));

	this.$friendButton = $("<button>", {"id": "friendButton"});
	this.$friendButton.appendTo(this.$container);
	this.$friendIcon = $("<div>", {"id": "friendIcon"});
	this.$friendIcon.appendTo(this.$friendButton);
	this.$friendText = $("<div>", {"id": "friendText"});
	this.$friendText.appendTo(this.$friendButton);
	if (this.user.friend) {
		this.$friendText.text("REMOVE");
		this.$friendButton.on("tapone", this._didClickRemove.bind(this));
	}
	else {
		this.$friendText.text("ADD");
		this.$friendButton.on("tapone", this._didClickAdd.bind(this));
	}

	this.postsRemaining = true;
	this.posts = [];
	this.postsByIds = {};
	
	//Event Handlers
	this.tableView.on("didScrollToBottom", this._didScrollToBottom.bind(this));
	this.tableView.on("didSelectRow", this._didSelectRow.bind(this));
	this.tableView.on("rowIsVisible", this._rowIsVisible.bind(this));

	notificationCenter.on("likeNotification", this._onLikeNotification.bind(this));
	notificationCenter.on("seenNotification", this._onSeenNotification.bind(this));
	notificationCenter.on("unfriendNotification", this._onUnfriendNotification.bind(this));
	notificationCenter.on("friendNotification", this._onFriendNotification.bind(this));
	
	this.$username.text(this.user.name);
	this.$description.text(this.user.description);
	this.$likesCount.text(this.user.likes_count);
	this.$postsCount.text(this.user.posts_count);
	if (this.user.image_url) {
		this.$avatar.css("background-image", "url(" + this.user.image_url + ")");
		this.$avatar.addClass("withImage");
	}
}

UserController.prototype = $.extend({}, EventEmitter.prototype, UserController.prototype);

UserController.prototype.init = function() {
	this.initialized = true;
	this.pushNewCells();
}

UserController.prototype.pushNewCells = function() {
	this.tableView.enterLoadingMode();
	var request = new ServerRequest();
	request.method = "GET";
	request.path = "users/" + this.user.id + "/posts/";
	if (this.posts.length != 0)
		request.queryParameters["last_id"] = this.posts[this.posts.length - 1].id

	request.onSuccess = function(json) {
		this.tableView.exitLoadingMode();
		var posts = json.posts;
		this.postsRemaining = posts.length == 10;
		for (var i in posts) {
			var post = Post.postFromJSONObject(posts[i]);
			post.friend = this.user.friend;
			this.posts.push(post);
			this.postsByIds[post.id] = post;
			var cell = new ImageCell(post);
			cell.on("didClickLike", this._didClickLike.bind(this, cell, post));
			cell.on("didClickComment", this._didClickComment.bind(this, cell, post));
			cell.on("didClickTag", this._didClickTag.bind(this));
			this.tableView.pushCell(cell);
		}
	}.bind(this);
	request.onError = function(status, message) {
		this.tableView.exitLoadingMode();
		alert("Error", "The posts couldn't be loaded. Please check your internet connection.");
	}.bind(this);
	request.execute();
};


////////////////
// Private
///////////////

UserController.prototype._didScrollToBottom = function() {
	if (!this.tableView.loading && this.postsRemaining) {
		this.pushNewCells();
	}
};

UserController.prototype._didSelectRow = function(row) {

};

UserController.prototype._didClickLike = function(cell, post) {
	if (post.liked)
		return;

	post.liked = true;
	var request = new ServerRequest();
	request.path = "posts/" + post.id + "/likes";
	request.method = "POST";
	request.onSuccess = function(json) {
		cell.setLikesCount(cell.getLikesCount() + 1);
		cell.setLiked(true);
		notificationCenter.trigger("likeNotification", {postId: post.id, notifier: this});
	}.bind(this);
	request.onError = function(status, message) {
		if (status != 403) {
			post.like = false;
		}
	}.bind(this);
	request.execute();
};

UserController.prototype._didClickComment = function(cell, post) {
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

UserController.prototype._rowIsVisible = function(row) {
	var post = this.posts[row];
	var cell = this.tableView.cellForRow(row);
	if (post.seen)
		return

	post.seen = true;
	var request = new ServerRequest();
	request.path = "posts/" + post.id + "/seens";
	request.method = "POST";
	request.onSuccess = function(json) {
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

UserController.prototype._didClickAdd = function(event) {
	event.preventDefault();
	this.$friendButton.off("tapone");
	this.$backButton.off("tapone");
	var request = new ServerRequest();
	request.path = "me/friends/";
	request.method = "POST";
	request.body = JSON.stringify({
		friend: this.user.id
	});
	request.onSuccess = function(json) {
		notificationCenter.trigger("friendNotification", {userId: this.user.id, notifier: this});
	}.bind(this);
	request.onError = function(status, message) {
		this.$friendButton.on("tapone", this._didClickRemove.bind(this));
		this.$backButton.on("tapone", this._didClickBack.bind(this));
		alert("Error", "Oups, something bad happened. Please try again.");
	}.bind(this);
	request.execute();
};

UserController.prototype._didClickRemove = function(event) {
	event.preventDefault();
	this.$friendButton.off("tapone");
	this.$backButton.off("tapone");
	var request = new ServerRequest();
	request.path = "me/friends/" + this.user.id;
	request.method = "delete";
	request.onSuccess = function(json) {
		notificationCenter.trigger("unfriendNotification", {userId: this.user.id, notifier: this});
	}.bind(this);
	request.onError = function(status, message) {
		this.$friendButton.on("tapone", this._didClickAdd.bind(this));
		this.$backButton.on("tapone", this._didClickBack.bind(this));
		alert("Error", "Oups, something bad happened. Please try again.");
	}.bind(this);
	request.execute();
};

UserController.prototype._didClickBack = function() {
	this.$backButton.off("tapone");
	this.trigger("clickBack");
};

UserController.prototype._didClickTag = function(tag) {
	notificationCenter.trigger("tagNotification", {tag: tag, notifier: this});
};

UserController.prototype._onLikeNotification = function(notification) {
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

UserController.prototype._onSeenNotification = function(notification) {
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

UserController.prototype._onUnfriendNotification = function(notification) {
	if (notification.userId == this.user.id) {
		for (var i in this.posts) {
			this.posts[i].friend = false;
			var cell = this.tableView.cellForRow(i);
			cell.setAvatarColor("#c7d20c");
		}
		this.$avatarWrapper.css("background-color", "#c7d20c");
		this.user.friend = false;
		this.$friendText.text("ADD");
		this.$friendButton.off("tapone");
		this.$backButton.off("tapone");
		this.$friendButton.on("tapone", this._didClickAdd.bind(this));
		this.$backButton.on("tapone", this._didClickBack.bind(this));
	}
};

UserController.prototype._onFriendNotification = function(notification) {
	if (notification.userId == this.user.id) {
		for (var i in this.posts) {
			this.posts[i].friend = true;
			var cell = this.tableView.cellForRow(i);
			cell.setAvatarColor("#d32433");
		}
		this.$avatarWrapper.css("background-color", "#d32433");
		this.user.friend = true;
		this.$friendText.text("REMOVE");
		this.$friendButton.off("tapone");
		this.$backButton.off("tapone");
		this.$friendButton.on("tapone", this._didClickRemove.bind(this));
		this.$backButton.on("tapone", this._didClickBack.bind(this));
	}
};

return UserController;
});
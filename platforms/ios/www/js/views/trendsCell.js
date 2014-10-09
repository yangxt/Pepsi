var requireArray = [
	"helpers/eventEmitter"
];

define(requireArray, function(EventEmitter) {
function TrendsCell(post) {
	EventEmitter.call(this);

	/////////////////////////////////
	this._likesCount = 0;
	this._commentsCount = 0;
	/////////////////////////////////

	this.$container = $("<div>");
	this.$container.addClass("trendsCell-container");

	//Header
	this.$header = $("<header>");
	this.$header.addClass("trendsCell-header");
	this.$header.appendTo(this.$container);

	this.$headerSeparationLine = $("<div>");
	this.$headerSeparationLine.addClass("trendsCell-headerSeparationLine");
	this.$headerSeparationLine.appendTo(this.$header);

	this.$avatarWrapper = $("<div>");
	this.$avatarWrapper.addClass("trendsCell-avatarWrapper");
	this.$avatarWrapper.appendTo(this.$header);

	this.$avatar = $("<div>");
	this.$avatar.appendTo(this.$avatarWrapper);
	this.$avatar.addClass("trendsCell-avatar");

	this.$username = $("<p>");
	this.$username.addClass("trendsCell-username");
	this.$username.appendTo(this.$header);

	this.$date = $("<p>");
	this.$date.addClass("trendsCell-date");
	this.$date.appendTo(this.$header);

	this.$likesButton = $("<div>");
	this.$likesButton.addClass("trendsCell-likesButton");
	this.$likesButton.appendTo(this.$header);
	this.$likesButton.on("tapone", didClickLike.bind(this));

	this.$likesIcon = $("<div>");
	this.$likesIcon.addClass("trendsCell-likesIcon");
	this.$likesIcon.appendTo(this.$header);

	this.$likesCount = $("<p>");
	this.$likesCount.addClass("trendsCell-likesCount");
	this.$likesCount.appendTo(this.$header);

	this.$commentsButton = $("<div>");
	this.$commentsButton.addClass("trendsCell-commentsButton");
	this.$commentsButton.appendTo(this.$header);
	this.$commentsButton.on("tapone", didClickComment.bind(this));

	this.$commentsIcon = $("<div>");
	this.$commentsIcon.addClass("trendsCell-commentsIcon");
	this.$commentsIcon.appendTo(this.$header);

	this.$commentsCount = $("<p>");
	this.$commentsCount.addClass("trendsCell-commentsCount");
	this.$commentsCount.appendTo(this.$header);

	this.$usernameClickArea = $("<div>");
	this.$usernameClickArea.addClass("trendsCell-usernameClickArea");
	this.$usernameClickArea.appendTo(this.$header);
	this.$usernameClickArea.on("tapone", didClickUsername.bind(this));

	//Body
	this.$body = $("<div>");
	this.$body.addClass("trendsCell-body");
	this.$body.appendTo(this.$container);

	this.$text = $("<p>");
	this.$text.addClass("trendsCell-text");
	this.$text.appendTo(this.$body);

	this.$tags = $("<span>");
	this.$tags.addClass("trendsCell-tags");
	this.$tags.appendTo(this.$body);

	if (post) {
		if (post.likesCount != null)
			this.setLikesCount(post.likesCount);
		if (post.commentsCount != null)
			this.setCommentsCount(post.commentsCount);
		if (post.ownerName != null)
			this.setUsername(post.ownerName);
		if (post.creationDate != null)
			this.setDate(post.creationDate);
		if (post.text != null)
			this.setText(post.text);
		if (post.tags != null)
			this.setTags(post.tags);
		if (post.ownerImageUrl != null)
			this.setAvatar(post.ownerImageUrl);
		if (post.ownerFriend != null) {
			if (post.ownerFriend)
				this.setAvatarColor("#d32433");
			else
				this.setAvatarColor("#c7d20c");
		}
		this.setLiked(post.liked);
	}
}

TrendsCell.prototype = new EventEmitter();

TrendsCell.prototype.setAvatarColor = function(color) {
	this.$avatarWrapper.css("background-color", color);
};

TrendsCell.prototype.setLikesCount = function(count) {
	this._likesCount = count > 999 ? 999 : count;
	this.$likesCount.text(this._likesCount.toString());
};

TrendsCell.prototype.getLikesCount = function() {
	return this._likesCount;
};

TrendsCell.prototype.setLiked = function(liked) {
	if (liked)
		this.$likesIcon.addClass("full");
	else
		this.$likesIcon.removeClass("full");
}

TrendsCell.prototype.setCommentsCount = function(count) {
	this._commentsCount = count > 999 ? 999 : count;
	this.$commentsCount.text(this._commentsCount.toString());
};

TrendsCell.prototype.getCommentsCount = function() {
	return this._commentsCount;
};

TrendsCell.prototype.setUsername = function(username) {
	this.$username.text("By " + username.toUpperCase());
};

TrendsCell.prototype.setDate = function(date) {
	var now = new Date();
	if (now.getDate() == date.getDate() && now.getMonth() == date.getMonth() && now.getYear() == date.getYear()) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var minutesString = minutes.toString();
		if (minutes < 10)
			minutesString = "0" + minutesString;
		if (hours <= 12)
			var text = hours + ":" + minutesString + " AM";
		else 
			var text = hours - 12 + ":" + minutesString + " PM";
	}
	else {
		now.setHours(23);
		now.setMinutes(59);
		now.setSeconds(59);
		var msDifference = now - date.getTime();
		var daysDifference = Math.floor(msDifference / (1000.0 * 3600.0 * 24.0));
		var text = daysDifference + " JOUR";
		if (daysDifference != 1)
			text += "S";
	}
	this.$date.text(text);
};

TrendsCell.prototype.setText = function(text) {
	if (text.length > 300) {
		text = text.slice(0, 300);
		text += "...";
	}
	this.$text.text(text);
};

TrendsCell.prototype.setTags = function(tags) {
	for (var i in tags) {
		var tag = tags[i]
		var $button = $("<button>");
		$button.text(tag);
		$button.appendTo(this.$tags);
		$button.on("tapone", didClickTag.bind(this, tag))
	}
};

TrendsCell.prototype.setAvatar = function(imageUrl) {
	var image = new Image();
	image.onload = function() {
		this.$avatar.css("background-image", "url(" + imageUrl + ")");
		this.$avatar.addClass("withImage");
	}.bind(this);
	image.src = imageUrl;
};

TrendsCell.prototype.setSelected = function(selected) {
	if (selected) {
		this.$body.addClass("selected");
		this.$tags.addClass("selected");
		this.$text.addClass("selected");
	}
	else {
		this.$body.removeClass("selected");
		this.$tags.removeClass("selected");
		this.$text.removeClass("selected");
	}
}

///////////////////////////////
// Private
//////////////////////////////

function didClickLike(event) {
	alert("did like");
	event.stopPropagation();
	this.trigger("didClickLike");
}

function didClickComment(event) {
	event.stopPropagation();
	this.trigger("didClickComment");
}

function didClickTag(tag, event) {
	event.stopPropagation();
	this.trigger("didClickTag", tag);
}

function didClickUsername() {
	event.stopPropagation();
	this.trigger("didClickUsername");
}

return TrendsCell;

});
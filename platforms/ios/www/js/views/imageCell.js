var requireArray = [
	"helpers/eventEmitter",
	"views/spinner"
];

define(requireArray, function(EventEmitter, Spinner) {
function ImageCell(post) {
	EventEmitter.call(this);

	/////////////////////////////////
	this.likesCount = 0;
	this.commentsCount = 0;
	this.seensCount = 0;
	/////////////////////////////////

	this.$container = $("<div>", {"id": "imageCell"});
	this.$topContainer = $("<div>", {"id": "topContainer"});
	this.$topContainer.appendTo(this.$container);
	this.$topContainerRow = $("<div>");
	this.$topContainerRow.addClass("row");
	this.$topContainerRow.appendTo(this.topContainer);

	this.$bottomContainer = $("<div>", {"id": "bottomContainer"});
	this.$bottomContainer.appendTo(this.$container);
	
	this.$leftContainer = $("<div>", {"id": "leftContainer"});
	this.$leftContainer.appendTo(this.$topContainer);
	this.$rightContainer = $("<div>", {"id": "rightContainer"});
	this.$rightContainer.appendTo(this.$topContainer);

	//Header
	this.$header = $("<header>", {"id": "header"});
	this.$header.appendTo(this.$rightContainer);

	this.$avatarWrapper = $("<div>", {"id": "avatarWrapper"});
	this.$avatarWrapper.appendTo(this.$header);

	this.$avatar = $("<div>", {"id": "avatar"});
	this.$avatar.appendTo(this.$avatarWrapper);

	this.$username = $("<p>", {"id": "username"});
	this.$username.appendTo(this.$header);

	this.$date = $("<p>", {"id": "date"});
	this.$date.appendTo(this.$header);

	this.$usernameClickArea = $("<div>", {"id": "usernameClickArea"});
	this.$usernameClickArea.appendTo(this.$header);
	this.$usernameClickArea.on("tapone", didClickUsername.bind(this));

	//Body
	this.$body = $("<div>", {"id": "body"});
	this.$body.appendTo(this.$rightContainer);

	this.$text = $("<p>", {"id": "text"});
	this.$text.appendTo(this.$body);

	this.$tags = $("<span>", {"id": "tags"});
	this.$tags.appendTo(this.$body);

	//Footer

	this.$footer = $("<div>", {"id": "footer"});
	this.$footer.appendTo(this.$bottomContainer);

	this.$seensCount = $("<p>", {"id": "seensCount"});
	this.$seensCount.appendTo(this.$footer);

	this.$seensImage = $("<div>", {"id": "seensImage"});
	this.$seensImage.appendTo(this.$footer)

	this.$likesButton = $("<div>", {"id": "likesButton"});
	this.$likesButton.appendTo(this.$footer);
	this.$likesButton.on("tapone", didClickLike.bind(this));

	this.$likesIcon = $("<div>", {"id": "likesIcon"});
	this.$likesIcon.appendTo(this.$footer);

	this.$likesCount = $("<p>", {"id": "likesCount"});
	this.$likesCount.appendTo(this.$footer);

	this.$commentsButton = $("<div>", {"id": "commentsButton"});
	this.$commentsButton.appendTo(this.$footer);
	this.$commentsButton.on("tapone", didClickComment.bind(this));

	this.$commentsIcon = $("<div>", {"id": "commentsIcon"});
	this.$commentsIcon.appendTo(this.$footer);

	this.$commentsCount = $("<p>", {"id": "commentsCount"});
	this.$commentsCount.appendTo(this.$footer);

	this.$separationLine = $("<div>", {"id": "separationLine"});
	this.$separationLine.appendTo(this.$footer);

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
		if (post.imageUrl != null)
			this.setImage(post.imageUrl);
		if (post.seensCount != null)
			this.setSeensCount(post.seensCount);
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

ImageCell.prototype = new EventEmitter();

ImageCell.prototype.setAvatarColor = function(color) {
	this.$avatarWrapper.css("background-color", color);
};

ImageCell.prototype.setLikesCount = function(count) {
	this._likesCount = count > 999 ? 999 : count;
	this.$likesCount.text(this._likesCount.toString());
};

ImageCell.prototype.getLikesCount = function() {
	return this._likesCount;
};

ImageCell.prototype.setLiked = function(liked) {
	if (liked)
		this.$likesIcon.addClass("full");
	else
		this.$likesIcon.removeClass("full");
}

ImageCell.prototype.setCommentsCount = function(count) {
	this._commentsCount = count > 999 ? 999 : count;
	this.$commentsCount.text(this._commentsCount.toString());
};

ImageCell.prototype.getCommentsCount = function() {
	return this._commentsCount;
};

ImageCell.prototype.setSeensCount = function(count) {
	this._seensCount = count > 99999 ? 99999 : count;
	this.$seensCount.text(this._seensCount.toString());
};

ImageCell.prototype.getSeensCount = function() {
	return this._seensCount;
};

ImageCell.prototype.setUsername = function(username) {
	this.$username.text("By " + username.toUpperCase());
};

ImageCell.prototype.setDate = function(date) {
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

ImageCell.prototype.setText = function(text) {
	if (text.length > 300) {
		text = text.slice(0, 300);
		text += "...";
	}
	this.$text.text(text);
};

ImageCell.prototype.setTags = function(tags) {
	for (var i in tags) {
		var tag = tags[i]
		var $button = $("<button>");
		$button.text(tag);
		$button.appendTo(this.$tags);
		$button.on("tapone", didClickTag.bind(this, tag))
	}
};

ImageCell.prototype.setAvatar = function(imageUrl) {
	var image = new Image();
	image.onload = function() {
		this.$avatar.css("background-image", "url(" + imageUrl + ")");
		this.$avatar.addClass("withImage");
	}.bind(this);
	image.src = imageUrl;
};

ImageCell.prototype.setImage = function(imageUrl) {
	var image = new Image();
	var spinner = new Spinner();
	spinner.$container.addClass("spinner");
	spinner.$container.appendTo(this.$leftContainer);
	this.$leftContainer.css("background-image", "none");
	image.onload = function() {
		this.$leftContainer.css({"background-image": "url(" + imageUrl + ")", "background-size": "cover"});
		spinner.$container.remove();
	}.bind(this);
	image.src = imageUrl;
};

ImageCell.prototype.setSelected = function(selected) {
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

return ImageCell;

});
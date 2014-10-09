var requireArray = [
];

define(requireArray, function() {
function CommentCell(comment) {
	this.$container = $("<div>", {"id": "commentCell"});

	//Header
	this.$header = $("<header>", {"id": "header"});
	this.$header.appendTo(this.$container);

	this.$avatarWrapper = $("<div>", {"id": "avatarWrapper"});
	this.$avatarWrapper.appendTo(this.$header);

	this.$avatar = $("<div>", {"id": "avatar"});
	this.$avatar.appendTo(this.$avatarWrapper);

	this.$username = $("<p>", {"id": "username"});
	this.$username.appendTo(this.$header);

	this.$date = $("<p>", {"id": "date"});
	this.$date.appendTo(this.$header);

	//Body
	this.$body = $("<div>", {"id": "body"});
	this.$body.appendTo(this.$container);

	this.$text = $("<p>", {"id": "text"});
	this.$text.appendTo(this.$body);

	if (comment) {
		if (comment.ownerName != null)
			this.setUsername(comment.ownerName);
		if (comment.creationDate != null)
			this.setDate(comment.creationDate);
		if (comment.text != null)
			this.setText(comment.text);
		if (comment.ownerImageUrl != null)
			this.setAvatar(comment.ownerImageUrl);
		if (comment.ownerFriend != null) {
			if (comment.ownerFriend)
				this.setAvatarColor("#d32433");
			else
				this.setAvatarColor("#c7d20c");
		}
	}
}

CommentCell.prototype.setAvatarColor = function(color) {
	this.$avatarWrapper.css("background-color", color);
};


CommentCell.prototype.setUsername = function(username) {
	this.$username.text("By " + username.toUpperCase());
};

CommentCell.prototype.setDate = function(date) {
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

CommentCell.prototype.setText = function(text) {
	if (text.length > 300) {
		text = text.slice(0, 300);
		text += "...";
	}
	this.$text.text(text);
};

CommentCell.prototype.setAvatar = function(imageUrl) {
	var image = new Image();
	image.onload = function() {
		this.$avatar.css("background-image", "url(" + imageUrl + ")");
		this.$avatar.addClass("withImage");
	}.bind(this);
	image.src = imageUrl;
};

return CommentCell;

});
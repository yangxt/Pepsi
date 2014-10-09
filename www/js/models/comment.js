
function parseDate(dateString) {
	var regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/
	var components = regex.exec(dateString);
	if (!components)
		return null;
	var year = parseInt(components[1]);
	var month = parseInt(components[2] - 1);
	var day = parseInt(components[3]);
	var hours = parseInt(components[4]);
	var minutes = parseInt(components[5]);
	var seconds = parseInt(components[6]);
	return new Date(Date.UTC(year, month, day, hours, minutes, seconds));
}

define(function() {
	var Comment = function() {
		this.id = null;
		this.text = null;
		this.imageUrl = null;
		this.creationDate = null;
		this.ownerName = null;
		this.ownerImageUrl = null;
		this.ownerFriend = null;
	};

	Comment.commentFromJSONObject = function(jsonObject) {
		var comment = new Comment();
		if (jsonObject.id)
			comment.id = jsonObject.id;
		if (jsonObject.text)
			comment.text = jsonObject.text;
		if (jsonObject.image_url)
			comment.imageUrl = jsonObject.image_url;
		if (jsonObject.creation_date)
			comment.creationDate = parseDate(jsonObject.creation_date);
		comment.ownerName = jsonObject.owner.name;
		comment.ownerImageUrl = jsonObject.owner.image_url;
		if (jsonObject.owner.friend != undefined) {
			comment.ownerFriend = jsonObject.owner.friend;
		}
		return comment;
	};

	return Comment;
});
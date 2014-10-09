var requireArray = [
	"helpers/eventEmitter"
];

define(requireArray, function(EventEmitter) {

var Marker = function(user) {
	google.maps.OverlayView.call(this);
	EventEmitter.call(this);

	this.user = user;
	this.position = new google.maps.LatLng(this.user.coordinate.latitude, this.user.coordinate.longitude);

	this.$container = $("<div>", {"id": "marker"});
	var containerClass = this.user.friend ? "red": "yellow";
    this.$container.addClass(containerClass);
    this.$container.appendTo(this.$container);

    this.$image = $("<div>", {"id": "image"});
    this.$image.appendTo(this.$container);
    if (this.user.image_url) {
    	this.$image.css({"background-image": "url(" + this.user.image_url + ")", "background-size": "cover"});
    	this.$image.addClass("withImage");
    }

    this.$shadow = $("<div>", {"id": "markerShadow"});
    this.$clickableContainer = $("<div>", {"id": "markerClickableContainer"});
    this.$clickableArea = $("<div>", {"id": "markerClickableArea"});
    this.$clickableArea.on("tapone", this._didClick.bind(this));
    this.$clickableArea.appendTo(this.$clickableContainer);
}

Marker.prototype = $.extend({}, google.maps.OverlayView.prototype, EventEmitter.prototype, Marker.prototype);
Marker.prototype.onAdd = function() {
	var $imagePane = $(this.getPanes().overlayImage);
	this.$container.appendTo($imagePane);
	var $shadowPane = $(this.getPanes().overlayShadow);
	this.$shadow.appendTo($shadowPane);
	var $clickablePane = $(this.getPanes().overlayMouseTarget);
	this.$clickableContainer.appendTo($clickablePane);
};

Marker.prototype.onRemove = function() {
	this.$container.remove();
	this.$shadow.remove();
	this.$clickableContainer.remove();
};

Marker.prototype.draw = function() {
	var projection = this.getProjection();
	var pixelPosition = projection.fromLatLngToDivPixel(this.position);
	pixelPosition.x = Math.round(pixelPosition.x) - 22;
	pixelPosition.y = Math.round(pixelPosition.y) - 64;

	this.$container.css({left: pixelPosition.x + "px", top: pixelPosition.y + "px"});
	this.$shadow.css({left: pixelPosition.x + 12 + "px", top: pixelPosition.y + 33 + "px"});
	this.$clickableContainer.css({left: pixelPosition.x + "px", top: pixelPosition.y + "px"});
};

Marker.prototype.addBubble = function() {
	if (this.bubble)
		return;
	this.$bubble = $("<div>");
	this.$bubble.addClass("bubble");
	this.$bubbleLeft = $("<div>");
	this.$bubbleLeft.addClass("bubbleLeft");
	this.$bubbleLeft.appendTo(this.$bubble);
	this.$bubbleCenter = $("<div>");
	this.$bubbleCenter.addClass("bubbleCenter");
	this.$bubbleCenter.appendTo(this.$bubble);
	this.$bubbleRight = $("<div>");
	this.$bubbleRight.addClass("bubbleRight");
	this.$bubbleRight.appendTo(this.$bubble);

	this.$textContainer = $("<div>");
	this.$textContainer.addClass("textContainer");
	this.$textContainer.appendTo(this.$bubble);
	this.$row = $("<div>");
	this.$row.appendTo(this.$textContainer);
	this.$row.addClass("row");
	this.$postsCount = $("<div>");
	this.$postsCount.addClass("postsCount");
	this.$postsCount.text(this.user.posts_count);
	this.$postsCount.appendTo(this.$row);
	this.$cameraIcon = $("<div>");
	this.$cameraIcon.appendTo(this.$row);
	this.$cameraIcon.addClass("cameraIcon");
	this.$name = $("<div>");
	this.$name.text(this.user.name);
	this.$name.addClass("name");
	this.$name.appendTo(this.$row);
	this.$disclosureArrow = $("<div>");
	this.$disclosureArrow.appendTo(this.$row);
	this.$disclosureArrow.addClass("disclosureArrow");

	this.$bubble.appendTo(this.$container);
	this.$bubbleClickableArea = $("<div>");
	this.$bubbleClickableArea.css({
		"width": this.$bubble.width(),
		"height": "40px",
		"z-index": 2,
		"position": "absolute",
		"top": "-50px",
		"left": "-42px"
	});
	this.$bubbleClickableArea.on("tapone", this._didClickBubble.bind(this));
	this.$bubbleClickableArea.appendTo(this.$clickableContainer);
}

Marker.prototype.removeBubble = function() {
	if (this.$bubble) {
		this.$bubble.remove();
		this.$bubbleClickableArea.remove();
	}
	this.$bubble = null;
	this.$bubbleClickableArea = null;
}

/////////////////

Marker.prototype._didClick = function() {
	if (this.$bubble)
		return;

	this.trigger("click");
}

Marker.prototype._didClickBubble = function() {
	this.trigger("clickBubble");
}


return Marker;

});
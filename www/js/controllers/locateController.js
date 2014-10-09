var requireArray = [
	"controllers/controller",
    "helpers/serverRequest",
    "views/marker",
    "controllers/userController"
];

define(requireArray, function(Controller, ServerRequest, Marker, UserController) {
var LocateController = function() {
	Controller.call(this);

	this.$container.attr("id", "locateController");
	this.$map = $("<div>", {"id": "map"});
	this.$map.appendTo(this.$container);
    this.$filterButton = $("<button>", {"id": "filterButton"});
    this.$filterButton.appendTo(this.$container);
    this.$filterButton.text("ALL");
    this.$filterButton.on("tapone", this._didClickAll.bind(this));
    this.onlyFriends = false;
    this.selectedMarker = null;
    this.usersByIds = {};

    notificationCenter.on("friendNotification", this._onFriendNotification.bind(this));
    notificationCenter.on("unfriendNotification", this._onUnfriendNotification.bind(this));
};


LocateController.prototype = new Controller();

LocateController.prototype.didAppear = function() {
    if (window._currentPosition) {
        this.positionIntervalId = setInterval(function() {
            navigator.geolocation.getCurrentPosition(this._didUpdatePosition.bind(this), null, {enableHighAccuracy: true});
        }.bind(this), 10000);
    }
};

LocateController.prototype.didDisappear = function() {
    if (this.positionIntervalId)
        clearInterval(this.positionIntervalId);
};

LocateController.prototype.init = function() {
    this.initialized = true;
    this.markers = {};

    var center = window._currentPosition ? window._currentPosition : new google.maps.LatLng(-21.115141, 55.536384);

    var mapOptions = {
        zoom: 8,
        center: center,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        maxZoom: 12,
        minZoom: 4
    };

    this.map = new google.maps.Map(this.$map[0], mapOptions);

    var icon = {
        url: "img/map/position-marker@2x.png",
        scaledSize: new google.maps.Size(16, 16, "px", "px"),
        anchor: new google.maps.Point(8, 8)
    };

    if (window._currentPosition) {
        var currentPositionMarker = new google.maps.Marker({
            position: window._currentPosition,
            map: this.map,
            icon: icon,
        });
        this.currentPositionMVC = new google.maps.MVCObject();
        this.currentPositionMVC.set("position", center);
        currentPositionMarker.bindTo("position", this.currentPositionMVC);
    }

    google.maps.event.addListener(this.map, 'bounds_changed', this._didChangeBounds.bind(this));
};

///////////////
// Private
//////////////

LocateController.prototype._didUpdatePosition = function(position) {
    window._currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    if (this.currentPositionMVC)
        this.currentPositionMVC.set("position", window._currentPosition);
};

LocateController.prototype._didChangeBounds = function() {
    var bounds = this.map.getBounds();
    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var request = new ServerRequest();
    request.method = "GET";
    if (this.onlyFriends)
        request.path = "me/friends/";
    else
        request.path = "users/";
    request.queryParameters["from_lat"] = sw.lat();
    request.queryParameters["to_lat"] = ne.lat();
    request.queryParameters["from_long"] = sw.lng();
    request.queryParameters["to_long"] = ne.lng();

    request.onSuccess = function(json) {
        this.users = json.users || json.friends;
        this.usersByIds = {};
        for (var i in this.users) {
            var user = this.users[i];
            this.usersByIds[user.id] = user;

            if (!this.markers[user.id]) {
                var marker = new Marker(user);
                marker.setMap(this.map);
                marker.on("click", this._didClickMarker.bind(this, marker, user));
                marker.on("clickBubble", this._didClickMarkerBubble.bind(this, marker, user));
                this.markers[user.id] = marker;
            }
        }

        for (var key in this.markers) {
            if (!this.usersByIds[key]) {
                var marker = this.markers[key];
                if (marker == this.selectedMarker) {
                    this.selectedMarker.removeBubble();
                    this.selectedMarker = null;
                }
                marker.setMap(null);
                marker = null; //Delete overlay
                delete this.markers[key];
            }
        }
    }.bind(this);
    request.onError = function(status, message) {
        alert("Error", "The users couldn't be loaded. Please check your internet connection");
    }.bind(this);
    request.execute();
};

/////////

LocateController.prototype._didClickMarker = function(marker, user) {
    if (this.selectedMarker)
        this.selectedMarker.removeBubble();
    marker.addBubble(user);
    this.selectedMarker = marker;
};

LocateController.prototype._didClickMarkerBubble = function(marker, user) {
    if (this.userController)
        return;
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
            this.userController = null;
        }.bind(this));
       userController.$container.removeClass("slide");
    }.bind(this));
    this.userController = userController;
};

LocateController.prototype._didClickAll = function() {
    this.$filterButton.off("tapone");
    this.$filterButton.on("tapone", this._didClickFriends.bind(this));
    this.$filterButton.text("FRIENDS");
    this.onlyFriends = true;
    this._didChangeBounds();
};

LocateController.prototype._didClickFriends = function() {
    this.$filterButton.off("tapone");
    this.$filterButton.on("tapone", this._didClickAll.bind(this));
    this.$filterButton.text("ALL");
    this.onlyFriends = false;
    this._didChangeBounds();
};

LocateController.prototype._onFriendNotification = function(notification) {
    var user = this.usersByIds[notification.userId];
    if (user) {
        user.friend = true;
        var oldMarker = this.markers[user.id];
        oldMarker.setMap(null);
        oldMarker.removeBubble();
        oldMarker = null; // Delete overlay
        var marker = new Marker(user);
        marker.setMap(this.map);
        marker.on("click", this._didClickMarker.bind(this, marker, user));
        marker.on("clickBubble", this._didClickMarkerBubble.bind(this, marker, user));
        if (oldMarker == this.selectedMarker) {
            this.selectedMarker = marker;
            marker.addBubble();
        }
        this.markers[user.id] = marker;
    }
};

LocateController.prototype._onUnfriendNotification = function(notification) {
    var user = this.usersByIds[notification.userId];
    if (user) {
        user.friend = false;
        var oldMarker = this.markers[user.id];
        oldMarker.setMap(null);
        oldMarker.removeBubble();
        oldMarker = null; // Delete overlay
        if (!this.onlyFriends) {
            var marker = new Marker(user);
            marker.setMap(this.map);
            marker.on("click", this._didClickMarker.bind(this, marker, user));
            marker.on("clickBubble", this._didClickMarkerBubble.bind(this, marker, user));
            if (oldMarker == this.selectedMarker) {
                this.selectedMarker = marker;
                marker.addBubble();
            }
            this.markers[user.id] = marker;
        }
        else {
            delete this.markers[user.id];
            delete this.usersByIds[user.id];
        }
    }
};

return LocateController;
});
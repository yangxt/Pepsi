var requireArray = [
	"controllers/controller",
    "controllers/trendsController",
    "controllers/cameraController",
    "controllers/friendsController",
    "controllers/meController",
    "controllers/locateController"
];

define(requireArray, function(Controller, TrendsController, CameraController, FriendsController, MeController, LocateController) {
function TabBarController() {
	Controller.call(this);

	this.$container.attr("id", "tabbarController");
	this.currentChildController = null;
	this.$content = $("<div>", {id: "tabbar-content"});
	this.$container.append(this.$content);
	this.$footer = $("<footer>", {id: "tabbar-footer"});
	this.$container.append(this.$footer);
	this.buttons = [];
	this.buttons.push($("<button>", {id: "tabbar-trends-button", type: "button"}));
	this.buttons.push($("<button>", {id: "tabbar-locate-button", type: "button"}));
	this.buttons.push($("<button>", {id: "tabbar-camera-button", type: "button"}));
	this.buttons.push($("<button>", {id: "tabbar-friends-button", type: "button"}));
	this.buttons.push($("<button>", {id: "tabbar-me-button", type: "button"}));

	//Position the buttons and add listeners
	for (var i in this.buttons) {
		var $button = this.buttons[i];

		//Preload images
		var $preloadDiv = $("<div>", {"id": $button.attr("id") + "-preload"});
		$preloadDiv.appendTo($("body"));
		///////////////

		var $div = $("<div>", {class: "tabbar-stretch"});
		$div.appendTo(this.$footer);
		$button.appendTo($div);
		(function(j) {
			$button.on("tapone", function(event) {
				event.preventDefault();
				this.setCurrentChildController(this.childControllers[j]);
			}.bind(this));
		}).bind(this)(i);
	}

	notificationCenter.on("tagNotification", this._onTagNotification.bind(this));
}

////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

TabBarController.prototype = new Controller();

TabBarController.prototype.init = function(isNewUser) {
	this.childControllers = [
		new TrendsController(), 
		new LocateController(),
		new CameraController(),
		new FriendsController(), 
		new MeController(isNewUser)
	];
	if (isNewUser)
		this.setCurrentChildController(this.childControllers[4]);
	else
		this.setCurrentChildController(this.childControllers[0]);
}

TabBarController.prototype.setCurrentChildController = function(childController) {
	if (childController != this.currentChildController) {
		childController.tabBarController = this;
		var index = this.childControllers.indexOf(childController);
		this.buttons[index].toggleClass("selected");
		if (childController == this.childControllers[2])
				childController.setBackgroundController(this.currentChildController);

		if (!$.contains(document.documentElement, childController.$container[0]))
			this.$content.append(childController.$container);

		if (this.currentChildController) {
			var index = this.childControllers.indexOf(this.currentChildController);
			this.buttons[index].toggleClass("selected");
			if (childController != this.childControllers[2])
				this.currentChildController.$container.detach();
			this.currentChildController.didDisappear();
		}
		this.currentChildController = childController;
		if (!childController.initialized)
			childController.init();
		childController.didAppear();
	}
};

TabBarController.prototype._onTagNotification = function(tag) {
	this.setCurrentChildController(this.childControllers[0]);
};

return TabBarController;
});
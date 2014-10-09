var requireArray = [
	"controllers/controller",
	"views/spinner",
	"helpers/serverRequest"
];

define(requireArray, function(Controller, Spinner, ServerRequest) {
var CameraController = function() {
	Controller.call(this);

	this.$container.attr("id", "cameraController");
	this.$mainContainer = $("<div>", {"id": "mainContainer"});
	this.$mainContainer.appendTo(this.$container);
	this.$originalCanvas = $("<canvas>");
	this.$background = null;
	this.photoWasTaken = false;
	this.applyingFilter = false;
	this.appliedFilterIndex = 2;

	this.filters = [];
	this.filterCanvasContainers = [];

	this.$filtersBar = $("<div>", {"id": "filtersBar"});

	for (var i = 0; i < 5; i++) {
		var $filterCanvasContainer = $("<button>");
		$filterCanvasContainer.addClass("filterCanvasContainer");
		$filterCanvasContainer.appendTo(this.$filtersBar);
		var $filterSelection = $("<div>");
		$filterSelection.addClass("filterSelection");
		$filterSelection.appendTo($filterCanvasContainer);
		$filterTitle = $("<div>");
		$filterTitle.addClass("filterTitle");
		$filterTitle.appendTo($filterSelection);
		if (i == 0) {
			$filterCanvasContainer.addClass("extremeLeft");
			$filterSelection.addClass("extremeLeft");
			$filterTitle.text("B & W");
		}
		else if (i == 1) {
			$filterTitle.text("Sober");
		}
		else if (i == 2) {
			$filterSelection.addClass("selected");
			$filterTitle.text("Normal");
		}
		else if (i == 3) {
			$filterTitle.text("Blue");
		}
		else if (i == 4) {
			$filterTitle.text("Red");
			$filterCanvasContainer.addClass("extremeRight");
			$filterSelection.addClass("extremeRight");
		}
		$filterCanvasContainer.on("tapone", this.didSelectFilter.bind(this, i));
		this.filterCanvasContainers.push($filterCanvasContainer);

	}

	this.filters.push([
		{
			effect: "desaturate",
			value: {average: false}
		},
		{
			effect: "brightness",
			value: {contrast: 1.0}
		}
	]);

	this.filters.push([
		{
			effect: "hsl",
			value: {hue:0, saturation:-50, lightness:0}
		},
		{
			effect: "brightness",
			value: {contrast: 0.5}
		},
		{
			effect: "coloradjust",
			value: {red:0.05, green:0, blue:0}
		}
	]);

	this.filters.push([]);

	this.filters.push([
		{
			effect: "glow",
			value: {amount:0.5, radius:1.0}
		},
		{
			effect: "coloradjust",
			value: {red:0, green:0, blue:0.6}
		}
	]);

	this.filters.push([
		{
			effect: "hsl",
			value: {hue:180, saturation:25, lightness:0}
		},
		{
			effect: "coloradjust",
			value: {red:0.5, green:0, blue:0}
		}
	]);
};

CameraController.prototype = new Controller();

CameraController.prototype.setBackgroundController = function(backgroundController) {
	this.backgroundController = backgroundController;
};

CameraController.prototype.didAppear = function() {
	if (!this.photoWasTaken)
		this.showCamera();
};

CameraController.prototype.didDisappear = function() {
};

CameraController.prototype.fillCanvas = function($canvas, image, cut) {
	var widthRatio = image.width / $canvas.width();
	var heightRatio = image.height / $canvas.height();
	if (cut) 
		var ratio = widthRatio < heightRatio ? widthRatio : heightRatio;
	else 
		var ratio = widthRatio > heightRatio ? widthRatio : heightRatio;

	var xOffset = ($canvas.width() - (image.width / ratio)) / 2;
	var yOffset = ($canvas.height() - (image.height / ratio)) / 2;

	var context = $canvas[0].getContext("2d");
	context.drawImage(image, xOffset, yOffset, image.width / ratio, image.height / ratio);
};

CameraController.prototype.showCamera = function(event) {
	if (event)
		event.preventDefault();
	var cameraOptions = { 
		destinationType: Camera.DestinationType.FILE_URI,
		sourcetype: Camera.PictureSourceType.CAMERA,
		targetWidth: 700,
		targetHeight: 700
	}
	var onCameraSuccess = function(fileURI) {
		clearTimeout(this.timer);
		this.clearMainContainer();
		var image = new Image();

		this.$container.addClass("black");
		this.didSelectFilter(2);
		this.$mainContainer.empty();
		this.$mainCanvasContainer = $("<div>");
		this.$mainCanvasContainer.addClass("mainCanvasContainer");
		this.$mainCanvasContainer.appendTo(this.$mainContainer);
		this.$mainCanvas = $("<canvas>");
		this.$mainCanvas.attr("width", this.$mainCanvasContainer.width());
		this.$mainCanvas.attr("height", this.$mainCanvasContainer.height());
		this.$mainCanvas.appendTo(this.$mainCanvasContainer);
		this.$mainCanvas.css("opacity", "0");

		image.onload = function() {
			this.$originalCanvas.attr("width", image.width);
			this.$originalCanvas.attr("height", image.height);
			this.$originalCanvas.css({"width": image.width, "height": image.height});
			this.fillCanvas(this.$originalCanvas, image, false);
			this.fillCanvas(this.$mainCanvas, image, false);
			this.$originalMainCanvas = null;
			this.$filtersBar.css("opacity", "0");
			this.$filtersBar.appendTo(this.$mainContainer);

			//Show when everything's loaded
			var pixasticCallback = function() {
				pixasticCallback._currentCount += 1;
				if (pixasticCallback._currentCount == this.filters.length) {
					this.$mainCanvas.css("opacity", "1");
					this.$filtersBar.css("opacity", "1");

					this.$retakeButton = $("<button>");
					this.$retakeButton.addClass("whiteButton");
					this.$retakeButton.text("RETAKE");
					this.$retakeButton.on("tapone", this.showCamera.bind(this));
					this.$retakeButton.appendTo(this.$mainContainer);

					this.$nextButton = $("<button>");
					this.$nextButton.addClass("redButton");
					this.$nextButton.text("NEXT");
					this.$nextButton.on("tapone", this.showTextArea.bind(this));
					this.$nextButton.appendTo(this.$mainContainer);

					if (this.spinner)
						this.spinner.$container.remove();
					this.photoWasTaken = true;
				}
					
			}.bind(this);
			pixasticCallback._currentCount = 0;

			//Add filters
			for (var i in this.filterCanvasContainers) {
				var $container = this.filterCanvasContainers[i];
				//Remove old canvas
				$container.find("canvas").remove();

				var $canvas = $("<canvas>");
				$canvas.attr("width", $container.width());
				$canvas.attr("height", $container.height());
				$canvas.appendTo($container);
				this.fillCanvas($canvas, image, true);

				var filters = this.filters[i];
				this.applyFilters($canvas, filters);
				pixasticCallback();
			}
		}.bind(this);
		image.src = fileURI;

	}.bind(this);

	var onError = function() {
		clearTimeout(this.timer);
		this.clearMainContainer();

		if (!this.photoWasTaken) {
			this.$container.removeClass("black");
			this.tabBarController.setCurrentChildController(this.backgroundController);
			return;
		}

		this.$retakeButton = $("<button>");
		this.$retakeButton.addClass("whiteButton");
		this.$retakeButton.text("RETAKE");
		this.$retakeButton.appendTo(this.$mainContainer);
		this.$retakeButton.on("tapone", this.showCamera.bind(this));

		this.$filtersBar.appendTo(this.$mainContainer);
		this.$nextButton = $("<button>");
		this.$nextButton.addClass("redButton");
		this.$nextButton.text("NEXT");
		this.$nextButton.on("tapone", this.showTextArea.bind(this));
		this.$nextButton.appendTo(this.$mainContainer);

		this.$mainCanvasContainer.insertBefore(this.$retakeButton);
		if (this.spinner)
			this.spinner.$container.remove();
	}.bind(this);

	navigator.camera.getPicture(onCameraSuccess, onError, cameraOptions);

	this.timer = setTimeout(function() {
		this.clearMainContainer();
		this.$container.addClass("black");

		//Show spinner
		this.spinner = new Spinner();
		this.spinner.$container.addClass("spinner");
		this.spinner.$container.appendTo(this.$mainContainer);
	}.bind(this), 700);
};

CameraController.prototype.clearMainContainer = function() {
	this.$filtersBar.detach();
	if (this.$mainCanvasContainer)
		this.$mainCanvasContainer.detach();
	if (this.$retakeButton)
		this.$retakeButton.remove();
	if (this.$nextButton)
		this.$nextButton.remove();
};

CameraController.prototype.showTextArea = function(event) {
	if (event)
		event.preventDefault();
	this.$textAreaContainer = $("<div>");
	this.$textAreaContainer.addClass("textAreaContainer");
	this.$textAreaContainer.appendTo(this.$container);
	this.$textArea = $("<textarea>");
	this.$textArea.attr("maxlength", 300);
	this.$textArea.attr("placeholder", "Max 300 characters");
	this.$textArea.on("focus", function() {
		setTimeout(function() {
			$("body").scrollTop(0); 
		}, 20);
	});

	this.$textArea.on("keydown", function(event) {
		if (event.which == 13)
     		event.preventDefault();
	});

	this.$saveButton = $("<button>");
	this.$saveButton.addClass("redButton");
	this.$saveButton.text("SAVE");

	this.$backButton = $("<button>");
	this.$backButton.addClass("whiteButton backArrow");

	this.$textAreaContainer.on("webkitTransitionEnd transitionend", function(){
		this.$textAreaContainer.off("webkitTransitionEnd transitionend")
		$("body").on('touchmove', function(e) {
    		e.preventDefault();
		}, false);
		this.$saveButton.appendTo(this.$textAreaContainer);
		this.$backButton.appendTo(this.$textAreaContainer);
		this.$retakeButton.detach();
		this.$nextButton.detach();
		this.$saveButton.on("tapone", this.didClickSave.bind(this));
		this.$backButton.on("tapone", this.didClickBack.bind(this));
	}.bind(this)); 

	this.$textArea.addClass("textArea");
	this.$textArea.appendTo(this.$textAreaContainer);

	//force css reload
	this.$textAreaContainer[0].offsetHeight;

	this.$textAreaContainer.addClass("slide");
};

CameraController.prototype.didSelectFilter = function(i) {
	if (!this.photoWasTaken || this.applyingFilter)
		return;

	if (!this.$originalMainCanvas) {
		this.$originalMainCanvas = this.$mainCanvas;
	}

	// Select filter
	this.filterCanvasContainers[this.appliedFilterIndex].find(".filterSelection").removeClass("selected");
	this.filterCanvasContainers[i].find(".filterSelection").addClass("selected");
	////////

	this.$mainCanvas.remove();
	this.$mainCanvas = this.$originalMainCanvas;
	this.$mainCanvas.appendTo(this.$mainCanvasContainer);

	this.appliedFilterIndex = i;
	var filters = this.filters[i];
 	setTimeout(function() {
		this.$mainCanvas = this.applyFilters(this.$mainCanvas, filters);
	}.bind(this), 50);
};

CameraController.prototype.didClickSave = function(event) {
	$("body").off('touchmove');

	var text = this.$textArea.val();
	if (text == "") {
		alert("Error", "Please enter a description");
		return;
	}

	this.$saveButton.off("tapone");
	this.$backButton.off("tapone");

	var $uploadContainer = $("<div>");
	$uploadContainer.addClass("uploadContainer");
	var $uploadText = $("<p>");
	$uploadText.text("Uploading");
	$uploadText.addClass("uploadText");
	$uploadText.appendTo($uploadContainer);
	var spinner = new Spinner();
	spinner.$container.addClass("spinner");
	spinner.$container.appendTo($uploadContainer);

	var reinitializeScreen = function() {
		this.photoWasTaken = false;
		this.$mainCanvasContainer = $("<div>");
		this.$mainCanvasContainer.addClass("mainCanvasContainer");
		this.$mainCanvasContainer.appendTo(this.$mainContainer)
		this.$mainContainer.appendTo(this.$container);
	}.bind(this);

	var alertCallback = function() {
		this.$container.removeClass("blue");
		if (this.tabBarController.currentChildController == this)
			this.tabBarController.setCurrentChildController(this.backgroundController);
	}.bind(this);

	var sendPost = function(image_url) {
		var regex = /\B(#\w*)/g;
		var tags = text.match(regex);
		text = text.replace(regex, "");
		tags = tags ? tags : [];

		var request = new ServerRequest();
		request.method = "POST";
		request.path = "posts/";
		request.body = JSON.stringify({
			text: text,
			tags: tags,
			image_url: image_url
		});
		request.onSuccess = function(json) {
			$uploadContainer.remove();
			reinitializeScreen();
			notificationCenter.trigger("postNotification", {postId: json["id"], notifier: this});
			alert("Success", "Post successfully saved.", alertCallback);
		}.bind(this);
		request.onError = function(status, message) {
			$uploadContainer.remove();
			reinitializeScreen();
			alert("Error", "Oups, something bad happened. Please try again.", alertCallback);
		};
		request.execute();
	}.bind(this);

	var sendCanvas = function(newCanvas) {
		var dataURL = newCanvas.toDataURL();
		var request = new ServerRequest();
		request.method = "POST";
		request.path = "images/";
		request.jsonHeader = false;
		request.body = dataURL;
		request.onSuccess = function(json) {
			sendPost(json.image_url);
		}.bind(this);
		request.onError = function(status, message) {
			$uploadContainer.remove();
			reinitializeScreen();
			alert("Error", "Oups, something bad happened. Please try again.", alertCallback);
		};
		request.execute();
	}.bind(this);

	this.$container.addClass("animatedBackground blue");
	this.$textArea.blur();

	this.$textAreaContainer.on("webkitTransitionEnd transitionend", function() {
		this.$textAreaContainer.off("webkitTransitionEnd transitionend")
		this.$mainContainer.removeClass("disappear");
		this.$filtersBar.detach();
		this.$mainContainer.empty();
		this.$mainContainer.remove();
		this.$textAreaContainer.remove();
		this.$textAreaContainer = null;
		this.$saveButton = null;
		this.$backButton = null;
		this.$textArea = null;
		this.$container.removeClass("animatedBackground black")
		$uploadContainer.appendTo(this.$container);
		setTimeout(function() {
			var filters = this.filters[this.appliedFilterIndex];
			var $newCanvas = this.applyFilters(this.$originalCanvas, filters);
			sendCanvas($newCanvas[0]);
		}.bind(this), 100);
	}.bind(this));

	this.$textAreaContainer.removeClass("slide");
	this.$mainContainer.addClass("disappear");
};

CameraController.prototype.didClickBack = function(event) {
	$("body").off('touchmove');
	
	this.$retakeButton.appendTo(this.$mainContainer);
	this.$nextButton.appendTo(this.$mainContainer);
	this.$backButton.remove();
	this.$saveButton.remove();
	this.$textAreaContainer.on("webkitAnimationEnd animationEnd", function(){
		this.$textAreaContainer.off("webkitAnimationEnd animationEnd");
		this.$textAreaContainer.remove();
		
	}.bind(this));
	this.$textAreaContainer.removeClass("slide");
};

CameraController.prototype.applyFilters = function($canvas, filters) {
	this.applyingFilter = true;
	var newCanvas = $canvas[0];
	for (var i in filters) {
		var filterCopy = $.extend(true, {}, filters[i]);
		newCanvas = Pixastic.process(newCanvas, filterCopy.effect, filterCopy.value);
	}
	this.applyingFilter = false;
	return $(newCanvas);
};

return CameraController;

});


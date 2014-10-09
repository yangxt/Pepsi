require(["lib/domReady"], function(domReady) {

domReady(function() {
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
		 
	if (parseFloat(window.device.version) === 7.0 && window.device.platform === "iOS") {
		 document.body.style.top = "20px";
	}

    document.addEventListener("resume", onResume, false);

    function onResume() {
        if (navigator.connection.type == Connection.NONE) {
            alert("Error", "You must be connected to the internet to use this application. Please check your internet connection and try again", function() {
                onResume();
            });
        }
    }

    function onStart() {
        if (navigator.connection.type == Connection.NONE) {
            navigator.splashscreen.hide();
            alert("Error", "You must be connected to the internet to use this application. Please check your internet connection and try again", function() {
                onStart();
            });
        }
        else {
            launch();
        }
    }

    function launch() {
        window.onGoogleReady = function(){
            var requireArray = [
                "controllers/tabBarController",
                "helpers/constants",
                "helpers/serverRequest",
                "helpers/eventEmitter",
            ];

            require(requireArray, function(TabBarController, Constants, ServerRequest, EventEmitter) {
            var username = localStorage.getItem("username");
            var password = localStorage.getItem("password");

            if (!username || !password) {
                var request = new ServerRequest();
                request.method = "POST";
                request.path = "users/";
                request.onSuccess = function(json) {
                    localStorage.setItem("username", json.username);
                    localStorage.setItem("password", json.password);
                    Constants.credentials = {
                        username: json.username,
                        password: json.password
                    };
                    start(true);
                };
                request.onError = function(status, message) {
                    alert("Error", "Oups, something bad happened. Please check your internet connection and restart the application.");
                };
                request.execute();
            }
            else {
                Constants.credentials = {
                        username: username,
                        password: password
                };
                start(false);
            }

            var geolocationCallback = function(position) {
                window._currentPosition = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                var request = new ServerRequest();
                request.method = "PUT";
                request.path = "me/geolocation"
                request.body = JSON.stringify({
                    coordinates: {
                        lat: position.coords.latitude,
                        long: position.coords.longitude
                    }
                });
                request.execute();
            }

            function start(isNewUser) {
                window.notificationCenter = new EventEmitter();

                var tabBarController = new TabBarController();

                var request = new ServerRequest();
                request.method = "GET";
                request.path = "ad/";
                request.onSuccess = function(json) {
                    var duration = Math.round(json.duration);
                    var $ad = $("<div>");
                    $ad.addClass("ad");
                    var $counterContainer = $("<div>");
                    $counterContainer.appendTo($ad);
                    var $textContainer = $("<span>");
                    $textContainer.appendTo($counterContainer);
                    var $text = $("<span>");
                    $text.addClass("text");
                    $text.text("App in");
                    $text.appendTo($textContainer);
                    var $counter = $("<span>");
                    $counter.addClass("counter");
                    $counter.text(duration)
                    $counter.appendTo($textContainer);
                    var image = new Image;
                    image.onload = function() {
                        $ad.css("background-image", "url(" + image.src + ")");
                        $ad.appendTo($("body"));
                        var counter = duration;
                        var interval = setInterval(function() {
                            counter--;
                            $counter.text(counter);
                        }, 1000);
                        setTimeout(function() {
                            $("body").append(tabBarController.$container);
                            $ad.remove();

                            navigator.geolocation.getCurrentPosition(geolocationCallback, null, {enableHighAccuracy: true});
                            
                            clearInterval(interval);
                        }, duration * 1000);
                        navigator.splashscreen.hide();
                    };
                    image.src = json.image_url;
                };

                request.onError = function(status, message) {
                    if (status == 404) {
                        $("body").append(tabBarController.$container);       
                        navigator.geolocation.getCurrentPosition(geolocationCallback, null, {enableHighAccuracy: true});
                    }
                    else 
                        alert("Error", "Oups, something bad happened. Please check your internet connection and restart the application.");
                    navigator.splashscreen.hide();
                };
                request.execute();

                tabBarController.init(isNewUser);
            }
            });
        }
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyBKBiOly71w_bQ6gH_MI0x3G1PypVi2GaI&sensor=true&callback=onGoogleReady"
        document.body.appendChild(script);

    }
    onStart();
};
});
});
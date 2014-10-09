
define(["helpers/constants"], function(Constants) {
	var ServerRequest = function(){
		this.path = null;
		this.method = "GET";
		this.queryParameters = {};
		this.body = null;
		this.onSuccess = null;
		this.onError = null;
		this.jsonHeader = true;
	};

	ServerRequest.prototype.execute = function() {

		var request = new XMLHttpRequest();

		var timeout = setTimeout(function() {
			request.abort();
			if (this.onError)
				this.onError(408, "Request timed out");
		}.bind(this), 45000);

		request.onload = function() {
			clearTimeout(timeout);
			var response = JSON.parse(request.responseText);
			if (response.status == 200) {
				if (this.onSuccess)
					this.onSuccess(response.body);
			}
			else {
				if (this.onError)
					this.onError(response.status, response.message);
			}
		}.bind(this);


		var url = Constants.SERVER_URL + this.path + "?api_key=" + Constants.SERVER_API_KEY;
		for (var key in this.queryParameters) {
			var queryParameter = this.queryParameters[key];
			if (typeof queryParameter == "string")
				queryParameter = queryParameter.replace("#", "%23");
			url += "&" + key + "=" + queryParameter;
		}
		request.open(this.method, url, true);
		if (Constants.credentials)
			request.setRequestHeader("Authorization", "Basic " + btoa(Constants.credentials.username + ":" + Constants.credentials.password));
		request.setRequestHeader("Cache-Control", "no-cache");
		if (this.jsonHeader)
			request.setRequestHeader("Content-Type", "application/json");
		if (this.body)
			request.send(this.body);
		else
			request.send();
	}

	return ServerRequest;
});
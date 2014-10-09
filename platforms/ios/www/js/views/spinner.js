
define(function() {
var Spinner = function() {
	this.$container = $("<div>", {"id": "floatingBarsG"});
	this.divs = [];
	for (var i = 1; i <= 8; i++) {
		var $div = $("<div>", {"id": "rotateG_0" + i});
		$div.addClass("blockG");
		$div.appendTo(this.$container);
		this.divs.push($div);
	}
};

Spinner.prototype.setBlue = function() {
	for (var i in this.divs) {
		var $div = this.divs[i];
		$div.addClass("blue");
	}
};

return Spinner;
});
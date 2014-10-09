var requireArray = [
	"helpers/eventEmitter",
	"views/spinner"
];

define(requireArray, function(EventEmitter, Spinner) {
function TableView() {
	EventEmitter.call(this);

	this.$container = $("<div>");
	this.$container.css({"overflow": "scroll", "-webkit-overflow-scrolling": "touch"});
	this.$container[0].addEventListener("touchstart", function(event){});
	this.$cellsContainer = $("<div>");
	this.$cellsContainer.appendTo(this.$container);
	this.loading = false;
	this.spinner = new Spinner();
	this.spinner.$container.css({"margin": "0 auto 20px auto"});
	this.spacing = 0;
	this.selectedCell = null;
	this.cells = [];
	this.firstVisibleRow = 0;

	//Events

	this.$container.scroll(function(e) {
		if (this.$container.outerHeight() + this.$container.scrollTop() == this.$container[0].scrollHeight) {
			this.trigger("didScrollToBottom");
		}

    	var firstVisibleCellSeen = false;
    	var firstIndex = this.firstVisibleRow > 0 ? this.firstVisibleRow - 1 : 0
		for (var i = firstIndex; i < this.cells.length; i++) {
			var cell = this.cells[i];
			if (this._isCellVisible(cell)) {
    			if (!firstVisibleCellSeen) {
    				this.firstVisibleRow = i;
    			}
    			firstVisibleCellSeen = true;
    			this.trigger("rowIsVisible", i)
    		}
    		else if (firstVisibleCellSeen)
    			return;

		}
	}.bind(this));
}

TableView.prototype = new EventEmitter();

TableView.prototype.setHeader = function($header) {
	if (this.$header)
		this.$header.remove();

	this.$container.prepend($header);
	this.$header = $header;
};

TableView.prototype.setCellsSpacing = function(spacing) {
	for (var i in this.cells) {
		var cell = this.cells[i];
		if (i != 0)
			cell.$container.css("margin-top", spacing);
	}
	this.spacing = spacing;
};

TableView.prototype.pushCell = function(cell) {
	cell.$container.appendTo(this.$cellsContainer);
	//cell.$container.on("tapone", this._didSelectCell.bind(this, cell));
	if (this.cells.length != 0) {
		cell.$container.css("margin-top", this.spacing);
	}
	this.cells.push(cell);
	if (this._isCellVisible(cell))
    	this.trigger("rowIsVisible", this.cells.length - 1);
};

TableView.prototype.removeRowAtIndex = function(i) {
	if (i < this.cells.length) {
		if (this.selectedCell = this.cells[i])
			this.selectedCell = null;
		this.cells[i].$container.remove();
		this.cells.splice(i, 1);
	}
};

TableView.prototype.removeAllRows = function() {
	for (var i = 0 in this.cells) {
		var cell = this.cells[i];
		cell.$container.remove();
	}
	this.selectedCell = null;
	this.cells = [];
};

TableView.prototype.enterLoadingMode = function() {
	this.loading = true;
	this.spinner.$container.css("margin-top", this.spacing);
	this.spinner.$container.appendTo(this.$cellsContainer);
};

TableView.prototype.exitLoadingMode = function() {
	this.spinner.$container.remove();
	this.loading = false;
};	

TableView.prototype.cellForRow = function(row) {
	if (row >= 0 && row < this.cells.length)
		return this.cells[row];
};

TableView.prototype.insertCellAtRow = function(cell, row) {
	if (row != 0)
		cell.$container.css("margin-top", this.spacing);

	if (row == this.cells.length || this.cells.length == 0) {
		cell.$container.appendTo(this.$cellsContainer)
		this.cells.push(cell);
	}
	else {
		var previousCell = this.cells[row];
		if (!previousCell)
			return;
		if (row == 0)
			previousCell.$container.css("margin-top", this.spacing);
		cell.$container.insertBefore(previousCell.$container);
		this.cells.splice(row, 0, cell);
	}

	if (this._isCellVisible(cell))
    	this.trigger("rowIsVisible", this.cells.indexOf(cell));
};

///////////////////////////////
// Private
//////////////////////////////

TableView.prototype._isCellVisible = function(cell) {
	var top = 0;
	var bottom = this.$container.outerHeight();
	var cellTop = cell.$container.position().top;
    var cellBottom = cellTop + cell.$container.outerHeight() - 10;
    return ((cellBottom <= bottom) && (cellTop >= top));
}

TableView.prototype._didSelectCell = function(cell, event) {
	var row = this.cells.indexOf(cell);
	if (row == -1 || cell == this.selectedCell)
		return;
	if (cell.setSelected)
		cell.setSelected(true);
	if (this.selectedCell && this.selectedCell.setSelected)
		this.selectedCell.setSelected(false);
	this.selectedCell = cell;
	this.trigger("didSelectRow", row);
}

return TableView;
});


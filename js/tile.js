function Tile(value) {
	this.value = value;
	this.$tile = null;
	this.x = null;
	this.y = null;
};
var transitionEndEvent = "webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend";
Tile.prototype = {
	isLegal: function() {
		if (!this.value || !this.x || !this.y) {
			return false;
		}
		return true;
	},
	generateTileNode: function() {
		if (!this.isLegal() || this.$tile) {
			return false;
		}
		this.$tile = $('<div></div>');
		this.updateTileNode("hide");
	},
	show: function(callback) {
		this.$tile.removeClass("hide");
		if (callback) this.$tile.one(transitionEndEvent, callback);
	},
	updateTileNode: function(tileClass) {
		if (!this.isLegal()) {
			return false;
		}
		this.$tile.removeAttr("class");
		if (tileClass) {
			this.$tile.addClass(tileClass);
		}
		this.$tile.addClass("tile");
		this.$tile.addClass("tile-" + this.value);
		this.$tile.addClass("tile-position-" + this.x + "-" + this.y);
		this.$tile.text(this.value);
		return this.$tile;
	},
	remove: function() {
		this.$tile.remove();
	},
	move: function(x, y, callback) {
		this.x = x;
		this.y = y;
		this.updateTileNode();
		if (callback) this.$tile.one(transitionEndEvent, callback);
	},
	merge: function(toTile, newValue, callback) {
		this.x = toTile.x;
		this.y = toTile.y;
		this.updateTileNode();
		var thisTile = this;
		this.$tile.one(transitionEndEvent, function() {
			thisTile.value = newValue;
			thisTile.updateTileNode();
			if (callback) callback.call(this);
		});
	}
};
Tile.prototype.constructor = Tile.constructor;
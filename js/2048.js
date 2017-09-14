(function($){
    function Game2048($gamePanel, options) {
        this.options = $.extend({
            info: "2048",
            columnCount: 4,
            rowCount: 4,
            defaultTileCount: 2
        }, options);
        this.$gamePanel = $gamePanel;
        this.init();
    };
    Game2048.prototype = {
    	LEFT: 3,
    	RIGHT: 1,
    	UP: 0,
    	DOWN: 2,
    	GENERATE_NEW_TILE_EVENT: 'generateNewTile',
        init: function() {
        	this._initGlobalVariables();
        	this._generateTemplate();
        	this._generateDefaultTiles();
        	this._bindEvents();
        	this.codeDirectionMapping = {
        		37: this.LEFT,
        		38: this.UP,
        		39: this.RIGHT,
        		40: this.DOWN
        	};
        },
        _initGlobalVariables: function() {
        	this.score = 0;
        	this.moveCount = 0;
        	this.mergeCount = 0;
        	this.showCount = 0;
        	this.lockStatus = false;
        	this.toBeDeletedTileList = [];
            this.tiles = [];
        },
        _generateDefaultTiles: function() {
            for (var i = 1; i <= this.options.rowCount; i++) {
            	this.tiles[i] = [];
            	for (var j = 1; j <= this.options.columnCount; j++) {
            		this.tiles[i][j] = "";
            	}
            }
        	for (var i = 0; i < this.options.defaultTileCount; i++) {
        		this.generateNewTile();
        	}
        },
        _generateTemplate: function() {
        	var emptyBoard = 
		        '<div class="header">                                                    ' +
		        '    <div class="title">2048</div>                                       ' +
		        '    <div class="score">Score: <span class="score-cell">0</span></div>   ' +
		        '    <button class="new-game">New Game</button>                          ' +
		        '</div>                                                                  ' +
		        '<div class="game">                                                      ' +
		    	'    <div class="board">                                                 ' +
		    	'    </div>                                                              ' +
		    	'    <div class="tile-container">                                        ' +
		    	'    </div>                                                              ' +
		        '</div>                                                                  ';
        	this.$gamePanel.append(emptyBoard);
        	this.$gamePanel.addClass("panel-2048");
        	var $board = this.$gamePanel.find(".board").first();
        	for (var i = 1; i <= this.options.rowCount; i++) {
        		var $row = $('<div class="board-row"></div>');
        		for (var j = 1; j <= this.options.columnCount; j++) {
        			$cell = $('<div class="board-cell"></div>');
        			$row.append($cell);
        		}
        		$board.append($row);
        	}	
        },
        _bindEvents: function() {
        	var game2048 = this;
        	$(document).on("keydown", function(event) {
        		if (game2048.codeDirectionMapping[event.keyCode] != undefined) {
            		game2048.moveToDirection(game2048.codeDirectionMapping[event.keyCode]);
        		}
        	});
        	this.$gamePanel.find(".new-game").click(function() {
        		game2048.newGame();
        	});
        	this.$gamePanel.on(this.GENERATE_NEW_TILE_EVENT, function() {
        		game2048.generateNewTile(function() {
            		if (game2048.checkFailed()) {
            			if (confirm("Failed, wanna try again?")) {
            				game2048.newGame();
            			}
            		}
        		});
        	});
        },
        newGame: function() {
        	this.$gamePanel.find(".tile-container > *").remove();
        	this._initGlobalVariables();
        	this._generateDefaultTiles();
        	this.updateScore();
        },
        checkFailed: function() {
        	for (var i = 1; i <= this.options.rowCount; i++) {
        		var lastValue = null;
        		for (var j = 1; j <= this.options.columnCount; j++) {
        			var currentValue = this.tiles[i][j]["value"];
        			if (currentValue == undefined) return false;
        			if (lastValue != null) {
        				if (lastValue == currentValue) return false;
        			}
        			lastValue = currentValue;
        		}
        	}
        	for (var i = 1; i <= this.options.columnCount; i++) {
        		var lastValue = null;
        		for (var j = 1; j <= this.options.rowCount; j++) {
        			var currentValue = this.tiles[j][i]["value"];
        			if (currentValue == undefined) return false;
        			if (lastValue != null) {
        				if (lastValue == currentValue) return false;
        			}
        			lastValue = currentValue;
        		}
        	}
        	return true;
        },
        gainScore: function(addedScore) {
        	this.score += addedScore;
        	this.updateScore();
        },
        updateScore: function() {
        	this.$gamePanel.find(".score-cell").text(this.score);
        },
        generateNewTile: function(callback) {
        	var tile = null;
        	var newValue = Math.random() < 0.9 ? 2 : 4;
        	tile = new Tile(newValue);
        	var availablePositions = this.getAvailablePositions();
        	if (availablePositions.length == 0) return false;
        	var newPosition = availablePositions[parseInt(Math.random() * availablePositions.length)];
        	tile.x = newPosition.x;
        	tile.y = newPosition.y;
        	tile.generateTileNode();
        	this.setTile(tile, tile.x, tile.y);
        	this.$gamePanel.find(".tile-container").append(tile.$tile);
        	var game2048 = this;
        	game2048.showCount++;
        	setTimeout(function() {
            	tile.show(function() {
            		game2048.showCount--;
            		game2048.unlock();
            		if (callback) callback.call(this);
            	});
        	}, 10);
        },
        getAvailablePositions: function() {
        	var positions = [];
            for (var i = 1; i <= this.options.rowCount; i++) {
            	for (var j = 1; j <= this.options.columnCount; j++) {
            		if (this.tiles[i][j] == "") {
            			positions.push({x: i, y: j});
            		}
            	}
            }
            return positions;
        },
        _getRealPosition: function(x, y, direction) {
        	var newX,newY;
        	if (direction == this.LEFT) {
        		newX = x;
        		newY = y;
        	}
        	else if (direction == this.RIGHT) {
        		newX = x;
        		newY = this.options.columnCount + 1 - y;
        	}
        	else if (direction == this.UP) {
        		newX = y;
        		newY = this.options.columnCount + 1 - x;
        	}
        	else {
        		newX = this.options.rowCount + 1 - y;
        		newY = this.options.columnCount + 1 - x;
        	}
        	return {x: newX, y: newY};
        },
        _getTile: function(x, y, direction) {
        	var realPosition = this._getRealPosition(x, y, direction);
        	return this.tiles[realPosition.x][realPosition.y]["tile"];
        },
        moveToDirection: function(direction) {
			if (this.isLocked()) return;
        	this.lock();
        	var outerLimit = this.options.rowCount;
        	var innerLimit = this.options.columnCount;
        	if (direction == this.UP || direction == this.DOWN) {
        		outerLimit = this.options.columnCount;
        		innerLimit = this.options.rowCount;
        	}
        	var moved = false;
        	for (var i = 1; i <= outerLimit; i++) {
        		var lastValue = null;
        		var lastPosition = null;
        		for (var j = 1; j <= innerLimit; j++) {
        			var currentTile = this._getTile(i, j, direction);
        			//empty tile
        			if (currentTile == undefined) {
        				if (lastPosition == null) {
        					lastPosition = j;
        				}
        				continue;
        			}
        			//non-empty tile
        				//first tile of this line
    				if (lastPosition == null) {
    					lastPosition = j;
    					lastValue = currentTile["value"];
    					continue;
    				}
    					//not first tile of this line
					if (lastValue == null) {
						moved = true;
						this.moveTile(currentTile, i, lastPosition, direction);
						lastValue = currentTile.value;
					}
					else if (lastValue == currentTile["value"]) {
						moved = true;
						this.mergeTile(currentTile, this._getTile(i, lastPosition, direction));
						lastValue = null;
						lastPosition++;
					}
					else if (j - lastPosition > 1) {
						moved = true;
						this.moveTile(currentTile, i, lastPosition + 1, direction);
						lastValue = currentTile.value;
						lastPosition++;
					}
					else {
						lastValue = currentTile.value;
						lastPosition = j;
					}
        		}
        	}
        	if (!moved) this.unlock();
        },
        setTile: function(tile, x, y, value) {
        	this.tiles[x][y] = {};
        	this.tiles[x][y]["tile"] = tile;
        	if (value == undefined)
        		this.tiles[x][y]["value"] = tile.value;
        	else
        		this.tiles[x][y]["value"] = value;
        },
        moveTile: function(tile, x, y, direction) {
        	this.moveCount++;
        	var realPosition = this._getRealPosition(x, y, direction);
        	x = realPosition.x;
        	y = realPosition.y;
        	this.tiles[tile.x][tile.y] = "";
        	this.setTile(tile, x, y);
        	var game2048 = this;
        	tile.move(x, y, function() {
        		game2048.moveCount--;
        		game2048.checkMovingComplete();
        	});
        },
        mergeTile: function(fromTile, toTile) {
			this.mergeCount++;
			this.gainScore(fromTile.value * 2);
        	var newValue = fromTile.value + toTile.value;
        	this.tiles[fromTile.x][fromTile.y] = "";
        	this.setTile(fromTile, toTile.x, toTile.y, newValue);
        	var game2048 = this;
        	this.toBeDeletedTileList.push(toTile);
        	fromTile.merge(toTile, newValue, function() {
        		game2048.mergeCount--;
        		game2048.checkMovingComplete();
        	});
        },
        lock: function() {
        	this.lockStatus = true;
        },
        unlock: function() {
        	this.lockStatus = false;
        },
        isLocked: function() {
        	return this.lockStatus;
        },
        animating: function() {
        	if (this.moveCount > 0 || this.mergeCount > 0 || this.showCount > 0) return true;
        	return false;
        },
        checkMovingComplete: function() {
        	if (!this.animating()) {
        		for (var i = 0; i < this.toBeDeletedTileList.length; i++) {
        			this.toBeDeletedTileList[i].remove();
        		}
        		this.toBeDeletedTileList = [];
        		this.$gamePanel.trigger(this.GENERATE_NEW_TILE_EVENT);
        	}
        }
    };
    Game2048.prototype.constructor = Game2048;
    $.fn.game2048 = function(option) {
    	return new Game2048(this, option);
    };
})(jQuery);
game = function () {

    /**
     * The width and height of the grid.
     * @type {number}
     */
    var GRID_SIZE = 3;

    /**
     * Stores which player has marked which square.
     * @type {Array}
     */
    var data = [];

    /**
     * Stores the scores on each row, column and diagonal.
     * Row scores are in indices [0 - GRID_SIZE-1], Column scores are in [GRID_SIZE - 2*GRID_SIZE] and the diagonals are
     * in the last two indices.
     * @type {Array}
     */
    var scores = [];

    /**
     * An array of players in this game.
     * @type {Array}
     */
    var players = [];

    /**
     * The current player.
     * @type {undefined}
     */
    var curPlayer = undefined;

    /**
     * The current turn.
     * @type {number}
     */
    var turn = 0;

    /**
     * Renderer is a module that encapsulates all the logic for rendering the game UI.
     */
    var renderer = function () {
        /**
         * The canvas object that will be used to render the game.
         * @type {HTMLElement}
         */
        var canvas = document.getElementById('viewport');

        /**
         * The context used for drawing on the canvas.
         */
        var context = canvas.getContext('2d');

        /**
         * The current width of the canvas. Initialized to the width of the window.
         * @type {Number}
         */
        var width = canvas.width = window.innerWidth;

        /**
         * The current height of the canvas. Initialized to the height of the window.
         * @type {Number}
         */
        var height = canvas.height = window.innerHeight;

        /**
         * The current pixel height of a row.
         * @type {number}
         */
        var rowHeight = 0;

        /**
         * The current pixel width of a column.
         * @type {number}
         */
        var colWidth = 0;

        /**
         * Clears the UI and renders a new board.
         */
        var renderBoard = function () {
            context.clearRect(0, 0, width, height);
            context.beginPath();

            // draw rows
            rowHeight = height / GRID_SIZE;
            for (var r = 1; r < GRID_SIZE; r++) {
                var yPosition = r * rowHeight;
                context.moveTo(0, yPosition);
                context.lineTo(width, yPosition);
            }
            // draw columns
            colWidth = width / GRID_SIZE;
            for (var c = 1; c < GRID_SIZE; c++) {
                var xPosition = c * colWidth;
                context.moveTo(xPosition, 0);
                context.lineTo(xPosition, height);
            }

            context.stroke();
        };

        /**
         * Redraws the board based on the game state.
         */
        var redraw = function () {
            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    var player = data[r][c];
                    if (player !== 0) {
                        renderPlayerMark(r, c, player)
                    }
                }
            }
        };

        /**
         * Renders a players mark in the given cell.
         * @param row the index of the cells row
         * @param column the index of the cells column
         * @param player the player to draw the mark of
         */
        var renderPlayerMark = function (row, column, player) {
            var coordinates = getCellTopLeft(row, column);
            player.renderMark(coordinates.x, coordinates.y, colWidth, rowHeight, context);
        };

        /**
         * Utility method that gets the x and y coordinates of the top left corner of a given cell.
         * @param row the index of the cells row
         * @param column the index of the cells column
         * @returns {{x: number, y: number}}
         */
        var getCellTopLeft = function (row, column) {
            var x = column * colWidth;
            var y = row * rowHeight;

            return {
                x: x,
                y: y
            };
        };

        /**
         * Utility method that gets the cells row and column indices given a pixel (x,y) coordinate.
         * @param pixelX the x coordinate
         * @param pixelY the y coordinate
         * @returns {{row: number, col: number}}
         */
        var getCellIndices = function (pixelX, pixelY) {
            var row = Math.floor(pixelY / rowHeight);
            var col = Math.floor(pixelX / colWidth);
            return {
                row: row,
                col: col
            };
        };

        /**
         * Handles click events on the canvas object by firing a cellClick event with the indices of the cell that was
         * clicked.
         * @param event the click event
         */
        var onCanvasClicked = function (event) {
            var cell = getCellIndices(event.clientX, event.clientY);
            document.dispatchEvent(new CustomEvent('cellClick', {detail: {row: cell.row, col: cell.col}}))
        };

        /**
         * Handles resize events on the window by recalculating the canvas width and height and redrawing the board.
         */
        var onWindowResize = function () {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            renderBoard();
            redraw();
        };

        window.addEventListener('resize', onWindowResize);
        canvas.addEventListener('click', onCanvasClicked);

        return {
            renderBoard: renderBoard,
            renderPlayerMark: renderPlayerMark
        };
    }();

    /**
     * Register the player with the game.
     * @param player
     */
    var registerPlayer = function (player) {
        players.push(player);

        if (players.length == 2) {
            players[0].score = 1;
            players[1].score = -1;
            document.dispatchEvent(new CustomEvent('playersReady'));
        }
    };

    /**
     * Initializes the ui, game state and hooks up event listeners needed by the game.
     */
    var startNewGame = function () {
        initializeGameData();
        renderer.renderBoard();
    };

    /**
     * Initializes the game state.
     */
    var initializeGameData = function () {
        for (var r = 0; r < GRID_SIZE; r++) {
            data[r] = [];
            for (var c = 0; c < GRID_SIZE; c++) {
                data[r][c] = 0;
            }
        }

        var scoreSize = 2 * GRID_SIZE + 2; // rows, columns, two diagonals
        for (var s = 0; s < scoreSize; s++) {
            scores[s] = 0;
        }

        curPlayer = players[0];
        turn = 0;
    };

    /**
     * Handles cellClick events by storing the data, telling the renderer to render the mark, updating scores and ending
     * the turn.
     * @param event
     */
    var onCellClicked = function (event) {
        var row = event.detail.row;
        var col = event.detail.col;
        if (data[row][col] !== 0) {
            alert('Already marked, choose again.');
            return;
        }
        data[row][col] = curPlayer;
        renderer.renderPlayerMark(row, col, curPlayer);
        updateScores(row, col, curPlayer);
        endTurn();
    };

    /**
     * Updates the scores for each row, column and diagonal.
     * @param row the index of the row that was marked
     * @param col the index of the column that was marked
     * @param player the player that marked the cell
     */
    var updateScores = function (row, col, player) {
        var point = player.score;
        scores[row] += point;
        scores[GRID_SIZE + col] += point;

        if (row === col) {
            scores[2 * GRID_SIZE] += point;
        }

        if ((GRID_SIZE - 1 - col) === row) {
            scores[2 * GRID_SIZE + 1] += point;
        }
    };

    /**
     * Ends the turn by determining if there was a winner, or a stalemate, or if the game should continue.
     */
    var endTurn = function () {
        var result = turnResult();

        if (result == undefined) {
            turn++;
            curPlayer = players[turn % players.length];
            return;
        }

        var restart = confirm('Winner is ' + result + '! Restart?');

        if (restart) {
            startNewGame();
        }
    };

    /**
     * Determines the result of the turn.
     * @returns {undefined} if there is no winner or {string} representing the winner
     */
    var turnResult = function () {
        var result = undefined;
        var scoresSize = scores.length;
        for (var i = 0; i < scoresSize; i++) {
            var score = scores[i];
            var playersSize = players.length;
            for (var playerIndex = 0; playerIndex < playersSize; playerIndex++) {
                var player = players[playerIndex];
                if (player.score === (score / GRID_SIZE)) {
                    result = player.name;
                    break;
                }
            }
        }

        if (!result && checkStalemate()) {
            result = 'nobody';
        }

        return result;
    };

    /**
     * Checks whether the board is in a state of stalemate (no more moves available but nobody has won).
     * @returns {boolean}
     */
    var checkStalemate = function () {
        var merged = [].concat.apply([], data);
        return !merged.some(function (element) {
            return element === 0;
        })
    };

    document.addEventListener('cellClick', onCellClicked);
    document.addEventListener('playersReady', startNewGame);

    return {
        registerPlayer: registerPlayer
    };
}();

/**
 * A player object that stores what the score marker will be for the player, as well as a function that determines
 * how the mark is made on a canvas.
 * @constructor
 * @param name the name of the player
 * @param mark the function that will draw this players mark on the board
 */
var Player = function (name, mark) {
    this.name = name;
    this.renderMark = mark;
};

var playerX = new Player('X', function (x, y, xOffset, yOffset, context) {
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + xOffset, y + yOffset);
    context.moveTo(x + xOffset, y);
    context.lineTo(x, y + yOffset);

    context.stroke();
});

var playerO = new Player('O', function (x, y, xOffset, yOffset, context) {
    var xRadius = xOffset / 2.0;
    var yRadius = yOffset / 2.0;
    var centerX = xRadius + x;
    var centerY = yRadius + y;

    context.beginPath();
    context.arc(centerX, centerY, Math.min(xRadius, yRadius), 0, 2 * Math.PI);

    context.stroke();
});

game.registerPlayer(playerX);
game.registerPlayer(playerO);

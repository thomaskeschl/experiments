game = function () {

    var GRID_SIZE = 3;
    var rowHeight = 0;
    var colWidth = 0;
    var data = [];
    var scores = [];
    var curPlayer = 0;
    var canvas = document.getElementById('viewport');

    var Player = function (point, mark) {
        this.point = point;
        this.drawChit = mark;
    };

    var playerX = new Player(1, function (x, y, xOffset, yOffset, context) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(x + xOffset, y + yOffset);
        context.moveTo(x + xOffset, y);
        context.lineTo(x, y + yOffset);

        context.stroke();
    });

    var playerO = new Player(-1, function (x, y, xOffset, yOffset, context) {
        var xRadius = xOffset / 2.0;
        var yRadius = yOffset / 2.0;
        var centerX = xRadius + x;
        var centerY = yRadius + y;

        context.beginPath();
        context.arc(centerX, centerY, Math.min(xRadius, yRadius), 0, 2 * Math.PI);

        context.stroke();
    });

    var renderer = function () {

        var context = canvas.getContext('2d');

        var width = canvas.width = window.innerWidth;
        var height = canvas.height = window.innerHeight;

        var drawLines = function () {
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

        var drawState = function () {
            for (var r = 0; r < GRID_SIZE; r++) {
                for (var c = 0; c < GRID_SIZE; c++) {
                    var player = data[r][c];
                    if (player !== 0) {
                        drawPlayer(r, c, player)
                    }
                }
            }
        };

        var drawPlayer = function (row, column, player) {
            clearCell(row, column);
            var dimensions = getCellDimensions(row, column);
            player.drawChit(dimensions.xStart, dimensions.yStart, colWidth, rowHeight, context);
        };

        var clearCell = function (row, column) {
            var dimensions = getCellDimensions(row, column);
            context.clearRect(dimensions.xStart + 1, dimensions.yStart + 1, colWidth - 2, rowHeight - 2);
        };

        var getCellDimensions = function (row, column) {
            var xStart = column * colWidth;
            var yStart = row * rowHeight;

            return {
                xStart: xStart,
                yStart: yStart
            };
        };

        var getCell = function (pixelX, pixelY) {
            var row = Math.floor(pixelY / rowHeight);
            var col = Math.floor(pixelX / colWidth);
            return {
                row: row,
                col: col
            };
        };

        var onCanvasClicked = function (event) {
            var cell = getCell(event.clientX, event.clientY);
            document.dispatchEvent(new CustomEvent('cellClick', {detail: {row: cell.row, col: cell.col}}))
        };

        var onWindowResize = function () {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            drawLines();
            drawState();
        };

        window.addEventListener('resize', onWindowResize);
        canvas.addEventListener('click', onCanvasClicked);

        return {
            drawBoard: drawLines,
            drawPlayer: drawPlayer
        };
    }();

    var init = function () {
        initData();
        renderer.drawBoard();

        document.addEventListener('cellClick', onCellClicked)
    };

    var initData = function () {
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

        curPlayer = playerX;
    };

    var onCellClicked = function (event) {
        var row = event.detail.row;
        var col = event.detail.col;
        if (data[row][col] !== 0) {
            alert('Already marked, choose again.');
            return;
        }
        data[row][col] = curPlayer;
        renderer.drawPlayer(row, col, curPlayer);
        updateSums(row, col, curPlayer);
        endTurn();
    };

    var updateSums = function (row, col, player) {
        var point = player.point;
        scores[row] += point;
        scores[GRID_SIZE + col] += point;

        if (row === col) {
            scores[2 * GRID_SIZE] += point;
        }

        if ((GRID_SIZE - 1 - col) === row) {
            scores[2 * GRID_SIZE + 1] += point;
        }
    };

    var endTurn = function () {
        var scoresSize = scores.length;
        var winner = '';
        for (var i = 0; i < scoresSize; i++) {
            var score = scores[i];

            if (score === GRID_SIZE) {
                winner = 'X';
                break;
            } else if (score === -1 * GRID_SIZE) {
                winner = 'O';
                break;
            }
        }

        if (winner === '' && checkStalemate()) {
            winner = 'nobody';
        } else if (winner === '') {
            curPlayer = (curPlayer === playerX) ? playerO : playerX;
            return;
        }

        var restart = confirm('Winner is ' + winner + '! Restart?');

        if (restart) {
            init();
        }
    };

    var checkStalemate = function() {
        var merged = [].concat.apply([], data);
        return !merged.some(function(element){return element === 0;})
    };

    return {
        init: init
    };
}();

game.init();

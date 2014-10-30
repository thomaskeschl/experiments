game = function () {
    var canvas = null;
    var context = null;
    var GRID_SIZE = 3;
    var rowHeight = 0;
    var colWidth = 0;
    var data = [];
    var scores = [];
    var curPlayer = 0;

    var init = function () {
        initData();

        canvas = document.getElementById('viewport');
        context = canvas.getContext('2d');
        var width = canvas.width = window.innerWidth;
        var height = canvas.height = window.innerHeight;

        draw(width, height);

        canvas.addEventListener('click', clickBoard);
        window.addEventListener('resize', windowResized);
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

        curPlayer = 1;
    };

    var draw = function (width, height) {
        drawLines(width, height);
        drawState();
    };

    var drawLines = function (width, height) {
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
                var cellData = data[r][c];
                switch (cellData) {
                    case 1:
                        drawX(r, c);
                        break;
                    case -1:
                        drawO(r, c);
                        break;
                    case 0:
                    default:
                    // do nothing
                }
            }
        }
    };

    var drawX = function (row, column) {
        clearCell(row, column);
        var dimensions = getCellDimensions(row, column);
        context.moveTo(dimensions.xStart, dimensions.yStart);
        context.lineTo(dimensions.xStart + colWidth, dimensions.yStart + rowHeight);
        context.moveTo(dimensions.xStart + colWidth, dimensions.yStart);
        context.lineTo(dimensions.xStart, dimensions.yStart + rowHeight);

        context.stroke();
    };

    var drawO = function (row, column) {
        clearCell(row, column);
        var dimensions = getCellDimensions(row, column);
        var xRadius = colWidth / 2.0;
        var yRadius = rowHeight / 2.0;
        var centerX = xRadius + dimensions.xStart;
        var centerY = yRadius + dimensions.yStart;

        context.beginPath();
        context.arc(centerX, centerY, Math.min(xRadius, yRadius), 0, 2 * Math.PI);

        context.stroke();
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

    var clickBoard = function (event) {
        var cell = getCell(event.clientX, event.clientY);
        if (data[cell.row][cell.col] !== 0) {
            alert('Already marked, choose again.');
            return;
        }
        data[cell.row][cell.col] = curPlayer;
        drawState();
        updateSums(cell.row, cell.col, curPlayer);
        endTurn();
    };

    var windowResized = function () {
        var width = canvas.width = window.innerWidth;
        var height = canvas.height = window.innerHeight;
        draw(width, height);
    };

    var getCell = function (pixelX, pixelY) {
        var row = Math.floor(pixelY / rowHeight);
        var col = Math.floor(pixelX / colWidth);
        return {
            row: row,
            col: col
        };
    };

    var updateSums = function (row, col, player) {
        scores[row] += player;
        scores[GRID_SIZE + col] += player;

        if (row === col) {
            scores[2 * GRID_SIZE] += player;
        }

        if ((GRID_SIZE - 1 - col) === row) {
            scores[2 * GRID_SIZE + 1] += player;
        }
    };

    var endTurn = function () {
        var scoresSize = scores.length;
        var restart = false;
        for (var i = 0; i < scoresSize; i++) {
            var score = scores[i];
            var winner = '';

            if (score === GRID_SIZE) {
                winner = 'X';
            } else if (score === -1 * GRID_SIZE) {
                winner = 'O'
            }

            var stalemate = checkStalemate();
            if(stalemate) {
                winner = 'nobody';
            }

            if (winner !== '') {
                restart = confirm('Winner is ' + winner + '! Restart?');
                break;
            }
        }

        if (restart) {
            init();
            return;
        }

        curPlayer *= -1;
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

// app/routes.js
var path = require('path');

module.exports = function (app) {

    // server routes ===========================================================
    // handle things like api calls
    // authentication routes

    // route to handle creating goes here (app.post)
    // route to handle delete goes here (app.delete)

    // frontend routes =========================================================
    // route to handle all angular requests
    app.get('*', function (req, res) {
        res.sendfile('./public/main.html'); // load our public/index.html file
    });

};
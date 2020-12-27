const config = require('./config');
const db = require('./database');
const express = require('express');
const app = express();

// schedule.scheduleJob('0 * * * *', () => {
//     db.getPlrs().then(plrs => {
//         plrs.map(p => { getGames(p) });
//     });
// });

app.listen(3000, () => {
    console.log("Server listening on port 3000")
})
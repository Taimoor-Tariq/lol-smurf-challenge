const config = require('./config');
const db = require('./database');
const express = require('express');
const app = express();

// schedule.scheduleJob('0 * * * *', () => {
//     db.getPlrs().then(plrs => {
//         plrs.map(p => { getGames(p) });
//     });
// });


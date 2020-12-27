const config = require('./config');
const schedule = require('node-schedule');
const rp = require('request-promise');
const db = require('./database');

// schedule.scheduleJob('0 * * * *', () => {
// schedule.scheduleJob('0 * * * * *', async () => {
//     db.getPlrs().then(plrs => {
//         plrs.map(p => {
//             console.log(p)
//         })
//     })
//     // rp.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/-PlWICvnUsQVBaQD_45W7dPDq0lyXgOG_ihyaB2RsNo0HOZxzC70wIA0?queue=420&api_key=${process.env.RIOT_API_KEY}`)
// });

/**
 * 400
 */

let getGames = (plr) => {
    // plrGames = JSON.parse(plr.GAMES);
    rp.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${plr.ID}?queue=420&beginIndex=${plr.LAST_RECORDED}&api_key=${config.RIOT_API_KEY}`)
        .then(res => {
            res = JSON.parse(res);
            db.updateLastRecorded(plr.ID, res.totalGames);
        }).catch(err => {
            err = JSON.parse(err.error);
            switch (err.status.status_code) {
                case 400:
                    db.fixID(plr.SUMMONER_NAME).then(newID => {
                        plr.ID = newID;
                        getGames(plr);
                    });
                    break;
            
                default:
                    console.error(err);
                    break;
            }
        });
}

let main = async () => {
    db.getPlrs().then(plrs => {
        plrs.map(p => { getGames(p) });
    });
}

main();
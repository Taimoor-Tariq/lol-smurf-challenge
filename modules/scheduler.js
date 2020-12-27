const config = require('../config');
const schedule = require('node-schedule');
const rp = require('request-promise');
const db = require('../database');

let getGames = (plr) => {
    plrGames = JSON.parse(plr.GAMES);
    rp.get(`https://na1.api.riotgames.com/lol/match/v4/matchlists/by-account/${plr.ID}?queue=420&beginIndex=${plr.LAST_RECORDED}&api_key=${config.RIOT_API_KEY}`)
        .then(res => {
            res = JSON.parse(res);
            let prom = res.matches.map(m => {
                plrGames.push({
                    id: m.gameId,
                    lane: m.lane,
                    time: m.timestamp,
                    champ: m.champion
                });
            });

            Promise.all(prom).then(() => {

                db.updateGames(plr.ID, JSON.stringify(plrGames));
                db.updateLastRecorded(plr.ID, res.totalGames);
            })
        }).catch(err => {
            err = JSON.parse(err.error);
            switch (err.status.status_code) {
                case 400:
                    db.fixID(plr.SUMMONER_NAME).then(newID => {
                        plr.ID = newID;
                        getGames(plr);
                    });
                    break;

                case 404:
                    break;
            
                default:
                    console.error(err);
                    break;
            }
        });
}

let min = 0;
schedule.scheduleJob('0 * * * * *', () => {
    min++;
    if (min == 5) {
        min = 0;
        db.getPlrs().then(plrs => plrs.map(p => getGames(p)));
    }
});
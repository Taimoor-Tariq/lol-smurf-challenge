const config = require('../config');
const rp = require('request-promise');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/plr-data.db');


exports.getPlrs = (name=null) => {
    if (name) return new Promise(resolve => {
        db.all(`SELECT * FROM 'PLAYERS' WHERE SUMMONER_NAME='${name}'`, [], (err, res) => {
            if (err) resolve([]);
            else resolve(res);
        })
    });
    else return new Promise(resolve => {
        db.all(`SELECT * FROM 'PLAYERS'`, [], (err, res) => {
            if (err) resolve([]);
            else resolve(res);
        })
    });
}

exports.addPlr = (name, discord=null) => {
    return new Promise(resolve => {
        rp.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${config.RIOT_API_KEY}`)
            .then(res => {
                res = JSON.parse(res);
                db.run(`INSERT INTO 'PLAYERS' (ID, SUMMONER_ID, SUMMONER_NAME, DISCORD) VALUES ("${res.accountId}", "${res.id}", "${name}", "${discord}")`, [], (err) => {
                    if (err) resolve(false);
                    else resolve(true);
                });
            })
            .catch(e => resolve(false));
    });
}


exports.fixID = (name) => {
    return new Promise(resolve => {
        rp.get(`https://na1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${name}?api_key=${config.RIOT_API_KEY}`)
            .then(res => {
                res = JSON.parse(res);
                db.run(`UPDATE 'PLAYERS' SET ID='${res.accountId}' WHERE SUMMONER_NAME='${name}'`, [], (err) => {
                    if (err) resolve(null);
                    else resolve(res.accountId);
                });
            })
            .catch(e => resolve(null));
    });
}


exports.updateLastRecorded = (id, val) => {
    return new Promise(resolve => {
        db.run(`UPDATE 'PLAYERS' SET LAST_RECORDED='${val}' WHERE ID='${id}'`, [], (err) => {
            if (err) resolve(false);
            else resolve(true);
        });
    });
}


exports.updateGames = (id, games) => {
    return new Promise(resolve => {
        db.run(`UPDATE 'PLAYERS' SET GAMES='${games}' WHERE ID='${id}'`, [], (err) => {
            if (err) resolve(err);
            else resolve(null);
        });
    });
}
var express = require('express');
var app = express();
var fs = require("fs");
var mysql = require('mysql');
const http = require('http');
var request = require ('request');

var bodyParser = require('body-parser')
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));
var api = express.Router();
app.use('/1.0', api);

var con = mysql.createConnection({
  host: "localhost", 
  user: "root", 
  password: "", 
  database: "FFXIV"
});

con.connect(function(err) {
  if (err) {
    console.log(err);
    res.status(500);
    res.send("MySQL error");
}
console.log("Connected!");
});


api.get('/fullteam/:id', function(req,res){
    con.query( 'SELECT name, class, set_id from characters_teams INNER JOIN characters ON characters_teams.character_id = characters.id WHERE team_id = ?', [req.params.id], function (err, result) {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }

        players = []
        console.log("fetching")

        promises=[]
        for (var i =0; i< result.length; i++) {
            promises.push(
                new Promise(function(resolve, reject) {
                    //TODO
                    con.query("SELECT name, amount, currency, type, instance FROM items inner join sets on items.id = sets.item_id where set_id = ?",[result[i].set_id] ,function (err, set_result) {
                        resolve(set_result)
                    })
                })
            )
        }
        Promise.all(promises).then(saves => {
            for (var i =0; i< result.length; i++) {
                players.push({
                    "name" : result[i].name,
                    "job"  : result[i].class,
                    "set"  : saves[i],
                })
            }
            res.send(players);
        })
    })
});

api.get('/teams/:player_id', function(req, res){
    con.query('select team_id,character_id,class,set_id,name from characters_teams inner join teams on characters_teams.team_id = teams.id where character_id = ?', [req.params.player_id], function(err, result){
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        res.send(result)
    })
})

// TODO c'est beugué de ouf
api.get('/instance/:name', function (req, res) {
    var names = req.params.name
    con.query('select distinct type, amount from items where amount > 1 and instance=?',[names] , function (err, result) {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }  
        str={"name": names,"drop":result}
        res.send(str);
    });
})

api.get('/player/:id', function (req, res) {
    var id = req.params.id;
    // TODO la requête n'a pas changée avec le modèle
    var sql = 'SELECT * FROM characters inner join characters_items on characters.id = characters_items.character_id inner join sets on characters_items.id = sets.character_item_id WHERE characters.id = ?;';
    con.query( sql, [id] , function (err, result) {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        res.send(result);
    });

});

//TODO il n'y a pas de set à tester
api.get('/set/:id', function (req, res) {
    con.query( 'SELECT name, amount, currency, type, instance FROM items inner join sets on items.id = sets.item_id where set_id = ?;', [req.params.id] , function (err, result) {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        res.send(result);
    });

});

api.get('/team/:id', function (req, res) {
    var id = req.params.id;
    var sql = 'SELECT * FROM characters_teams WHERE team_id = ? ;';
    con.query( sql, [id] , function (err, result) {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        res.send(result);
    });

});

/*api.get('/instance', function (req, res) {
    var sql = 'SELECT * FROM instance;';
    con.query( sql, function (err, result) {
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        res.send(result);
    });
});*/


api.get('/class', function(req, res){
    con.query('select * from class;', function(err, result){
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        res.send(result);
    })
});


api.post('/set', function (req, res) {
    var char_id = 0;
    //TODO set char_id avec le champ name
    //select id from character where name=(?)
    //si le nom existe pas : erreur pas d'insertion dans la bdd du tout (pop up voulez vous crée un mec ?)
    char_id = 1;
    if(req.body == {} || typeof req.body.link === typeof undefined || req.body.link.length != 5){
        res.status(400)
        res.send("put a valid ariyala link here please")
    }
    else{
        id=req.body.link
        http.get("http://ffxiv.ariyala.com/store.app?identifier="+id, function(res1){
            res1.on("data", function(data){
                truc = JSON.parse(data);
                items = Object.values(truc.datasets[truc.content].normal.items);
                request({
                    header:{
                        'Content-Type' :"application/x-www-form-urlencoded"
                    }, 
                    uri: "http://ffxiv.ariyala.com/items.app", 
                    body: '{"queries":[{"items":['+items+']}], "existing":[]}', 
                    method: 'POST'
                }, function(error, response, data){
                    data = JSON.parse(data);
                    if(data.length==11 || data.length==12){
                        console.log('blu')
                        con.query('select count(*) as nb from sets_list where id = ?;', [id] , function(err, result){
                            if (err) {
                                console.log(err);
                                res.status(500);
                                res.send("MySQL error");
                            }
                            if(char_id != 0){
                                con.query('insert into characters_sets (set_id, character_id) values (?,?)',[id,char_id], function(err, result){
                                    if (err) {
                                        console.log(err);
                                        res.status(500);
                                        res.send("MySQL error");
                                    }
                                })
                            }
                            if (result[0].nb == 0) {
                                con.query('insert into sets_list (id) values (?);', [id], function(err, result){
                                    if (err) {
                                        console.log(err);
                                        res.status(500);
                                        res.send("MySQL error");
                                    }
                                });
    console.log(req.body);
                                for (var i = data.length - 1; i >= 0; i--) {
                                    if(typeof data[i].source.crafting !== typeof undefined){
                                        stars = "";
                                        for (var j = data[i].source.crafting.stars.length - 1; j >= 0; j--) {
                                            stars += "★"
                                        }
                                        craft = data[i].source.crafting.class +" (" + stars+")";
                                        dataSQL = [data[i].name.en, 0, null, data[i].slot, craft]
                                    }
                                    else if(typeof data[i].source.purchase === typeof undefined){
                                        dataSQL = [data[i].name.en, 0, null, data[i].slot, data[i].source.drop.name]
                                    }else if (typeof data[i].source.drop === typeof undefined){
                                        console.log(data[i].source)
                                        dataSQL = [data[i].name.en, data[i].source.purchase[0].price[0][0].amount, data[i].source.purchase[0].price[0][0].item, data[i].slot, "purchase only"];
                                        con.query('insert ignore into currency (name) values (?);', [data[i].source.purchase[0].price[0][0].item], function(err, result){
                                            if (err) {
                                                console.log(err);
                                                res.status(500);
                                                res.send("MySQL error");
                                            }
                                        })
                                    }else{
                                        dataSQL = [data[i].name.en, data[i].source.purchase[0].price[0][0].amount, data[i].source.purchase[0].price[0][0].item, data[i].slot, data[i].source.drop.name];
                                        con.query('insert ignore into currency (name) values (?);', [data[i].source.purchase[0].price[0][0].item], function(err, result){
                                            if (err) {
                                                console.log(err);
                                                res.status(500);
                                                res.send("MySQL error");
                                            }
                                        })
                                    }
                                    if(typeof data[i].source.drop !== typeof undefined){
                                        con.query('insert ignore into instance (name) values (?);', [data[i].source.drop.name], function(err, result){
                                            if (err) {
                                                console.log(err);
                                                res.status(500);
                                                res.send("MySQL error");
                                            }
                                        })
                                    }
                                    dataSQL.push(data[i].itemID);
                                    con.query('insert ignore into items (name, amount, currency, type, instance, id) values (?, ?, ?, ?, ?, ?);', dataSQL, function(err, result){
                                        if (err) {
                                            console.log(err);
                                            res.status(500);
                                            res.send("MySQL error");
                                        }
                                    })
                                    con.query('insert into sets (item_id, set_id) values (?, ?);', [data[i].itemID, id], function(err, result){
                                        if (err) {
                                            console.log(err);
                                            res.status(500);
                                            res.send("MySQL error");
                                        }
                                    })
                                    if (char_id != 0) {
                                        con.query('insert ignore into characters_items (item_id, character_id) values (?,?)',[data[i].itemID,char_id], function(err, result){
                                            if (err) {
                                                console.log(err);
                                                res.status(500);
                                                res.send("MySQL error");
                                            }
                                        })
                                    }
                                }
                            }
                        })
                    }
                    else{
                        res1.status(400)
                        res1.send("set pas complet");
                    }
                })
            })          
        })
    }
    res.status(200)
});

api.put('/set/:id', function (req, res) {
// ça fonctionne bien là

});

api.post('/team', function (req, res) {
    con.query('select count(*) as nb from teams where name = ?;', [req.body.name] , function(err, result){
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        if (result[0].nb == 0) {
            con.query('insert into teams (name) values (?);', [req.body.name], function(err, result){
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.send("MySQL error");
                }
            });
            con.query('select id from teams where name = ?;', [req.body.name], function(err, result){
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.send("MySQL error");
                }
                id = result[0].id
                for (var j = req.body.player.length - 1; j >= 0; j--) {
                    var i=j
                    con.query('insert into characters_teams (team_id, character_id, class) values (?, (select id from characters where name = ?), ?);', [id, req.body.player[i].name, req.body.player[i].class], function(err, result){
                        if(err) {
                            console.log(err);
                            res.status(500);
                            res.send("MySQL error");
                        }
                    });
                }
                res.status(200)
                res.send('ok')
            });
        }
        else{
            res.status(400)
            res.send("une team a déjà ce nom");
        }
    });  

});

api.put('/team/:id', function (req, res) {
  con.query('insert into characters_teams(team_id, character_id) values (?, (select id from characters where name = ?), ?)', [id, req.body.player[0], req.body.player[1]], function(err, result){
        if(err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
    });
});

api.post('/character', function (req, res) {
    if(typeof req.body.name === typeof undefined){
        res.status(400);
        res.send("name missing")
        return
    }
    con.query('select count(*) as nb from characters where name = ?;', [req.body.name] , function(err, result){
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        if(result[0].nb == 0){
            con.query('insert into characters (name) values (?);', [req.body.name], function(err, result){
                if (err) {
                    console.log(err);
                    res.status(500);
                    res.send("MySQL error");
                }
            });
            res.status(200)
            res.send("OK")
        }
        else{
            res.status(400)
            res.send("name already used");
        }
    }); 
});

api.put('/character', function (req, res) {
    con.query('select count(*) as nb from characters where name = ?;', [req.body.name] , function(err, result){
        if (err) {
            console.log(err);
            res.status(500);
            res.send("MySQL error");
        }
        if(result[0].nb == 0){
            con.query('update characters set name=? where id = ?', [req.body.name, parseInt(req.body.id)], function(err, result){
                if(err) {
                    console.log(err);
                    res.status(500);
                    res.send("MySQL error");
                }
                res.status(200)
                res.send("ok")
            })
        }
        else{
            res.send("Name already taken");
        }
    });
});






var server = app.listen(3210, function () {

    var host = server.address().address
    var port = server.address().port
    console.log("Listening at http://%s:%s", host, port)

})

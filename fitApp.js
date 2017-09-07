//Tera Schaller
//Assignment week 9
//fitness tracker

//express and mysql
var express = require('express');
var mysql = require('./tschal.js');

//set up app and handlebars
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 12529);
//add the other stuff

//bodyparser - parses incoming http request bodyparser
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//request
var request = require('request');

//that public/static thingy
app.use(express.static('public'));

//handlers
//renders all the data as stringified rows
app.get('/', function(req,res,next){
  var context = {};
  mysql.pool.query('SELECT * FROM fit', function(err, rows, fields){
    if(err){
      next(err);
      return;
    }
    context.results = JSON.stringify(rows);
    res.render('home', context);
  });
});

//do i need a function to make it prettier??
//app.get('/data', ...)

//change these app.gets to app.post
//in home.handlebars, change forms methods to post
//improve insert to include other data?
app.get('/insert',function(req,res,next){
  var context = {};
  mysql.pool.query("INSERT INTO fit (`name`) VALUE (?)", [req.query.c], function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Inserted id " + result.insertId;
    res.render('home', context);
  });
});

app.get('/delete', function(req,res,next){
  var context = {};
  mysql.pool.query("DELETE FROM fit WHERE id=?", [req.query.id], function(err,result){
    if(err){
      next(err);
      return;
    }
    context.results = "Deleted " + result.changedRows + " rows.";
    res.render('home', context);
  });
});


///simple-update?id=1&name=curl&reps=5&weight=10&date=2017-10-13&lbs=1
app.get('/simple-update', function(req,res,next){
  var context = {};
  mysql.pool.query("UPDATE fit SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
    [req.query.name, req.query.reps, req.query.weight, req.query.date, req.query.lbs, req.query.id],
    function(err, result){
    if(err){
      next(err);
      return;
    }
    context.results = "Updated " + result.changedRows + " rows.";
    res.render('home', context);
  });
});

///safe-update?id=1&name=bench+press&weight=150
app.get('/safe-update', function(req,res,next){
  var context = {};
  mysql.pool.query("SELECT * FROM fit WHERE id=?", [req.query.id], function(err, result){
    if(err){
      next(err);
      return;
    }
    if(result.length == 1){
      var curVals = result[0];
      mysql.pool.query("UPDATE fit SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=?",
      [req.query.name || curVals.name, req.query.reps || curVals.reps, req.query.weight || curVals.weight, req.query.date || curVals.date, req.query.lbs || curVals.lbs, req.query.id],
      function(err, result){
      if(err){
        next(err);
        return;
      }
      context.results = "Updated " + result.changedRows + " rows.";
      res.render('home', context);
      });
    }
  });
});

//NOT for production, only testing
app.get('/reset-table',function(req,res,next){
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS fit", function(err){ //replace your connection pool with the your variable containing the connection pool
    var createString = "CREATE TABLE fit(" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "name VARCHAR(255) NOT NULL," +
    "reps INT," +
    "weight INT," +
    "date DATE," +
    "lbs BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
    })
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});


/*
References
Body parser
https://www.quora.com/What-exactly-does-body-parser-do-with-express-js-and-why-do-I-need-it
http://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4
request
http://stackabuse.com/the-node-js-request-module/
*/

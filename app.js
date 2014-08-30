
/**
	* Node.js Login Boilerplate
	* More Info : http://bit.ly/LsODY8
	* Copyright (c) 2013 Stephen Braitsch
**/

var express = require('express');
var socket = require('socket.io');
var http = require('http');
var path = require('path');
var app = express();
var i18n = require('i18next');
var passport = require('passport');
var flash    = require('connect-flash');
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
var hbs = require('hbs');


//decode HTML
var Entities = require('html-entities').AllHtmlEntities;

mongoose.connect(configDB.url); // connect to our database


//hbs.registerPartial('partial', fs.readFileSync(__dirname + '/app/server/views/partial.hbs', 'utf8'));
hbs.registerPartials(__dirname + '/app/server/views/includes');



require('./config/passport')(passport); // pass passport for configuration

i18n.init({
    saveMissing: true,
    debug: true
});


function compile(str, path) {
  return stylus(str)
    .set('filename', path)
    .use(nib())
}


app.configure(function(){
	app.set('port', 80);
	app.engine('html', require('hbs').__express);
	app.set('views', __dirname + '/app/server/views');
	app.set('view engine', 'html');
    app.use(i18n.handle);
	app.locals.pretty = true;
	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(express.favicon());
  	app.use(express.logger('dev'));	
	app.use(express.bodyParser({ 
			keepExtensions: true, 
			uploadDir: __dirname + '/tmp',
			limit: '10mb'
	}));
	app.use(express.cookieParser());
	app.use(express.session({ secret: 'super-duper-secret-secret' }));
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/app/public' }));
	app.use(express.static(__dirname + '/app/public'));
	app.use(express.static(__dirname + '/app/server'));

	app.use(passport.initialize());
	app.use(passport.session()); // persistent login sessions
	app.use(flash()); // use connect-flash for flash messages stored in session	
	app.use(express.static(path.join(__dirname, '/app/public')));

});

require('./app/server/router')(app, passport);



i18n.registerAppHelper(app);
app.configure('development', function(){
	app.use(express.errorHandler());
});






	hbs.registerHelper('equal', function(lvalue, rvalue, options) {
	    if (arguments.length < 3)
	        throw new Error("Handlebars Helper equal needs 2 parameters");
	    if( lvalue!=rvalue ) {
	        return options.inverse(this);
	    } else {
	        return options.fn(this);
	    }
	});

	hbs.registerHelper('stripes', function(array, even, odd, fn, elseFn) {
	  if (array && array.length > 0) {
	    var buffer = '';
	    for (var i = 0, j = array.length; i < j; i++) {
	      var item = array[i];
	 
	      // we'll just put the appropriate stripe class name onto the item for now
	      item.stripeClass = (i % 2 == 0 ? even : odd);
	 
	      // show the inside of the block
	      buffer += fn(item);
	    }
	 
	    // return the finished buffer
	    return buffer;
	  }
	  else {
	    return elseFn();
	  }
	});


 function forEach(collection, callback, thisArg) {
    var index = -1,
        length = collection ? collection.length : 0;

    callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
    if (typeof length == 'number') {
      while (++index < length) {
        if (callback(collection[index], index, collection) === indicatorObject) {
          break;
        }
      }
    } else {
      forOwn(collection, callback);
    }
  }
// http.createServer(app).listen(app.get('port'), function(){
// 	console.log("Express server listening on port " + app.get('port'));
	
// })

//app.locals.

var escape = {
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;"
  };

  var badChars = /[&<>"'`]/g;
  var possible = /[&<>"'`]/;

  var escapeChar = function(chr) {
    return escape[chr] || "&amp;";
  };

  hbs.Utils = {
    escapeExpression: function(string) {
      // don't escape SafeStrings, since they're already safe
      if (string instanceof Handlebars.SafeString) {
        return string.toString();
      } else if (string == null || string === false) {
        return "";
      }

      if(!possible.test(string)) { return string; }
      return string.replace(badChars, escapeChar);
    }
  }


   hbs.registerHelper('decode', function(context) {
      var html = context;
      // context variable is the HTML you will pass into the helper
      // Strip the script tags from the html, and return it as a Handlebars.SafeString
      return new hbs.SafeString(html);
    });


hbs.registerHelper('trimString', function(passedString) {
	var tailS="";
	if(passedString.length>(17)){
	tailS = '...';
	};
    var theString = passedString.substring(0,17)+tailS;
    return new hbs.SafeString(theString)
});


hbs.registerHelper('trimStringChat', function(passedString) {
	var tailS="";
	if(passedString.length>(7)){
	tailS = '..';
	};
    var theString = passedString.substring(0,7)+tailS;
    return new hbs.SafeString(theString)
});

hbs.registerHelper('json', function(context) {
    return JSON.stringify(context);
});

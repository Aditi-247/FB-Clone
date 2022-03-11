const express = require('express');
// const cookieparser = require('cookie-parser');
const cookieParser = require('cookie-parser');
const app = express();
const port = 8000;
// const passport = require('passport');
// const passportGoogle = require('./config/passport-auth');
const db = require('./config/mongoose');
// const port = 8000;
const expressLayouts = require('express-ejs-layouts');


app.use(express.urlencoded());
app.use(cookieParser());

app.use(express.static('./assets'));

app.use(expressLayouts);
// extract style and scripts from sub pages into the layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);

// make the uploads path available to the browser
app.use('/uploads', express.static(__dirname+'/uploads'));

// use express router
app.use('/', require('./routes'));

// set up the view engine
app.set('view engine', 'ejs');
app.set('views','./views');
// calling server
app.listen(port, function(err){
    if(err){
        console.log(`Error in running the server : ${err}`);
    }
     console.log(`Server is running on port: ${port}`);
});
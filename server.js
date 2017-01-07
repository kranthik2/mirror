const passport = require('passport');
const express = require('express');
const FitbitStrategy = require('passport-fitbit-oauth2').FitbitOAuth2Strategy;
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const bodyParser = require('body-parser');
const mongo = require('mongoskin');
const cookieParser = require('cookie-parser');
const server = express();

server.use("/public", express.static(__dirname + '/dist/'));
server.use("/app", express.static(__dirname + '/dist/'));
const http = require('http').Server(server);
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

const mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/mirrorappdb';
const store = new MongoDBStore({
    uri: mongoUri,
    collection: 'sessions'
});
const db = mongo.db(mongoUri, {
    nativeParser: true
});
db.bind('measurements');

server.use(bodyParser.json());
server.use(session({
    secret: process.env.SESSION_SECRET || 'adsfdsfga',
    store
}));

server.use(passport.initialize());
server.use(passport.session());
server.use(cookieParser());
const host = process.env.HOST || 'http://localhost:8080';
passport.use(new FitbitStrategy({
        clientID: process.env.ClientID,
        clientSecret: process.env.ClientSecret,
        callbackURL: host + "/auth/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        done(null, {
            token: accessToken
        });
    }
));

server.get('/',
    passport.authenticate('fitbit', {
        scope: ['activity', 'profile']
    }));

server.get('/auth/callback',
    passport.authenticate('fitbit', {
        failureRedirect: '/login'
    }),
    function(req, res) {
        res.cookie('oauth_access_token',req.user.token,{ maxAge: 900000});
        res.redirect('/app/index.html');
    }
);


const port = process.env.PORT || 8080;

http.listen(port, () => {
    console.log(`server running on port ${port}`);
});
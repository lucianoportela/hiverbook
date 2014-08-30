// load all the things we need
var LocalStrategy    = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy   = require('passport-google-oauth').OAuth2Strategy;

// load up the account model
var Account       = require('../app/models/account');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize accounts out of session

    // used to serialize the account for the session
    passport.serializeUser(function(account, done) {
        done(null, account.id);
    });

    // used to deserialize the account
    passport.deserializeUser(function(id, done) {
        Account.findById(id, function(err, account) {
            done(err, account);
        });
    });

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses accountname and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {
            Account.findOne({ 'local.email' :  email }, function(err, account) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no account is found, return the message
                if (!account)
                    return done(null, false, req.flash('loginMessage', 'No account found.'));

                if (!account.validPassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return account
                else
                    return done(null, account);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {

        // asynchronous
        process.nextTick(function() {

            //  Whether we're signing up or connecting an account, we'll need
            //  to know if the email address is in use.
            Account.findOne({'local.email': email}, function(err, existingAccount) {

                // if there are any errors, return the error
                if (err)
                    return done(err);

                // check to see if there's already a Account with that email
                if (existingAccount) 
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));

                //  If we're logged in, we're connecting a new local account.
                if(req.account) {
                    var account            = req.account;
                    account.local.email    = email;
                    account.local.password = account.generateHash(password);
                    account.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, account);
                    });
                } 
                //  We're not logged in, so we're creating a brand new account.
                else {
                    // create the account
                    var newAccount            = new Account();

                    newAccount.local.email    = email;
                    newAccount.local.password = newAccount.generateHash(password);

                    newAccount.save(function(err) {
                        if (err)
                            throw err;

                        return done(null, newAccount);
                    });
                }

            });
        });

    }));

    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================



    passport.use(new FacebookStrategy({

        clientID        : configAuth.facebookAuth.clientID,
        clientSecret    : configAuth.facebookAuth.clientSecret,
        callbackURL     : configAuth.facebookAuth.callbackURL,
        fileUpload      : true,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a account is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {

        console.log("facebook req  "+req);
        console.log("facebook refreshToken  "+refreshToken);
        console.log("token "+token);
        console.log("profileUrl "+profile.profileUrl );
        console.log("https://graph.facebook.com/"+profile.username+"/picture");

       



        // asynchronous
        process.nextTick(function() {


            // check if the account is already logged in
            if (!req.account) {

                Account.findOne({$or: [ { 'facebook.id' : profile.id }, { 'local.email' : profile.emails[0].value }, { 'google.email' : profile.emails[0].value }, { 'google.name' : profile.name.givenName + ' ' + profile.name.familyName } ]}, function(err, account) {
                    
                    if (err)
                        return done(err);

                    if (account) {

                        // if there is a account id already but no token (account was linked at one point and then removed)
                        if (!account.facebook.token) {
                            console.log("account id already but no token  "+token);
                         //   account.local.name     = profile.name.givenName + ' ' + profile.name.familyName;
                           // account.local.email    = profile.emails[0].value; 
                            account.facebook.token = token;
                            account.facebook.id    = profile.id;
                            account.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                            account.facebook.email = profile.emails[0].value;
                            


                            account.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, account);
                            });
                        }

                        return done(null, account); // account found, return that account
                    } else {
                        // if there is no Account, create them
                        var newAccount            = new Account();
                        console.log("newAccount "+profile.id);
                        newAccount.local.name     = profile.name.givenName + ' ' + profile.name.familyName;
                        newAccount.local.email    = profile.emails[0].value; 
                        newAccount.local.imgpath  ="https://graph.facebook.com/"+profile.id+"/picture?type=large";
                        newAccount.facebook.id    = profile.id;
                        newAccount.facebook.token = token;
                        newAccount.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                        newAccount.facebook.email = profile.emails[0].value;


                        newAccount.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newAccount);
                        });
                    }
                });

            } else {
                

                // Account already exists and is logged in, we have to link accounts
                var account            = req.account; // pull the account out of the session
                console.log("already exists and is logged  "+req.account);
              //  account.local.name     = profile.name.givenName + ' ' + profile.name.familyName;
              //  account.local.email    = profile.emails[0].value; 
                account.facebook.id    = profile.id;
                account.facebook.token = token;
                account.facebook.name  = profile.name.givenName + ' ' + profile.name.familyName;
                account.facebook.email = profile.emails[0].value;

                account.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, account);
                });

            }
        });

    }));

    
    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

        clientID        : configAuth.googleAuth.clientID,
        clientSecret    : configAuth.googleAuth.clientSecret,
        callbackURL     : configAuth.googleAuth.callbackURL,
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a account is logged in or not)

    },
    function(req, token, refreshToken, profile, done) {
        console.log("login com o google token "+token);

        // asynchronous
        process.nextTick(function() {

            // check if the account is already logged in
            if (!req.account) {
//{$or: [ { 'facebook.id' : profile.id }, { 'google.email' : profile.emails[0].value }, { 'google.name' : profile.name.givenName + ' ' + profile.name.familyName } ]}
                Account.findOne({$or: [ { 'google.id' : profile.id }, { 'local.email' : profile.emails[0].value }, { 'facebook.email' : profile.emails[0].value }, { 'facebook.name' : profile.displayName } ]}, function(err, account) {
                    if (err)
                        return done(err);

                    if (account) {

                        // if there is a account id already but no token (account was linked at one point and then removed)
                        if (!account.google.token) {
                            account.google.token = token;
                            account.google.id    = profile.id;
                            account.google.name  = profile.displayName;
                            account.google.email = profile.emails[0].value; // pull the first email

                            account.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, account);
                            });
                        }

                        return done(null, account);
                    } else {
                        var newAccount          = new Account();

                        newAccount.local.name   = profile.displayName;
                        newAccount.local.email  = profile.emails[0].value; // pull the first email
                        newAccount.google.id    = profile.id;
                        newAccount.google.token = token;
                        newAccount.google.name  = profile.displayName;
                        newAccount.google.email = profile.emails[0].value; // pull the first email

                        newAccount.save(function(err) {
                            if (err)
                                throw err;
                            return done(null, newAccount);
                        });
                    }
                });

            } else {
                // account already exists and is logged in, we have to link accounts
                var account               = req.account; // pull the account out of the session

                account.google.id    = profile.id;
                account.google.token = token;
                account.google.name  = profile.displayName;
                account.google.email = profile.emails[0].value; // pull the first email

                account.save(function(err) {
                    if (err)
                        throw err;
                    return done(null, account);
                });

            }

        });

    }));

};

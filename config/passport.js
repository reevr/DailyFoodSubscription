const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

/**Mongoose Model */
const User = mongoose.model('users');

module.exports =  (passport) =>  {
 passport.use(new GoogleStrategy({
     clientID: keys.GOOGLE_CLIENT_ID,
     clientSecret: keys.GOOGLE_CLIENT_SECRET,
     callbackURL: keys.GOOGLE_CLIENT_CALLBACK,
     proxy: true
 }, (accessToken, refresh, profile, done)=>{
    User.findOne({$or: [
        {googleID: profile.id},
        {email: profile.emails[0].value}
    ]})
    .then(user => {
        if (user) {
            if (!user.googleID) {
                const updateUser = {
                    googleID: profile.id,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: image,
                    isAdmin: false,
                };
                User.update({email: profile.emails[0].value},{$set: updateUser})
                .then(user => done(null, user));
            } else { done(null, user); }
        } else {
            // Removing extra parameters from image url 
            const image = profile.photos[0].value.substring(0, profile.photos[0].value.indexOf('?'));
            const newUser = User({
                googleID: profile.id,
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
                image: image,
                isAdmin: false,
                subscriptionStatus: 0
            });
            newUser.save()
            .then(user => {
                done(null, user);
            });
        }
    }); 
 }));

 passport.serializeUser(function(user, done) {
    done(null, user.id);
 });
   
 passport.deserializeUser(function(id, done) {
   User.findById(id, function (err, user) {
      done(err, user);
   });
 });
}
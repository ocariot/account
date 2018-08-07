'use strict';

import passport from "passport"
import passportJWT from "passport-jwt"
//const User = require('./../models/user');
import { User } from '../src/models/user'
import config from './config'

const ExtractJwt = passportJWT.ExtractJwt;
const JwtStrategy = passportJWT.Strategy;

var params = {
    secretOrKey: config.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('jwt')
};

export class Auth {

    static initialize(): any {
        // Definindo a estratégia JWT
        let strategy = new JwtStrategy(params, function (payload, done) {
            User.findById(payload._id, function (err, user) {
                if (err) return done(err, false);

                if (user) return done(null, user);

                return done(null, false);
            });
        });

        passport.use(strategy);

        return passport.initialize();
    }

    static authenticate(): any {
        return passport.authenticate("jwt", config.jwtSession);
    }
}
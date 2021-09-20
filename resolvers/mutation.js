const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const JWT_SECRET = require('../jwt_secret');
const jwt = require('jsonwebtoken');
const {
    AuthenticationError,
    ForbiddenError
} = require('apollo-server-express');
require('../index');

const gravatar = require('../util/gravatar');


module.exports = {
    newNote: async (parent, args, {models, user}) => {

        // if there's no user on the context, throw an authentication error
        if(!user) {
            throw new AuthenticationError('You must be signed in to create a note');
        }

        return await models.Note.create({
            content: args.content,
            author: mongoose.Types.ObjectId(user.id),
        });
    },

    updateNote: async (parent, {content, id}, {models, user}) => {
        // if not a user, throw an Authentication Error
        if (!user) {
            throw new AuthenticationError('You must be signed in to update a note');
        }

        // find the note
        const note = await models.Note.findById(id);

        // if the note owner and current user don't match, throw a forbidden error
        if(note && String(note.author) !== user.id) {
            throw new ForbiddenError("You don't have permissions to update this note");
        }
        
        return await models.Note.findOneAndUpdate(
            {
                _id: id,
            },
            {
                $set: {
                    content
                }
            },
            {
                new: true
            }
        );
    },

    deleteNote: async (parent, {id}, {models, user}) => {
        // if not a user, throw an Authentication Error
        if(!user) {
            throw new AuthenticationError('You must be signed in to delete a note');
        }

        const note = await models.Note.findById(id);    // find the note

        // if the note owner and current user don't match, throw a forbidden error
        if(note && String(note.author) !== user.id) {
            throw new ForbiddenError("You don't have permissions to delete the note");
        }
        
        try {
            await note.remove();
            return true;
        } catch (err) {
            return false;
        }
    },

    signUp: async (parent, {username, email, password}, {models}) => {
        email = email.trim().toLowerCase();

        const hashed = await bcrypt.hash(password, 10); // hash the password

        const avatar = gravatar(email); // create the gravatar url

        try {
            const user = await models.User.create({
                username,
                email,
                avatar,
                password: hashed
            });

            // create and return json web token
            return jwt.sign({id: user._id}, JWT_SECRET);

        } catch (err) {
            console.log(err);
            throw new Error('Error creating account');
        }
    },

    signIn: async (parent, {username, email, password}, {models}) => {
        if (email) {
            email = email.trim().toLowerCase();
        }

        const user = await models.User.findOne({
            $or: [{email}, {username}]
        });

        if (!user) {
            throw new AuthenticationError('Error signing in');
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new AuthenticationError('Error Signing in');
        }

        // create and return the json web token
        return jwt.sign({id: user._id}, JWT_SECRET);
    },

    toggleFavorite: async (parent, {id}, {models, user}) => {
        if(!user) {
            throw new AuthenticationError();
        }

        // check if user has already favorited the note
        let noteCheck = await models.Note.findById(id);
        const hasUser = noteCheck.favoritedBy.indexOf(user.id);

        // if user exists, pull them from list, reduce favoriteCount by 1
        if(hasUser >= 0) {
            return await models.Note.findByIdAndUpdate(
                id, 
                {
                    $pull: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc: {
                        favoriteCount: -1
                    }
                },
                {
                    new: true
                }
            );
        } else {
            // if user doesn't exist
            return await models.Note.findByIdAndUpdate(
                id,
                {
                    $push: {
                        favoritedBy: mongoose.Types.ObjectId(user.id)
                    },
                    $inc: {
                        favoriteCount: 1
                    }
                },
                {
                    new: true
                }
            );
        }
    },
}
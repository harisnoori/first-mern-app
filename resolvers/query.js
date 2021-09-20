module.exports = {
    notes: async (parent, args, {models}) => {
        return await models.Note.find()
    },
    note: async (parent, args, {models}) => {
        return await models.Note.findById(args.id)
    },
    
    user: async (parent, {username}, {models}) => {
        // find a user given their username
        return await models.User.findOne({username});
    },

    users: async (parent, args, {models}) => {
        // find all users
        return await models.User.find({});
    },

    me: async (parent, args, {models, user}) => {
        // find a user given the current user context
        return await models.User.findById(user.id);
    },

    noteFeed: async (parent, {cursor}, {models}) => {
        const limit = 10;

        let hasNextPage = false;    // default value
        let cursorQuery = {};

        if(cursor) {
            cursorQuery = { _id: {$lt: cursor} };
        }

        let notes = await models.Note.find(cursorQuery)
        .sort({_d: -1})
        .limit(limit+1);

        if (notes.length > limit) {
            hasNextPage = true;
            notes = notes.slice(0, -1);
        }

        const newCursor = notes[notes.length - 1]._id;

        return {
            notes,
            cursor: newCursor,
            hasNextPage
        };
    }
    
}
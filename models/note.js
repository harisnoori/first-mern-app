const mongoose = require('mongoose');

// Define the note's database schema
const noteSchema = new mongoose.Schema(
    {
        content: {
            type: String,
            required: true
        },
        author: {
            type: String,
            required: true
        },
        favoriteCount: {
            type: Number,
            default: 0
        },
        favoritedBy: [
            {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
            }
        ]
    },
    {
        timestamps: true
    }
);

// Define the 'Note' model with the schema
const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
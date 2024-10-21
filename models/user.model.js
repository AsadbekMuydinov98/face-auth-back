const mongoose = require('mongoose');

const spellCheckSchema = new mongoose.Schema({
    date: {
    type: String,
    required: true,
    },
    texts: [
    {
        originalText: {
        type: String,
        },
        suggestions: [
        {
            message: {
            mistake: { type: String, required: true },
            bestSuggestion: { type: String, required: true }
            }
        }
        ]
    }
    ]
});

const userSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    picture: { type: String },
    spellCheckResults: [spellCheckSchema]
});

module.exports = mongoose.model('User', userSchema);

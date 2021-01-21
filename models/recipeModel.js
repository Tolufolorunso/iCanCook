const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
	title: {
		type: String,
		unique: true,
		trim: true,
		required: [true, 'A name for recipe is required']
	},
	preparation: {
		type: String
	},
	rating: {
		type: Number,
		default: 1
	},
	ingredients: {
		type: []
	},
	publisher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
	image: {
		type: [String]
	},
	likes: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			}
		}
	],
	comments: [
		{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			comment: {
				type: String,
				required: true
			},
			name: {
				type: String
			},
			avatar: {
				type: String
			},
			date: {
				type: Date,
				default: Date.now
			}
		}
	],
	createdAt: {
		type: Date,
		default: Date.now
	}
});

recipeSchema.post('save', function () {
	console.log(this);
});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;

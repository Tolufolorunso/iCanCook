const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		require: [true, 'Please tell us your name']
	},
	email: {
		type: String,
		require: [true, 'Please provide your email'],
		unique: true,
		lowercase: true
	},
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
	photo: String,
	password: {
		type: String,
		required: [true, 'Please provide a password'],
		minlength: 3,
		select: false
	},
	passwordConfirm: {
		type: String,
		required: [true, 'Please confirm your password']
	},
    passwordChangedAt: Date,
	passwordResetToken: String,
	passwordResetExpires: Date
});



userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});

userSchema.pre('save', function(next) {
	if(!this.isModified('password') || this.isNew) return next()

	this.passwordChangedAt = Date.now()
	next()
})

userSchema.methods.correctPassword= async function(candidatepassword, userPassword) {
    return await bcrypt.compare(candidatepassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
	const resetToken = crypto.randomBytes(32).toString('hex');

	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
}

module.exports = mongoose.model('User', userSchema);
 
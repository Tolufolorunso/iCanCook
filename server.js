const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const app = require('./app');

// console.log(process.env.NODE_ENV);

mongoose
	.connect(process.env.DATABASE_LOCAL, {
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
		useUnifiedTopology: true
	})
	.then(() => console.log('DB connection successful'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`App running on port ${PORT}...`);
});

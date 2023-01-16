import mongoose from 'mongoose';

mongoose.connect(process.env.MONGODB_URI || '', { })
mongoose.Promise = global.Promise;

export default mongoose;
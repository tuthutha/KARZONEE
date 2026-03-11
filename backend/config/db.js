import mongoose from 'mongoose';

export const connectDB = async () => {
  await mongoose
    .connect(
      'mongodb+srv://canvantujob_db_user:canvantu123@cluster0.wttdki4.mongodb.net',
    )
    .then(() => console.log('DB Connected'));
};

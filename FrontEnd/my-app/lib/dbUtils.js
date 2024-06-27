import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    /*Update schema after deciding credentials */
    name: {
        type: String,
        required: true,
        unique: true,
    },
});

mongoose.models = {};
export const UserModel = mongoose.model('users', userSchema);

export async function mongooseConnect() {
    if (mongoose.connections[0].readyState) {
        return true;
    }

    try {
        await mongoose.connect(`mongodb+srv://dbUser:Seneca123@cluster0.utiefr8.mongodb.net/splits?retryWrites=true&w=majority`);
        return true;
    } catch (err) {
        throw new Error(err);
    }
}
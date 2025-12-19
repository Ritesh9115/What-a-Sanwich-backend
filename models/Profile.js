import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema({
    name: {
        type: String
    },
    pictureUrl: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }

});

const Profile = mongoose.model("Profile", profileSchema);

export { Profile };
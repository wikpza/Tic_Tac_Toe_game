import mongoose, { Document } from "mongoose";

// Define the interface for the Play document
export interface IPlay extends Document {
    player1: mongoose.Types.ObjectId;
    player2: mongoose.Types.ObjectId;
    type: "tied" | "win";  // The field `type` can only be 'tied' or 'win'
    winnerId: mongoose.Types.ObjectId;
    createdAt: Date;
}

// Define the schema
const playsSchema = new mongoose.Schema<IPlay>({
    player1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Reference to the 'User' model
        required: true,
    },
    player2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",  // Reference to the 'User' model
        required: true,
    },
    winnerId: {
        type: mongoose.Schema.Types.ObjectId,

    },
    createdAt: {
        type: Date,
        default: Date.now,  // Use `Date.now` directly for the default
    },
    type: {
        type: String,  // Ensure the field is of type String
        enum: ["tied", "win"],  // Only allow 'tied' or 'win' values
        default: "win",  // Set the default value to 'win'
    },
});

// Create the model from the schema
const PlayModel = mongoose.model('Play', playsSchema);

// Export the model
export default PlayModel;

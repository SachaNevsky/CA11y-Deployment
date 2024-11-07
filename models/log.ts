import mongoose, { Document, Schema } from 'mongoose';

interface ILog extends Document {
    user: string;
    action: string;
    timestamp: Date;
}

const logSchema = new Schema<ILog>({
    user: { type: String, requires: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Log || mongoose.model<ILog>('Log', logSchema);
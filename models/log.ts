import mongoose, { Document, Schema } from 'mongoose';

interface ILogEntry {
    action: string;
    timestamp: Date;
}

interface ILog extends Document {
    user: string;
    actions: ILogEntry[];
    createdAt: Date;
    documentIndex: number;
}

const logEntrySchema = new Schema({
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
});

const logSchema = new Schema<ILog>({
    user: { type: String, required: true },
    actions: [logEntrySchema],
    createdAt: { type: Date, default: Date.now, required: true },
    documentIndex: { type: Number, default: 0 }
});

logSchema.index({ user: 1, documentIndex: 1 }, { unique: true });

export default mongoose.models.Log || mongoose.model<ILog>('Log', logSchema);
import mongoose, { Document, Schema } from 'mongoose';

interface IEMAResponse {
    questionId: string;
    question: string;
    response: number;
    timestamp: Date;
}

interface IEMA extends Document {
    user: string;
    responses: IEMAResponse[];
    createdAt: Date;
}

const emaResponseSchema = new Schema({
    questionId: { type: String, required: true },
    question: { type: String, required: true },
    response: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, required: true },
});

const emaSchema = new Schema<IEMA>({
    user: { type: String, required: true, index: true },
    responses: [emaResponseSchema],
    createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.EMA || mongoose.model<IEMA>('EMA', emaSchema);
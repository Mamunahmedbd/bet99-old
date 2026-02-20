import { model, Schema, Document } from 'mongoose';

// Define the ISport interface
interface ISport {
  sportId: number;
  typeId?: number;
  icon: string;
  name: string;
  otherName?: string;
  marketCount?: number;
}

// Extend the Document interface for ISportModel
interface ISportModel extends Document, ISport {}

// Define the schema for Sport
const SportSchema = new Schema<ISport>(
  {
    sportId: { type: Number, required: true },
    typeId: { type: Number },
    icon: { type: String, required: true },
    name: { type: String, required: true },
    otherName: { type: String },
    marketCount: { type: Number },
  },
  {
    timestamps: true,
  }
);

// Create the model with the ISportModel interface
const Sport = model<ISportModel>('Sport', SportSchema);

export { ISport, Sport, ISportModel };

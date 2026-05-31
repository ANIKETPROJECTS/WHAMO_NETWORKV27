import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  name: string;
  content: any;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    content: { type: Schema.Types.Mixed, required: true },
    userId: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>("Project", ProjectSchema);

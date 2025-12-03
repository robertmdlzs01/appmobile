import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  wordpressId: number;
  name: string;
  subtitle?: string;
  description?: string;
  fullDescription?: string;
  date: string;
  time: string;
  location: string;
  price: number;
  category: string;
  images?: string[];
  videoUrl?: string | null;
  promoter?: string;
  instructions?: string[];
  availableTickets?: number;
  soldTickets?: number;
  status: string;
  slug: string;
  featured?: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema: Schema = new Schema(
  {
    wordpressId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    fullDescription: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    images: [{
      type: String,
    }],
    videoUrl: {
      type: String,
      default: null,
    },
    promoter: {
      type: String,
      trim: true,
    },
    instructions: [{
      type: String,
    }],
    availableTickets: {
      type: Number,
      min: 0,
    },
    soldTickets: {
      type: Number,
      min: 0,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['publish', 'draft', 'private', 'pending'],
      default: 'publish',
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    lastSyncedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ status: 1, date: 1 });
EventSchema.index({ category: 1 });
EventSchema.index({ featured: 1 });
EventSchema.index({ lastSyncedAt: 1 });

export default mongoose.model<IEvent>('Event', EventSchema);

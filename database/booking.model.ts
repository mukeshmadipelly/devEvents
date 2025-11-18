import { Schema, model, models, Document, Model, Types } from "mongoose";
import { Event } from "./event.model";

// Strongly typed Booking document interface
export interface BookingDocument extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const bookingSchema = new Schema<BookingDocument>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true as const,
      index: true,
    },
    email: {
      type: String,
      required: true as const,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => emailRegex.test(value),
        message: "Invalid email address provided.",
      },
    },
  },
  {
    timestamps: true, // automatically manages createdAt and updatedAt
    strict: true,
  }
);

// Index on eventId for efficient event-based lookups
bookingSchema.index({ eventId: 1 });

// Pre-save hook to validate referenced event and ensure fields are valid
bookingSchema.pre<BookingDocument>("save", async function preSave(next) {
  try {
    // Ensure the referenced event exists before saving a booking
    const eventExists = await Event.exists({ _id: this.eventId });
    if (!eventExists) {
      throw new Error("Cannot create booking: referenced event does not exist.");
    }

    // Extra safety check for email format (in addition to schema validator)
    if (!emailRegex.test(this.email)) {
      throw new Error("Invalid email address provided.");
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export type BookingModel = Model<BookingDocument>;

// Reuse existing model in dev/hot-reload, otherwise create a new one
export const Booking: BookingModel =
  (models.Booking as BookingModel | undefined) || model<BookingDocument>("Booking", bookingSchema);

import { Schema, model, models, Document, Model } from "mongoose";

// Strongly typed Event document interface
export interface EventDocument extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // 24h time string (HH:mm)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Helper to generate a URL-safe slug from the title
const createSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove non-alphanumeric characters
    .replace(/\s+/g, "-") // replace spaces with dashes
    .replace(/-+/g, "-") // collapse multiple dashes
    .replace(/^-|-$/g, ""); // trim leading/trailing dashes
};

// Normalize date to an ISO date string (YYYY-MM-DD)
const normalizeDate = (date: string): string => {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("Invalid event date provided");
  }
  // Keep only the date portion in UTC ISO format
  return parsed.toISOString().split("T")[0];
};

// Normalize time to 24-hour HH:mm format
const normalizeTime = (time: string): string => {
  const trimmed = time.trim();

  // Matches HH:mm or H:mm
  const match = trimmed.match(/^(?<hour>\d{1,2}):(?<minute>\d{2})$/);
  if (!match || !match.groups) {
    throw new Error("Invalid event time. Expected format HH:mm (24-hour)");
  }

  const hour = Number(match.groups["hour"]);
  const minute = Number(match.groups["minute"]);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Invalid event time range");
  }

  const hourStr = hour.toString().padStart(2, "0");
  const minuteStr = minute.toString().padStart(2, "0");

  return `${hourStr}:${minuteStr}`;
};

const requiredString = {
  type: String,
  required: true as const,
  trim: true,
};

const requiredStringArray = {
  type: [String],
  required: true as const,
  validate: {
    validator: (value: unknown): boolean => {
      return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v.trim().length > 0);
    },
    message: "Array must contain at least one non-empty string.",
  },
};

const eventSchema = new Schema<EventDocument>(
  {
    title: requiredString,
    slug: {
      type: String,
      unique: true,
      index: true,
      trim: true,
    },
    description: requiredString,
    overview: requiredString,
    image: requiredString,
    venue: requiredString,
    location: requiredString,
    date: requiredString, // normalized to ISO in pre-save hook
    time: requiredString, // normalized to HH:mm in pre-save hook
    mode: requiredString,
    audience: requiredString,
    agenda: requiredStringArray,
    organizer: requiredString,
    tags: requiredStringArray,
  },
  {
    timestamps: true, // automatically manages createdAt and updatedAt
    strict: true,
  }
);

// Unique index on slug for fast lookup and URL uniqueness
eventSchema.index({ slug: 1 }, { unique: true });

// Pre-save hook to handle slug generation, date, and time normalization
eventSchema.pre<EventDocument>("save", function preSave(next) {
  try {
    // Ensure required string fields are not empty after trimming
    const requiredFields: (keyof EventDocument)[] = [
      "title",
      "description",
      "overview",
      "image",
      "venue",
      "location",
      "date",
      "time",
      "mode",
      "audience",
      "organizer",
    ];

    for (const field of requiredFields) {
      const value = this[field];
      if (typeof value !== "string" || value.trim().length === 0) {
        throw new Error(`Field "${field}" is required and cannot be empty.`);
      }
    }

    // Generate or update slug when title changes
    if (!this.slug || this.isModified("title")) {
      this.slug = createSlug(this.title);
    }

    // Normalize date and time fields for consistency
    if (this.isModified("date")) {
      this.date = normalizeDate(this.date);
    }

    if (this.isModified("time")) {
      this.time = normalizeTime(this.time);
    }

    next();
  } catch (error) {
    next(error as Error);
  }
});

export type EventModel = Model<EventDocument>;

// Reuse existing model in dev/hot-reload, otherwise create a new one
export const Event: EventModel =
  (models.Event as EventModel | undefined) || model<EventDocument>("Event", eventSchema);

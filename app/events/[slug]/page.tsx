import { notFound } from "next/navigation";
import Image from "next/image";
import BookEvent from "@/components/BookEvent";
import { getSimilarEventsBySlug } from "@/lib/actions/events.actions";
import {IEvent} from "@/database";
import EventCard from "@/components/EventCard";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type EventDetailsPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const EventDetailItem = ({ icon, alt, label }: { icon: string; alt: string; label: string }) => (
  <div className="flex-row-gap-2 items-center">
    <Image src={icon} alt={alt} width={17} height={17} />
    <p>{label}</p>
  </div>
);

const EventAgenda = ({ agendaItems }: { agendaItems: string[] }) => (
  <div className="agenda">
    <h2>Agenda</h2>
    <ul>
      {agendaItems.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

const EventTags = ({ tags }: { tags: string[] }) => (
  <div className="flex flex-row gap-1.5 flex-wrap">
    {tags.map((tag) => (
      <div className="pill" key={tag}>
        {tag}
      </div>
    ))}
  </div>
);

const EventDetailsPage = async ({ params }: EventDetailsPageProps) => {
  // `params` is a Promise in Next.js 16 dynamic routes and must be awaited
  const { slug } = await params;

  try {
    const response = await fetch(`${BASE_URL}/api/events/${slug}`);

    // Handle non-OK responses explicitly
    if (!response.ok) {
      if (response.status === 404) {
        return notFound();
      }

      console.error(`Failed to fetch event '${slug}':`, response.status, response.statusText);

      return (
        <section id="event">
          <div className="header">
            <h1>Event unavailable</h1>
            <p>We couldn't load this event right now. Please try again later.</p>
          </div>
        </section>
      );
    }

    let data: any;

    try {
      data = await response.json();
    } catch (error) {
      console.error(`Error parsing event response JSON for '${slug}':`, error);
      return notFound();
    }

    // Validate the payload shape
    if (!data || typeof data !== "object" || !data.event || typeof data.event !== "object") {
      console.error(`Invalid event payload for '${slug}':`, data);
      return notFound();
    }

    const {
      description,
      image,
      overview,
      date,
      time,
      location,
      mode,
      agenda,
      tags,
      audience,
      organizer,
    } = data.event as {
      description?: string;
      image?: string;
      overview?: string;
      date?: string;
      time?: string;
      location?: string;
      mode?: string;
      agenda?: string[];
      tags?: string[];
      audience?: string;
      organizer?: string;
    };

    // Require at least a description to render the page; otherwise treat as not found
    if (!description) {
      console.error(`Event '${slug}' missing required 'description' field.`);
      return notFound();
    }
    const bookings = 10;

    const similarEvents: IEvent[] = await getSimilarEventsBySlug(slug);


    return (
    <section id="event">
      <div className="header">
        <h1>Event Description</h1>
        <p>{description}</p>
      </div>

      <div className="details">
        {/* left side - event content */}
        <div className="content">
            <Image src={image ?? "/default-banner.png"} alt="Event Banner" width={800} height={800} className="banner" />

          <section className="flex-col-gap-2">
            <h2>Overview</h2>
              <p>{overview ?? "No overview available."}</p>
          </section>

          <section className="flex-col-gap-2">
            <h2>Event Details</h2>
              <EventDetailItem icon="/icons/calendar.svg" alt="calendar" label={date ?? "TBA"} />
              <EventDetailItem icon="/icons/clock.svg" alt="clock" label={time ?? "TBA"} />
              <EventDetailItem icon="/icons/pin.svg" alt="pin" label={location ?? "TBA"} />
              <EventDetailItem icon="/icons/mode.svg" alt="mode" label={mode ?? "TBA"} />
              <EventDetailItem icon="/icons/audience.svg" alt="audience" label={audience ?? "TBA"} />
          </section>

            <EventAgenda agendaItems={agenda ?? []} />

          <section className="flex-col-gap-2">
            <h2>About the Organizer</h2>
              <p>{organizer ?? "No organizer info."}</p>
          </section>

            <EventTags tags={tags ?? []} />
        </div>

        {/* right side - Booking Form */}
        <aside className="booking">
                    <div className="signup-card">
                        <h2>Book Your Spot</h2>
                        {bookings > 0 ? (
                            <p className="text-sm">
                                Join {bookings} people who have already booked their spot!
                            </p>
                        ): (
                            <p className="text-sm">Be the first to book your spot!</p>
                        )}

                        <BookEvent />
                    </div>
                </aside>
      </div>
      <div className="flex w-full flex-col gap-4 pt-20">
                <h2>Similar Events</h2>
                <div className="events">
                    {similarEvents.length > 0 && similarEvents.map((similarEvent: IEvent) => (
                        <EventCard key={similarEvent.title} {...similarEvent} />
                    ))}
                </div>
            </div>
    </section>
  );
  } catch (error) {
    console.error(`Error fetching event '${slug}':`, error);
    return notFound();
  }
};


export default EventDetailsPage;

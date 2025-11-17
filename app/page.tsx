import Explorebtn from '@/components/Explorebtn'
import EventCard from "@/components/EventCard";
import events from '@/lib/constants'

const Home = () => {
    return (
        <section>
            <h1 className='text-center'>Hub for Dev Events <br/> You can't miss</h1>
            <p className='text-center mt-5'>Hackathons, Meetups, and Conferences. All in one place.</p>
            <Explorebtn />


            <div className='mt-20 space-y-7'>
                <h3>Featured Events</h3>

                <ul className="events">
                    {events.map((event) => (
                        <li key={event.title}>
                            <EventCard {...event} />
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    )
}
export default Home

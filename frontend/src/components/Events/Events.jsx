import React from 'react'
import styles from '../../styles/styles'
import EventCard from './EventCard.jsx'
import { useSelector } from 'react-redux'

const Events = () => {
  const {allEvents, isLoading} = useSelector((state) => state.events)
  return (
    <div>
        {
          !isLoading && (
            <div className={`${styles.section}`}>
      <div className={`${styles.heading}`}>
        <h1 className="text-2xl font-semibold mb-4">Popular Events</h1>
      </div>

      <div className="w-full grid">
            <EventCard data={allEvents && allEvents[0]} />
          </div>
    </div>
          )
        }

    </div>
  )
}

export default Events
import React from 'react'
import Header from '../components/Layout/Header'
import Events from '../components/Events/Events'

const EventsPage = () => {

  return (
    <div>
      <Header activeHeading={4} />

      <Events />
    </div>
  )
}

export default EventsPage
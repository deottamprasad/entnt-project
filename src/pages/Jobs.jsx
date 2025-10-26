import React from 'react'
import { Outlet, useOutlet } from 'react-router-dom' 
import NavigationBar from '../components/NavigationBar'
import '../styles/jobs.css'
import StatCards from '../components/StatCards'
import JobList from '../components/JobList'
import JobHeader from '../components/JobHeader'

export default function Jobs() {
  const outlet = useOutlet();

  return (
    <>
      <NavigationBar />
      <main className="jobs-page-main">
        {outlet ? (
          // If a child route is active (e.g., /1), render it here
          <Outlet /> 
        ) : (
          // Otherwise, render the default job list view
          <>
            <JobHeader />
            <StatCards />
            <JobList />
          </>
        )}
      </main>
    </>
  )
}
import React from 'react'
import { Link } from 'react-router-dom'
import NavigationBar from '../components/NavigationBar'

export default function Candidates() {
  return (
    <>
    <NavigationBar/>
    <div>Candidates</div>
    <Link to="/">Jobs</Link>
    </>
  )
}

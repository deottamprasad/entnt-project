import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Candidates from './pages/Candidates';
import Jobs from './pages/Jobs';
import JobAssessment from './pages/Jobs/JobAssessment';
import JobDetails from './pages/Jobs/JobDetails';
// ...

function App() {
  return <BrowserRouter basename='/'>
    <Routes>
      <Route path="/" element={<Jobs/>}>
        <Route path=":id" element={<JobDetails/>}>
          <Route path="assessment" element={<JobAssessment />} />
        </Route>
      </Route>
      <Route path="/mycandidate" element={<Candidates/>} />
    </Routes>
  </BrowserRouter>
}

export default App;
import React from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import Candidates from './pages/Candidates';
import Jobs from './pages/Jobs';
import JobAssessment from './pages/Jobs/JobAssessment';
import JobDetails from './pages/Jobs/JobDetails';
import CandidateDetail from './pages/Candidates/CandidateDetail';
// ...

function App() {
  return <BrowserRouter basename='/'>
    <Routes>
      <Route path="/" element={<Jobs/>}>
        <Route path=":id" element={<JobDetails/>}>
          <Route path="assessment" element={<JobAssessment />} />
        </Route>
      </Route>
      <Route path="/mycandidate" element={<Candidates/>}>
        <Route path=":candidateId" element={<CandidateDetail/>}/>
      </Route>
    </Routes>
  </BrowserRouter>
}

export default App;
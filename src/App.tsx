import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import HowItWorks from './pages/HowItWorks';
import WritingBoard from './pages/WritingBoard';

function App() {
  return (
    <>
      <Toaster position="top-center" toastOptions={{ className: 'border-2 border-black rounded-none shadow-[4px_4px_0px_#000]' }} />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/writing-board" element={<WritingBoard />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;


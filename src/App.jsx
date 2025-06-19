// import { Routes, Route } from 'react-router-dom';
// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import './components/Login';
// import './components/Dashboard'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//         <Routes>
//       <Route path="/" element={<Login />} />
//       <Route path="/dashboard" element={<Dashboard />} />
//     </Routes>

//   )
// }

// export default App


import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Signup from './pages/Signup';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Signup/>} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}

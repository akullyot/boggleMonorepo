//Import all hooks and dependencies
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//Import all Reused Components and Contexts
import CurrentUserProvider from './Contexts/CurrentUser';
//All Main Routes
import Home             from './Components/Routes/Home'
import SignUp           from './Components/Routes/SignUp'
import Login            from './Components/Routes/Login'
import CreateRoom       from './Components/Routes/CreateRoom'

import Error404   from './Components/Error404'
//Components
import Navbar     from './Components/Navbar'


function App() {
  return (
    <CurrentUserProvider>
      <Router>
        <Navbar/>
        <div id = 'mainHolder'>
          <Routes>
            <Route exact path="/" element={<Home/>} />
            {/* Paths pertaining to logging in and signing up */}
            <Route exact path="/signup" element={<SignUp/>} />
            <Route exact path="/login" element={<Login/>} />
            {/* Paths pertaining to user profile */}
            {/*Paths pertaining to multiplayer*/}
            <Route exact path="/createRoom" element={<CreateRoom/>} />

            <Route path="/" element={Error404} />
          </Routes>
        </div>
      </Router>
    </CurrentUserProvider>
  );
}
export default App;
//Import all hooks and dependencies
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//Import all Reused Components and Contexts
import CurrentUserProvider from './Contexts/CurrentUser';
//All Main Routes
import Home       from './Components/Routes/Home'
import SignUp     from './Components/Routes/SignUp'
import Login      from './Components/Routes/Login'
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
            <Route exact path="/signup" element={<SignUp/>} />
            <Route exact path="/login" element={<Login/>} />
            <Route path="/" element={Error404} />
          </Routes>
        </div>
      </Router>
    </CurrentUserProvider>
  );
}
export default App;
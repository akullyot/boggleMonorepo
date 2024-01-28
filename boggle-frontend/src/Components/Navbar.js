//Import required hooks and dependencies
import { useState, useContext } from 'react'
import { HashLink, NavHashLink } from 'react-router-hash-link'; 
import { CurrentUser } from '../Contexts/CurrentUser';
//Required Media
import logo from '../Assets/Images/blocks.png';
//Required Bootstrap
import Toast from 'react-bootstrap/Toast';

export default function Navbar(){
  //State Variables
    //Purpose: These three states handle hamburger functionality
    let [linksFading, setLinksFading] = useState(false);
    let [navLinkOpen, setNavLinkOpen] = useState(false);
    let [hamburgerToggle, setHamburgerToggle] = useState(false);
    //Handles Opening the Hamburger
    const handleHamburgerClick = () => {
    setLinksFading(!linksFading);
    setNavLinkOpen(!navLinkOpen);
    setHamburgerToggle(!hamburgerToggle);
    };
    //Handles Showing correct Login/Signup or User Profiles
    const [logoutToastShow, setLogoutToastShow] = useState(false);
    const { setCurrentUser, currentUser } = useContext(CurrentUser);
    const handleSignOut = () => {
        localStorage.clear();
        setCurrentUser(null)
        //Give a toast message that they logged out and navigate to home 
        setLogoutToastShow(true)


    }
    let loginLinks = (            
        <ul className={navLinkOpen ? 'linkHolder open': 'linkHolder'}>
            <li  className={linksFading ? 'fading': null} ><NavHashLink className='navLink navButton' id='contact' to='/login/#' >Log In / Sign Up</NavHashLink></li>
        </ul>
    );
    if (currentUser) {
        loginLinks = (
            <ul className={navLinkOpen ? 'linkHolder open': 'linkHolder'}>
                <li  className={linksFading ? 'fading': null} ><button className='navLink navButton' id='contact' onClick={handleSignOut}>Sign out</button></li>
            </ul>
        )
    }

    return(
        <nav>
            <Toast onClose={() => setLogoutToastShow(false)} show={logoutToastShow} delay={6000} autohide style = {{position:'fixed', right: '40px', top: '7rem', width:'600px', height:'200px', zIndex:'10'}} bg='success'>
                    <Toast.Header>
                        <img src={logo} style = {{height:'40px'}} className="rounded me-2" alt="" />
                        <strong className="me-auto">Boggle</strong>
                        <small>Now</small>
                    </Toast.Header>
                <Toast.Body> Logout successful, bye! </Toast.Body>
            </Toast>
            <div id= "navHome">
                <HashLink to='/#' className="homeLink">
                    <img id='navLogo' src={logo} alt="boggle logo"/>                    
                </HashLink>
                <HashLink to='/#' className="homeLink">
                    <h4 id='navPracticeName'> Boggle </h4>
                </HashLink>
            </div>
            {
                //only shows when the screen size is small enough width
            }
            <div onClick={handleHamburgerClick} className={hamburgerToggle ? 'hamburger toggle': 'hamburger'} >
              <div className="line1"></div>
              <div className="line2"></div>
              <div className="line3"></div>
            </div> 
            {loginLinks}
        </nav>
    )
};
//Import in all required hooks, contexts,  and dependencies
import { useState, useContext } from 'react'
import { CurrentUser }          from '../Contexts/CurrentUser';
import { useNavigate }          from 'react-router';
//Import in all required media
import logo from '../Assets/Images/blocks.png';
//Import in all required bootstrap components
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Toast from 'react-bootstrap/Toast';


export default function Navigationbar() {
    // All button actions 
    const navigate = useNavigate();
    const handleSignOut = (e) => {
        //e.preventDefault()
        localStorage.clear();
        setCurrentUser(null)
        //Give a toast message that they logged out and navigate to home 
        setLogoutToastShow(true)
    }
    const handleSignInRedirect = () => {
        navigate('/login')
    }
    //The two toggleable states for being logged in 
    const [logoutToastShow, setLogoutToastShow] = useState(false);
    const { setCurrentUser, currentUser } = useContext(CurrentUser);

    let loginActions = (
        <Button variant="outline-light" onClick={handleSignInRedirect}>Log In / Sign Up</Button>
    );
    //redefine if signed in
    if (currentUser) {
        loginActions = (     
                <Nav>
                    <Navbar.Brand href={`/profile/${currentUser.userName}`}>
                    <img
                    alt=""
                    src={logo}
                    width="35"
                    height="35"
                    className="rounded me-2 align-top"
                    />{' '}
                    </Navbar.Brand>
                    <NavDropdown title={`Signed in as:   ${currentUser.firstName} ${currentUser.lastName}`} id="collapsible-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">My Social profile</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">
                            My games
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3"> My friends </NavDropdown.Item>
                        <NavDropdown.Divider />
                            <Button variant="outline-light" onClick = {handleSignOut}>Sign Out</Button>
                        </NavDropdown>
                    
                </Nav>);
    };
  return (
    <>
        <Navbar className="bg-body-tertiary" bg="dark" data-bs-theme="dark" collapseOnSelect expand="lg">
            <Container>
                <Navbar.Brand href="/#">
                    <img
                        alt=""
                        src={logo}
                        width="35"
                        height="35"
                        className="d-inline-block align-md"
                    />{'     Boggle'}
                    <img
                        alt=""
                        src={logo}
                        width="35"
                        height="35"
                        className="d-inline-block align-md"
                    />
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                <Navbar.Collapse id="responsive-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="#features">Leaderboards</Nav.Link>
                        <Nav.Link href="#pricing"> Browse Users </Nav.Link>
                        <NavDropdown title="Single Player" id="collapsible-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">
                            Another action
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#action/3.4">
                            Separated link
                        </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Multi Player" id="collapsible-nav-dropdown">
                        <NavDropdown.Item href="/createRoom"> Create a Room </NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">
                            Another action
                        </NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#action/3.4">
                            Separated link
                        </NavDropdown.Item>
                        </NavDropdown>
                    </Nav>
                    {loginActions}
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Toast onClose={() => setLogoutToastShow(false)} show={logoutToastShow} delay={6000} autohide style = {{position:'fixed', right: '40px', top: '7rem', width:'600px', height:'200px', zIndex:'10'}}  data-bs-theme="dark" bg='success'>
            <Toast.Header>
            <img src={logo} style = {{height:'40px'}} className="rounded me-2" alt="" />
            <strong className="me-auto">Boggle</strong>
            <small>Now</small>
             </Toast.Header>
            <Toast.Body> Logout successful, bye! </Toast.Body>
        </Toast>
    </>
  );
};
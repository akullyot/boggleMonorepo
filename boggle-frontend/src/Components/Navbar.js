//Import in all required hooks, contexts,  and dependencies
import { useState, useContext } from 'react'
import { CurrentUser, setCurrentUser }          from '../Contexts/CurrentUser';
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
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { HouseLockFill } from 'react-bootstrap-icons'


export default function Navigationbar() {
    //All states and other required vars
    const navigate = useNavigate();
    let { currentUser } = useContext(CurrentUser);
    const { setCurrentUser } = useContext(CurrentUser);
    const [roomIdInput, setRoomIdInput] = useState('')
    // All button actions 
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
    //ALL BUTTONS
    // Handling joing multiplayer rooms directly from the nav
    const handleDirectRoomJoin = (e) => {
        e.preventDefault();
        navigate('/joinroom/' + roomIdInput);
    };

    //ALL TOASTS
    //The two toggleable states for being logged in 
    const [logoutToastShow, setLogoutToastShow] = useState(false);
    const [toastType, setToastType] = useState('');

    
    let loginActions = (
        <Button variant="outline-light" onClick={handleSignInRedirect} className='me-auto'>Log In / Sign Up</Button>
    );
    //redefine if signed in
    if (currentUser) {
        loginActions = (     
                <Nav className="me-5">
                    <Navbar.Brand href={`/profile/${currentUser.userName}`}>
                    <img
                    alt=""
                    src={logo}
                    width="35"
                    height="35"
                    className="rounded me-2 align-md"
                    />{' '}
                    </Navbar.Brand>
                    <Nav className="me-auto">
                        <NavDropdown title={`Signed in as:   ${currentUser.firstName} ${currentUser.lastName}`} id="collapsible-nav-dropdown" style= {{marginTop:'5px'}}>
                            <NavDropdown.Item href="#action/3.1">My Social profile</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">
                                My games
                            </NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.3"> My friends </NavDropdown.Item>
                            <NavDropdown.Divider />
                                <Button variant="outline-light" onClick = {handleSignOut}>Sign Out</Button>
                        </NavDropdown>  
                    </Nav>
                </Nav>);
    };

  return (
    <>
        <Navbar className="bg-body-tertiary" bg="dark" data-bs-theme="dark" collapseOnSelect expand="lg">
            <Container>
                <Navbar.Brand href="/#" className="me-5">
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
                        <Nav.Link href="/leaderboards">Leaderboards</Nav.Link>
                        <Nav.Link href="/users"> Browse Users </Nav.Link>
                        
                        <NavDropdown title="Single Player" id="collapsible-nav-dropdown">
                        <NavDropdown.Item href="#action/3.1">Play a Standard Boggle Game</NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.2">
                            Replay a Previous Game
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item href="#action/3.4">
                            Boggle Trainer Mode
                        </NavDropdown.Item>
                        </NavDropdown>
                        <NavDropdown title="Multi Player" id="collapsible-nav-dropdown">
                        <NavDropdown.Item href="/createRoom"> Create a Room </NavDropdown.Item>
                        <NavDropdown.Item href="#action/3.4">
                            Browse all publically available rooms
                        </NavDropdown.Item>
                        <NavDropdown.Divider />
                        <NavDropdown.Item>Join a Room with a Link </NavDropdown.Item>
                        <Container>
                                <Form inline onSubmit={handleDirectRoomJoin}>
                                    <InputGroup>
                                    <InputGroup.Text id="roomId"><HouseLockFill/></InputGroup.Text>
                                    <Form.Control
                                        placeholder="room party code"
                                        aria-label="room party code"
                                        aria-describedby="basic-addon1"
                                        value = {roomIdInput}
                                        onChange = {e => setRoomIdInput(e.target.value)}
                                        pattern='^[a-zA-Z0-9]{10}$'
                                        required
                                    /> 
                                    </InputGroup>
                                </Form>
                        </Container>
                        </NavDropdown>
                    </Nav>
                </Navbar.Collapse>
                {loginActions}
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
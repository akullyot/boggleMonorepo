//import in all hooks and dependencies
import { useContext, useState }   from "react"
import { useNavigate }            from "react-router-dom"
import { CurrentUser }            from "../../Contexts/CurrentUser"
import { HashLink }               from "react-router-hash-link";
//Import in all media
import logo from '../../Assets/Images/blocks.png';
//Import in all required bootstrap components
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

export default function Login() {
    const navigate = useNavigate();
    const { setCurrentUser } = useContext(CurrentUser);
    const [credentials, setCredentials] = useState({email: '',password: ''});
    const [errorMessage, setErrorMessage] = useState(null); 
    const [validated, setValidated] = useState(false);
        //Toast that shows on error logging in 
    const [loginErrorToastShow, setLoginErrorToastShow] = useState(false);
    async function handleLogin(e) {
        try {
            e.preventDefault()
            const form = e.currentTarget;
            if (form.checkValidity() === false) {
              e.stopPropagation();
              setValidated(true);
              throw 'invalid input'

            };
            setValidated(true);
            e.preventDefault();
            console.log(process.env.REACT_APP_NODE_SERVER_URL)
            const response = await fetch(`${process.env.REACT_APP_NODE_SERVER_URL}/authentication/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            });
            const data = await response.json();
            if (response.status === 200) {
                setCurrentUser(data.user)
                localStorage.setItem('token', data.token);
                navigate(`/`);
            } else {
                setLoginErrorToastShow(true)
                setErrorMessage(data.message);
            }
        } catch (error) {
            if (error !== 'invalid input'){
                console.log(`This error occured: ${error}`);
                setLoginErrorToastShow(true)
                setErrorMessage('An error occured, please try again');
            }
        }
    };
    return (
        <main>
            <Toast onClose={() => setLoginErrorToastShow(false)} show={loginErrorToastShow} delay={6000} autohide style = {{position:'fixed', right: '40px', top: '10', width:'600px', height:'200px', zIndex:'10'}} bg='danger'>
                    <Toast.Header>
                        <img src={logo} style = {{height:'40px'}} className="rounded me-2" alt="" />
                        <strong className="me-auto">Boggle</strong>
                        <small>Now</small>
                    </Toast.Header>
                <Toast.Body> {errorMessage} </Toast.Body>
            </Toast>
            <Form bg="dark" data-bs-theme="dark" className=" p-5 mb-2 bg-dark bg-gradient text-white form"  onSubmit={handleLogin} noValidate validated={validated}>
                <h1> Login </h1>
                <Form.Group className="mb-5">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control 
                        type="email"
                         placeholder="Enter email" 
                        required
                        value={credentials.email}
                        onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                        className="form-control"
                        id="email"
                        name="email"
                    />
                    <Form.Control.Feedback type="invalid">
                        Invalid Input
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-5">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Password"
                        required
                        value={credentials.password}
                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        className="form-control"
                        id="password"
                        name="password"
                        pattern="^.{8,}$"
                     />
                </Form.Group>
                <Form.Control.Feedback type="invalid">
                    Invalid Input
                </Form.Control.Feedback>
                <Button variant="outline-light" size="lg" type="submit" className="mb-5">
                    Submit
                </Button>
                <HashLink className='mb-5' id='contact' to='/signUp/#' > New to Boggle? Sign Up for an account. </HashLink>
            </Form>
        </main>
    );
};
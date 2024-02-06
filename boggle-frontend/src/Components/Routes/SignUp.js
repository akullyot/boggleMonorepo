//import in all hooks and dependencies
import { useState, useContext }                from "react"
import { useNavigate }                         from "react-router-dom";
import { CurrentUser }                            from "../../Contexts/CurrentUser";

//Import in required bootstrap
import Toast from 'react-bootstrap/Toast';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
//Import in all required media
import logo from '../../Assets/Images/blocks.png';


export default function SignUp() {
	const navigate = useNavigate();
    const { setCurrentUser, currentUser } = useContext(CurrentUser);
	const [user, setUser] = useState({
		firstName: '',
		lastName: '',
		email: '',
        username:'',
		password: '',
        passwordRepeat: ''
	});
    //Error Handling
    const [validated, setValidated] = useState(false);
    const [errorToastShow, setErrorToastShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    //Form submission handling
	async function handleSubmit(e) {
        try {
            //send over to backend for validation
            e.preventDefault();
            const form = e.currentTarget;
            if (user.password !== user.passwordRepeat){
                throw 'Passwords do not match'
            }
            if (form.checkValidity() === false) {
                e.preventDefault();
                e.stopPropagation();
                setValidated(true);
                throw 'invalid input'
            }
            setValidated(true);
            const response = await fetch(`${process.env.REACT_APP_NODE_SERVER_URL}/users/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            const data = await response.json()
            if (response.status === 200) {
                //Now we need to get our token 
                setCurrentUser(data.user)
                localStorage.setItem('token', data.token);
                navigate(`/`);
            } else {
                //there was an error, show the toast message
                setErrorToastShow(true)
                setErrorMessage(data.message);
                console.log(errorMessage, errorToastShow)
            }
            
        } catch (error) {
            if(error == 'Passwords do not match'){
                setErrorToastShow(true)
                setErrorMessage(error);
            }else if (error !== 'invalid input'){
                setErrorToastShow(true)
                console.log(`This error occured: ${error}`);
                setErrorMessage('An error occured, please try again');
            }
        }
	}
	return (
		<main>
            <Toast onClose={() => setErrorToastShow(false)} show={errorToastShow} delay={6000} autohide style = {{position:'fixed', right: '40px', top: '10', width:'600px', height:'200px', zIndex:'10'}} bg='danger'>
                    <Toast.Header>
                        <img src={logo} style = {{height:'40px'}} className="rounded me-2" alt="" />
                        <strong className="me-auto">Boggle</strong>
                        <small>Now</small>
                    </Toast.Header>
                <Toast.Body> {errorMessage}  </Toast.Body>
            </Toast>
			<Form noValidate validated={validated} onSubmit={handleSubmit} className=" p-5 mb-2 bg-dark bg-gradient text-white form">
                <h1> Create a new boggle account</h1>
                <Form.Group className="mb-5">
                    <label htmlFor="firstName">First Name</label>
                    <input
                        required
                        value={user.firstName}
                        onChange={e => setUser({ ...user, firstName: e.target.value })}
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        pattern = "^[a-zA-Z]{1,20}$"
                    />
                    <Form.Control.Feedback type="invalid">
                        First names must be 1-20 characters and only contain letters.
                     </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-5">
                    <label htmlFor="lastName">Last Name</label>
                    <input
                        required
                        value={user.lastName}
                        onChange={e => setUser({ ...user, lastName: e.target.value })}
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        pattern="^[a-zA-Z]{1,20}$"
                    />
                    <br/>
                    <Form.Control.Feedback type="invalid">
                        Last names must be 1-20 characters and only contain letters.
                     </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-5">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        required
                        value={user.email}
                        onChange={e => setUser({ ...user, email: e.target.value })}
                        className="form-control"
                        id="email"
                        name="email"
                    />
                    <Form.Control.Feedback type="invalid">
                       Please input a valid email.
                    </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-5">
                    <label htmlFor="username">username</label>
                    <input
                        required
                        value={user.username}
                        onChange={e => setUser({ ...user, username: e.target.value })}
                        className="form-control"
                        id="username"
                        name="username"
                        pattern="^(?=.{6,30}$)(?:[a-zA-Z0-9\d]+(?:(?:\.|-|_|@)[a-zA-Z0-9\d])*)+$"
                    />
                    <Form.Control.Feedback type="invalid">
                        usernames must be 6-30 characters long, only include letters, numbers, dashes, underscores, and at symbols, and start and end with a letter or number
                     </Form.Control.Feedback>
                </Form.Group>
                <Form.Group className="mb-5">
					<label htmlFor="password">Password</label>
					<input
						type="password"
						required
						value={user.password}
						onChange={e => setUser({ ...user, password: e.target.value })}
						className="form-control"
						id="password"
						name="password"
                        //pattern="^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$"
                        pattern="^.{8,}$"
					/>
                    <Form.Control.Feedback type="invalid">
                        Passwords must be at minimum eight characters.
                    </Form.Control.Feedback>
    			</Form.Group>
                <Form.Group className="mb-5">
					<label htmlFor="password">Confirm Password</label>
					<input
						type="password"
						required
						value={user.passwordRepeat}
						onChange={e => setUser({ ...user, passwordRepeat: e.target.value })}
						className="form-control"
						id="passwordRepeat"
						name="passwordRepeat"
                        isValid = {user.password === user.passwordRepeat} //not working
					/>
                    <Form.Control.Feedback type="invalid">
                        Passwords must match.
                    </Form.Control.Feedback>
    			</Form.Group>
                <Button variant="outline-light" size="lg" type="submit" className="mb-5">
                    Sign Up
                </Button>
			</Form>
		</main>
	);
};
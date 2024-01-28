//import in all hooks and dependencies
import { useState, useContext }                from "react"
import { useNavigate }                         from "react-router-dom";
import { CurrentUser }                            from "../../Contexts/CurrentUser";

//Import in required bootstrap
import Form  from 'react-bootstrap/Form';
import Toast from 'react-bootstrap/Toast';
//Import in all required media
import logo from '../../Assets/Images/blocks.png';


export default function SignUp() {
	const navigate = useNavigate();
    const { setCurrentUser, currentUser } = useContext(CurrentUser);
	const [user, setUser] = useState({
		firstName: '',
		lastName: '',
		email: '',
        userName:'',
		password: ''
	});
    //Error Handling
    const [validated, setValidated] = useState(false);
    const [errorToastShow, setErrorToastShow] = useState(false);
    const [errorMessage, setErrorMessage] = useState(null);
    console.log(currentUser)
    //Form submission handling
	async function handleSubmit(e) {
        //send over to backend for validation
		e.preventDefault();
        const form = e.currentTarget;
        if (form.checkValidity() === false) {
          e.preventDefault();
          e.stopPropagation();
        }
        setValidated(true);
		const response = await fetch(`http://localhost:5000/users/`, {
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
            console.log(currentUser, 'in signup')
            navigate(`/`);
        } else {
            //there was an error, show the toast message
            console.log('here')
            setErrorToastShow(true)
            setErrorMessage(data.message);
            console.log(errorMessage, errorToastShow)
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
			<Form noValidate validated={validated} onSubmit={handleSubmit} className="form">
                <h1>Create a new boggle account</h1>
                <div className="formGroup">
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
                </div>

                <div className="formGroup">
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
                </div>
                <div className="formGroup">
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
                </div>
                <div className="formGroup">
                    <label htmlFor="userName">Username</label>
                    <input
                        required
                        value={user.userName}
                        onChange={e => setUser({ ...user, userName: e.target.value })}
                        className="form-control"
                        id="userName"
                        name="userName"
                        pattern="^(?=.{6,30}$)(?:[a-zA-Z0-9\d]+(?:(?:\.|-|_|@)[a-zA-Z0-9\d])*)+$"
                    />
                    <Form.Control.Feedback type="invalid">
                        Usernames must be 6-30 characters long, only include letters, numbers, dashes, underscores, and at symbols, and start and end with a letter or number
                     </Form.Control.Feedback>
                </div>
				<div className="formGroup">
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
    			</div>
                <div className="formGroup">
					<label htmlFor="password">Confirm Password</label>
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
                        Passwords must match.
                    </Form.Control.Feedback>
    			</div>
				<input className="button" type="submit" value="Sign Up" />
			</Form>
		</main>
	);
};
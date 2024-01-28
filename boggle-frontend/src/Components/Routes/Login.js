//import in all hooks and dependencies
import { useContext, useState } from "react"
import { useNavigate }           from "react-router-dom"
import { CurrentUser }          from "../../Contexts/CurrentUser"
import { HashLink }              from "react-router-hash-link";

export default function Login() {
    const history = useNavigate();
    const { setCurrentUser } = useContext(CurrentUser);
    const [credentials, setCredentials] = useState({email: '',password: ''});
    const [errorMessage, setErrorMessage] = useState(null); 
    async function handleSubmit(e) {
        try {
            e.preventDefault();
            const response = await fetch(`http://localhost:5000/authentication/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            })
        
            const data = await response.json()
        
            if (response.status === 200) {
                setCurrentUser(data.user)
                localStorage.setItem('token', data.token);
                history.push(`/`);
            } else {
                console.log(data.message)
                setErrorMessage(data.message)
            }
        } catch (error) {
            console.log(`This error occured: ${error}`);
            setErrorMessage('An error occured, please try again');
        }
    }
    return (
        <main>
            {errorMessage !== null
                ? (
                    <div className="alert alert-danger" role="alert">
                        {errorMessage}
                    </div>
                )
                : null
            }
            <form onSubmit={handleSubmit} className="form">
                <h1>Login</h1>
                <div className="formGroup">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        required
                        value={credentials.email}
                        onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                        className="form-control"
                        id="email"
                        name="email"
                    />
                </div>
                <div className="formGroup">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        required
                        value={credentials.password}
                        onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                        className="form-control"
                        id="password"
                        name="password"
                    />
                </div>
                <input className="button" type="submit" value="Login" />
                <HashLink className='button' id='contact' to='/signUp/#' > New to Boggle? Sign Up for an account. </HashLink>
            </form>
        </main>
    );
};
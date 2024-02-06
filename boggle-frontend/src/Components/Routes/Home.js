//Import all required hooks and dependencies
import { useContext, useState }   from "react"
import { useNavigate }            from "react-router-dom"
import { CurrentUser }            from "../../Contexts/CurrentUser"
import { HashLink }               from "react-router-hash-link";



export default function Home () {
    //WE REQUIRE A TOAST FOR WHEN A PERSON ABANDONS A GAME, read from the url for now but thats not a good method
    //need to check if the value is true or error
    
    

    return(
        <main>
            <h1> Welcome to Boggle</h1>
        </main>
    )
}
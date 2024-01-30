//Import all required hooks and dependencies
import { useContext, useState }   from "react"
import { useNavigate }            from "react-router-dom"
import { CurrentUser }            from "../../Contexts/CurrentUser"
import { HashLink }               from "react-router-hash-link";



export default function Home () {
    return(
        <main>
            <h1> Welcome to Boggle</h1>
        </main>
    )
}
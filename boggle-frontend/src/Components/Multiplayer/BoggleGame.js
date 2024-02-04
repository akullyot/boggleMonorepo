//import in all hooks and dependencies
import { useState, useEffect, useContext } from 'react';
//All required media
//import in all bootsrap components
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';




export default function BoggleGame ({socket, roomId, seed, boardMatrix, setBoardMatrix,createRoomFrontendGameInputs }){
    //Required imports
    //All state variables
    //Handling the starting countdown
        const [toggleGameStartAnimation, setToggleGameStartAnimation] = useState(true);
        const [toggleCountdown, setToggleCountdown] = useState(3);
    //Scoring State variables
        const [score,setScore] = useState(0);
        const [foundCount, setfoundCount] = useState(0);
        const [validWordsArray, setValidWordsArray] = useState([]); // array of Objs {word:word, score:score}
        const [timer, setTimer] = useState({
            minutes: createRoomFrontendGameInputs.minutesDuration,
            seconds: 0
        });
        const [isGameEnded, setisGameEnded] = useState(false);
    //Input state variables
        const [guess, setGuess] = useState('');
        

    //USEEFFECT game start countdown
    useEffect(() => {
        setTimeout(() => {
            setToggleCountdown(2);
            setTimeout(() => {
                setToggleCountdown(1);
                setTimeout(() => {
                    setToggleGameStartAnimation(false)
                }, 1000)
            }, 1000)
        }, 1000);
    },[]);
    //Start the game timer once the loading animation is done 
    useEffect(() => {
        if(!toggleGameStartAnimation){
            let timerInterval = setInterval(() => {
                setTimer(prevTimer => {
                    if (prevTimer.seconds > 0) {
                        return { ...prevTimer, seconds: prevTimer.seconds - 1 };
                    } else {
                        if (prevTimer.minutes === 0) {
                            clearInterval(timerInterval);
                            setisGameEnded(true);
                            return prevTimer;
                        }
                        return { minutes: prevTimer.minutes - 1, seconds: 59 };
                    }
                });
            }, 1000);
            // Cleanup function to clear the interval when the component unmounts or when the timer is stopped
            return () => clearInterval(timerInterval);
        }
    }, [toggleGameStartAnimation])
    //End the game and send over results to the socker
    useEffect(() => {
        socket.on('recieveGameResults', (competitorResults) => {
            // {username: username, score:score, words: words}
        })
        return () => {
            socket.off('recieveGameResults')
        }
    }, [isGameEnded])
    //ALL SOCKET LISTEN EVENTS 


    //Handling submitting guesses
    useEffect(() => {
        //every time guess changes, check if its a valid board possibility
        //NOTE: THIS DOESNT CHECK FOR REPEATS, THATS HANDLED UPON SUBMISSION
        let formattedGuess = guess.toUpperCase();
        if(formattedGuess.length === 1){
            let isPresent = false;
            //deal with Qu
            if (formattedGuess === 'Q'){
                formattedGuess = 'Qu';
            };
            //Check if its anywhere on the board

            for (let rowIndex= 0; rowIndex< boardMatrix.length; rowIndex++){
                if(boardMatrix[rowIndex].includes(formattedGuess)){
                    isPresent = true;
                    break;
                }
            }
            isPresent ? setGuess(formattedGuess.toUpperCase()) : setGuess(''); 
        }else if (formattedGuess.length > 0){

            const lastInput = formattedGuess.charAt(formattedGuess.length - 2);
            // to make sure we handle if its Qu
            if (lastInput == 'U' && formattedGuess.charAt(formattedGuess.length - 3)){
                if (formattedGuess.charAt(formattedGuess.length - 3) === 'Q'){
                    lastInput = 'Qu'
                }
            };

            const currentInput = formattedGuess.charAt(formattedGuess.length - 1);
            //deal with q:
            if (formattedGuess.charAt(formattedGuess.length -1) === 'Q'){
                formattedGuess.concat("u");
                currentInput = 'Qu';
            }
            //you only need to check that the last and the last -1 are near eachother
            //first find all potential instances where last input couldve occured
            let isValid = false;
            boardMatrix.forEach((row, rowIndex) => {
                if (row.includes(lastInput)){
                    //Note: rows can contain the same letter twice
                    row.forEach((column, columnIndex) => {
                        if (column == lastInput){
                            //check all of its nearby neighbors for the current index
                            //to make it easier just put all options here and check if they exist
                            //[rowIndex, colindex]
                            //at most 8 options
                            if(
                                (boardMatrix[rowIndex - 1] && boardMatrix[rowIndex - 1][columnIndex] && boardMatrix[rowIndex - 1][columnIndex] == currentInput ) ||
                                (boardMatrix[rowIndex + 1] && boardMatrix[rowIndex + 1][columnIndex] && boardMatrix[rowIndex + 1][columnIndex] == currentInput ) ||
                                (boardMatrix[rowIndex][columnIndex - 1] && boardMatrix[rowIndex][columnIndex - 1] == currentInput ) ||
                                (boardMatrix[rowIndex][columnIndex + 1] && boardMatrix[rowIndex][columnIndex + 1] == currentInput ) ||
                                (boardMatrix[rowIndex - 1] && boardMatrix[rowIndex - 1][columnIndex + 1] && boardMatrix[rowIndex - 1][columnIndex + 1] == currentInput ) ||
                                (boardMatrix[rowIndex - 1] && boardMatrix[rowIndex - 1][columnIndex - 1] && boardMatrix[rowIndex - 1][columnIndex - 1] == currentInput ) ||
                                (boardMatrix[rowIndex + 1] && boardMatrix[rowIndex + 1][columnIndex + 1] && boardMatrix[rowIndex + 1][columnIndex + 1] == currentInput ) ||
                                (boardMatrix[rowIndex + 1] && boardMatrix[rowIndex + 1][columnIndex - 1] && boardMatrix[rowIndex + 1][columnIndex - 1] == currentInput ) 
                                ){
                                isValid = true;
                            };
                        }
                    })
                }
            });
            if (isValid){
                setGuess(formattedGuess.toUpperCase()) 
            }else{
                if (formattedGuess.charAt(formattedGuess.length -1) === 'u'){
                    //need to remove the q too
                    setGuess(formattedGuess.substring(0, formattedGuess.length -2))
                }else{
                    setGuess(formattedGuess.substring(0, formattedGuess.length -1))
                }
            };
        }

    }, [guess])
    const handleGuess = (e) => {
        e.preventDefault();
        console.log(guess);

    }



    const displayStartAnimation = (
        <div id="startAnimation" className='bg-dark bg-gradient'>
            <l-spiral size="70"speed="1.6" color="lightgreen"></l-spiral>
            <h2>Game Starts in {toggleCountdown}</h2>
        </div>
    )
    const displayGame = (
        <div id='boggleGameArea'>
            <section id= 'gameFoundWords' className='bg-dark bg-gradient'>
                <div className='header'>
                    <h2> All Found Words </h2>
                    <h4> Current Score: {score} </h4>
                </div>
                <ul>
                    {validWordsArray.map((wordObj, wordIndex) => {
                        <li key={wordIndex}>{wordObj.word.toUppercase()} : {wordObj.score}</li>
                    })}
                </ul>
                <h4> Words Found: {foundCount} </h4>
            </section>
            <section id='gamePlayerArea' >
                <div id="timer">
                    <h4>Time Remaining:</h4>
                    <h2> {timer.minutes} : { timer.seconds < 10 ? `0${ timer.seconds }` : timer.seconds } </h2>
                </div>
                <div id="boggleBoard" className='bg-dark bg-gradient'>
                    {boardMatrix.map((row, rowIndex) => {
                        return(
                            <div key={rowIndex} className='boggleBoardRow'>
                                {row.map((column, columnIndex) => {
                                    return(<div key = {columnIndex} className='boggleDice'> <span> {column} </span></div>)
                                })}
                            </div>
                        )
                    })}
                </div>
                <div id="inputBox" className='bg-dark bg-gradient'>
                    <Form data-bs-theme="dark"  onSubmit={handleGuess}>
                        <Form.Label>Guess</Form.Label>
                        <Form.Control type="text" value={guess} onChange={e => setGuess(e.target.value)} />
                        <Button variant="primary" type="submit">Submit</Button>
                    </Form>


                </div>
            </section>
        </div>
    );
    return(
        <main>
            {toggleGameStartAnimation ? displayStartAnimation : displayGame}
        </main>
    )
}

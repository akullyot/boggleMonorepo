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
        const [validWordsArray, setValidWordsArray] = useState([]); // array of Objs {word:word, score:score}
        const [wordCount, setWordCount] = useState(0);
        const [timer, setTimer] = useState({
            minutes: createRoomFrontendGameInputs.minutesDuration,
            seconds: 0
        });
        const [isGameEnded, setisGameEnded] = useState(false);
    //Input state variables
        const [guess, setGuess] = useState('');
    //In the background have your backend is calculating all solns
        const [allWordsFound, setAllWordsFound] = useState(false)
    
        

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
        const findAllWordsAPICall = async () => {
          console.log(process.env.REACT_APP_NODE_SERVER_URL)  
          const response = await fetch(`${process.env.REACT_APP_NODE_SERVER_URL}/games/findallwords`,{
                method: 'POST',
                headers: {
                    'authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({boardMatrix: boardMatrix})   
          });
        };
        findAllWordsAPICall();
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
    useEffect( () => {
        if (isGameEnded){
            // take your guess array and sort from smallest to largest, then alphabetically
            // also send over total score

            let userGameResults = {
                
            };
            socket.emit('sendGameResults', userGameResults);
            //send over relevant information to the backend to keep track of game results for each user
        }

    }, [isGameEnded])
    //ALL SOCKET LISTEN EVENTS 
    useEffect(() => {
        socket.on('recieveGameResults', (competitorResults) => {
            // {username: username, score:score, words: words}
        })
        return () => {
            socket.off('recieveGameResults')
        }
    }, [socket])



    //Handling submitting guesses, just checks if each new keystroke is nearby
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
            isPresent ? setGuess(guess.toUpperCase()) : setGuess(''); 
        }else if (formattedGuess.length > 0){
            const lastInput = formattedGuess.charAt(formattedGuess.length - 2);
            // to make sure we handle if its Qu
            if (lastInput == 'U' && formattedGuess.charAt(formattedGuess.length - 3)){
                if (formattedGuess.charAt(formattedGuess.length - 3) === 'Q'){
                    lastInput = 'Qu';
                }
            };
            const currentInput = formattedGuess.charAt(formattedGuess.length - 1);
            //deal with q:
            if (formattedGuess.charAt(formattedGuess.length -1) === 'Q'){
                formattedGuess.concat("u");
                currentInput = 'Qu';
            }
            if(formattedGuess.charAt(formattedGuess.length- 1) !== "U" && formattedGuess.charAt(formattedGuess.length- 2) !== "Q"){
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

            }else{
                setGuess(formattedGuess.toUpperCase()); 
            }

        }

    }, [guess]);

    const handleGuess = async (e) => {
        //Purpose: helper function for checking duplicates
        const checkDuplicate = (newCoord, path, newallPossiblePaths) => {
            //we check if this path already exists using json.stringify to compare two arrays
            let isduplicate = false;
            path.forEach(coord => {
                if (JSON.stringify(coord) === JSON.stringify(newCoord)){
                    isduplicate = true
                }
            })
            if(!isduplicate){
                let newPath = [...path, newCoord];
                newallPossiblePaths.push(newPath);
            }
        };
        e.preventDefault();
        try {
            //check length
            if (guess.length < 3){throw 'word is too short'};
            //check for duplicate words
            let wordDuplicate = false;
            validWordsArray.map(wordObj => {
                if(wordObj.word == guess){
                    wordDuplicate = true;
                }
            })
            if(wordDuplicate){throw 'word already found'};
            //check for duplicate letters
            //first lets split our guess into a string array, storing "QU" together as "Qu"
            let singleLettersArray = guess.split("");
            let guessArray = [];
            let allPossiblePaths =[];

            for (let i = 0; i< singleLettersArray.length; i++){
                if (singleLettersArray[i] === "Q"){
                    guessArray.push("Qu");
                    i++;
                }else{
                    guessArray.push(singleLettersArray[i]);
                } 
            };

            guessArray.forEach((letter,letterIndex) => {
                //if its the first letter, we just chekc if it exists on the board and store the first location as
                //[[rowIndex, columnIndex]]
                if (letterIndex == 0){
                    boardMatrix.forEach((row, rowIndex) => {
                        row.forEach((column, columnIndex) => {
                            if (column === letter){
                                allPossiblePaths.push(Array(Array(rowIndex, columnIndex)));
                            }
                        })
                    })
                }else{
                    //now we take the last elements of all possible paths
                    let newallPossiblePaths = [];
                     allPossiblePaths.forEach((path, pathIndex) => {
                        let [lastCoordrow, lastCoordColumn] = path[path.length - 1];
                        //check if every single possible next coordinate has the letter we are looking for 
                            if (boardMatrix[lastCoordrow - 1] && boardMatrix[lastCoordrow - 1][lastCoordColumn] && boardMatrix[lastCoordrow - 1][lastCoordColumn] === letter){
                                checkDuplicate([lastCoordrow - 1, lastCoordColumn], path, newallPossiblePaths);}
                            if (boardMatrix[lastCoordrow + 1] && boardMatrix[lastCoordrow + 1][lastCoordColumn] && boardMatrix[lastCoordrow + 1][lastCoordColumn] === letter){
                                checkDuplicate([lastCoordrow + 1, lastCoordColumn], path, newallPossiblePaths);}
                            if (boardMatrix[lastCoordrow][lastCoordColumn - 1] && boardMatrix[lastCoordrow][lastCoordColumn - 1] === letter){
                                checkDuplicate([lastCoordrow, lastCoordColumn-1],path, newallPossiblePaths);}
                            if (boardMatrix[lastCoordrow][lastCoordColumn + 1] && boardMatrix[lastCoordrow][lastCoordColumn + 1] === letter){
                                checkDuplicate([lastCoordrow, lastCoordColumn + 1], path, newallPossiblePaths);}
                            if (boardMatrix[lastCoordrow - 1] && boardMatrix[lastCoordrow - 1][lastCoordColumn + 1] && boardMatrix[lastCoordrow - 1][lastCoordColumn + 1] === letter){
                                checkDuplicate([lastCoordrow - 1, lastCoordColumn + 1],path, newallPossiblePaths);}
                            if (boardMatrix[lastCoordrow - 1] && boardMatrix[lastCoordrow - 1][lastCoordColumn - 1] && boardMatrix[lastCoordrow - 1][lastCoordColumn - 1] === letter){
                                checkDuplicate([lastCoordrow - 1, lastCoordColumn - 1], path, newallPossiblePaths);}
                            if (boardMatrix[lastCoordrow + 1] && boardMatrix[lastCoordrow + 1][lastCoordColumn + 1] && boardMatrix[lastCoordrow + 1][lastCoordColumn + 1] === letter){
                                checkDuplicate([lastCoordrow + 1, lastCoordColumn + 1],path, newallPossiblePaths);}
                            if (boardMatrix[lastCoordrow + 1] && boardMatrix[lastCoordrow + 1][lastCoordColumn - 1] && boardMatrix[lastCoordrow + 1][lastCoordColumn - 1] === letter){
                                checkDuplicate([lastCoordrow + 1, lastCoordColumn - 1], path, newallPossiblePaths);}      
                    });
                    allPossiblePaths = newallPossiblePaths;
                }
            });
            // If all possible paths is longer than 0 we have found a valid word
            if (allPossiblePaths.length === 0){
                throw "you cannot use the same die twice in forming a word"
            }
            // if they turned on autocheck we now send this word to a dictionary API to check validity
            if(createRoomFrontendGameInputs.turnOnAutoCheck){

                const response =await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${guess}`);
                const data = await response.json();
                if (data.title == "No Definitions Found"){
                    throw 'word is not in the dictionary'
                }
            };
            //Now check the score
            let thisScore = 0;
            if (guess.length === 3 || guess.length === 4 ){
                 thisScore = 1;
            }else if (guess.length === 5){
                 thisScore = 2;
            }else if (guess.length === 6){
                 thisScore = 3;
            }else if (guess.length === 7){
                 thisScore = 5;
            }else if (guess.length >= 8){
                 thisScore = 11;
            }
            setValidWordsArray((array) => [...array, {word: guess, score: thisScore}]);
            setScore(score + thisScore);
            setGuess("");
            setWordCount(wordCount + 1);
        } catch (error) {
            //show this somehow
            console.log(error);
            setGuess("");
        }
    };



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
                        return(
                            <li key={wordIndex}>
                                {wordObj.word} : {wordObj.score}
                            </li>
                        );
                    })}
                </ul>
                <h4> Words Found: {validWordsArray.length} </h4>
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
            {}
        </main>
    )
}

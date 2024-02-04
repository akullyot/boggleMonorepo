//REQUIRED IMPORTS/MODULES
const games             = require('express').Router();
const { fourXFourClassic, fourXFourNew, fiveXfiveClassic, sixXsixClassic } = require('../boggleData/dice.js');


//HELPER FUNCTIONS

//Purpose: shuffles an array using the Knuth Shuffle
const shuffle = (inputArray) => {
    for (let i = inputArray.length - 1; i > 0; i--) { 
        const j = Math.floor(Math.random() * (i + 1)); 
        [inputArray[i], inputArray[j]] = [inputArray[j], inputArray[i]]; 
      } 
      return inputArray; 
};




//Purpose: generates a new board for the given inputs
games.post('/newgame', async (req, res) => {
    try {
        if (req.body.gameType == 'fourXFourClassic' || req.body.gameType == 'fourXFourNew'){
            //first generate a die0...die15 array and shuffle 
            const diceIndexArray = shuffle(Array.from(Array(16).keys()).map(index => {return('die' + index)}));
            //seed structure: boardType_dieIndexRIdieRollIndex_....etc
            let seed = `4x4_`;
            let dieSet = null;
            if(req.body.game === 'fourXFourClassic' ){
                dieSet = fourXFourClassic;
                seed= seed.concat('c_')
            }else{
                dieSet= fourXFourNew;
                seed = seed.concat('n_')
            }
            let boardArray = diceIndexArray.map((die) => {
                const roll = Math.floor(Math.random() *6);
                seed = seed.concat(`${die}R${roll}`);
                return dieSet[die][roll];
            });
            let boardMatrix = [];
            //4x4 2d array
            while(boardArray.length){
                boardMatrix.push(boardArray.splice(0,4))
            };
            return res.status(200).json({seed:seed, boardMatrix:boardMatrix})
        }else{
            //reqrite above to work with 5x5 and 6x6
            throw 'not supported yet'
        }

    } catch (error) {
        console.error(error);
        //TODO this is a guess on the error code
        return res.status(409).json({message: 'board generation failed'})
    }
})




module.exports = games
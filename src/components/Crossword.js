
import { useCallback, useContext, useEffect, useState } from 'react'
import { AnswerContext, PropsContext, ColorContext, SetColorContext, GuessStateContext } from './Contexts.js'
import './../styles/crossword.css'

const sideLen = 15;

const emptyArr = [];
for (let i = 0; i < sideLen * sideLen; i++) {
    emptyArr.push(false);
}

export default function Crossword({setGameState, setGuessState, guessGrid, setGuessGrid, curLen, setLen, clearTimer}) {
    const answerGrid = useContext(AnswerContext);
    const gridProps = useContext(PropsContext);
    const color = useContext(ColorContext);
    const setColor = useContext(SetColorContext);
    const guessState = useContext(GuessStateContext);

    const [curLetterInd, setCurLetterInd] = useState(gridProps.firstLetterInd);
    const [curOrient, setCurOrient] = useState(() => {
        const obj = {};
        for (let i = 0; i < sideLen * sideLen; i++) {
            obj[i] = 0;
        }
        return obj;
    });
    const [curWordPos, setCurWordPos] = useState(() => {
        const firstLetterPos = gridProps.wordPos[curLetterInd];
        if(firstLetterPos[0][0] === firstLetterPos[0][1]) {
            return firstLetterPos[1];
        }
        return firstLetterPos[0];
    });


    const handleKeyDown = useCallback((e) => {
        const getNewLetterInd = (dir) => {
            const [start, end, orient] = curWordPos;
            const step = orient === 0 ? 1 : sideLen;
            if (dir === 0) {
                if (curLetterInd + step > end) {
                    return curLetterInd;
                }
                return curLetterInd + step;
            } else {
                if (curLetterInd - step < start) {
                    return curLetterInd;
                }
                return curLetterInd - step;
            }
        };

        const newIsWordGuessed = {};
        const newLetterPartOfWord = guessState.letterPartOfWord;
        let newNumWordsLeft = guessState.numWordsLeft;
        let numWordsLost = 0;

        const isLetterPartOfGuessedWord = () => {
            const letterWords = guessState.letterPartOfWord[curLetterInd];
            if (letterWords && Object.keys(letterWords).length > 0) {
                let flag = false;
                for (let [wordID, [exists, ori]] of Object.entries(letterWords)) {
                    if (!exists)
                        continue;
                    
                    newIsWordGuessed[wordID] = false;
                    newNumWordsLeft++;
                    numWordsLost++;
                    flag = true;

                    const [start, end, orient] = gridProps.wordPos[curLetterInd][ori];
                    const step = orient === 0 ? 1 : sideLen;
                    for (let i = start; i <= end; i += step) {
                        newLetterPartOfWord[i] = {
                            ...guessState.letterPartOfWord[i],
                            [wordID]: [false, -1]
                        };
                    }
                }

                return flag;
            }
            return false;
        }

        if (e.key.length === 1 && e.key.match(/[a-z]/i)) {
            const newLetter = e.key.toLowerCase();
            if (newLetter !== guessGrid[curLetterInd]) {
                const newGuessGrid = {
                    ...guessGrid,
                    [curLetterInd]: newLetter
                };
                setGuessGrid(newGuessGrid);
                localStorage.setItem("guessGrid", JSON.stringify(newGuessGrid));

                isLetterPartOfGuessedWord();

                const isWord = (ori) => {
                    const [start, end, _] = gridProps.wordPos[curLetterInd][ori];
                    const step = ori === 0 ? 1 : sideLen;
                    let str = "";
                    for (let ind = start; ind <= end; ind += step) {
                        if (!newGuessGrid[ind]) {
                            return false;
                        }
                        str += newGuessGrid[ind];
                    }
    
                    const wordID = gridProps.wordID[str.toLowerCase()];
                    if (wordID || wordID === 0) {
                        if (guessState.isWordGuessed[wordID]) {
                            setGameState({
                                status: 'info',
                                details: `Duplicate words: '${str.toUpperCase()}'`,
                                timed: true
                            });
                        } else {
                            for (let ind = start; ind <= end; ind += step) {
                                if (!newLetterPartOfWord[ind]) {
                                    newLetterPartOfWord[ind] = {};
                                }
                                newLetterPartOfWord[ind][wordID] = [true, ori];
                            }
                            newIsWordGuessed[wordID] = true;

                            return true;
                        }
                    }
                    return false;
                }

                isWord(0);
                isWord(1);

                newNumWordsLeft -= (Object.keys(newIsWordGuessed).length - numWordsLost);

                const newGuessState = {
                    letterPartOfWord: newLetterPartOfWord,
                    isWordGuessed: {
                        ...guessState.isWordGuessed,
                        ...newIsWordGuessed
                    },
                    numWordsLeft: newNumWordsLeft
                };
                localStorage.setItem("guessState", JSON.stringify(newGuessState));
                setGuessState(newGuessState);

                if (newNumWordsLeft === 0) {
                    setGameState({ status: 'success', details: 'Success!' });
                    clearTimer();
                }
            }
            
            const newLetterInd = getNewLetterInd(0);
            if (newLetterInd !== curLetterInd) {
                setCurLetterInd(newLetterInd);
            }
        } else if (e.key.startsWith("Arrow")) {
            let newLetterInd = curLetterInd;
            let orient = 0;
            switch(e.key.slice(5)) {
                case 'Left': {
                    if (newLetterInd % sideLen > 0)
                        newLetterInd--;
                    break;
                }
                case 'Right': {
                    if (newLetterInd % sideLen < sideLen - 1)
                        newLetterInd++
                    break;
                }
                case 'Up': {
                    if (Math.floor(newLetterInd / sideLen) > 0) {
                        newLetterInd -= sideLen;
                        orient = 1;
                    }
                    break;
                }
                case 'Down': {
                    if (Math.floor(newLetterInd / sideLen) < sideLen - 1) {
                        newLetterInd += sideLen;
                        orient = 1;
                    }
                    break;
                }
                default:
                    break;
            }

            const newVal = answerGrid[Math.floor(newLetterInd / sideLen)][newLetterInd % sideLen];
            if (!newVal || newVal === 'X') {
                return;
            }

            setCurLetterInd(newLetterInd);

            const wordPos = gridProps.wordPos[newLetterInd][orient];
            setCurWordPos(wordPos);
            setCurOrient({
                ...curOrient,
                [newLetterInd]: orient
            });
        } else if (e.key === 'Backspace') {
            const newGuessGrid = {
                ...guessGrid,
                [curLetterInd]: null
            };
            setGuessGrid(newGuessGrid);
            localStorage.setItem("guessGrid", JSON.stringify(newGuessGrid));

            isLetterPartOfGuessedWord();

            const newGuessState = {
                letterPartOfWord: newLetterPartOfWord,
                isWordGuessed: {
                    ...guessState.isWordGuessed,
                    ...newIsWordGuessed
                },
                numWordsLeft: newNumWordsLeft
            };
            localStorage.setItem("guessState", JSON.stringify(newGuessState));
            setGuessState(newGuessState);

            setCurLetterInd(getNewLetterInd(1));
        }
    }, [curLetterInd, curWordPos, guessGrid, guessState]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);

        return function cleanup() {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, [handleKeyDown]);

    return (
        <div className='crossword-grid'>
            <div
                className='crossword__bg'
                onClick={() => {
                    setLen(0);
                    document.body.classList.remove('highlight', 'highlight' + curLen);
                }}
            />
            {answerGrid.map((row, i) => (
                row.map((e, j) => {
                    const squareInd = i * sideLen + j;
                    const isShaded = !e || e === 'X';
                    const shadeClass = isShaded ? 'crossword__square--shaded' : '';
                    const wordPosSet = gridProps.wordPos[squareInd];
                    const highlightClass = !isShaded && (
                        ((wordPosSet[0][0] === curWordPos[0] && wordPosSet[0][1] === curWordPos[1]) ||
                        (wordPosSet[1][0] === curWordPos[0] && wordPosSet[1][1] === curWordPos[1]))
                            ? 'crossword__square--highlighted' : '');
                    const focusClass = curLetterInd === squareInd ? 'crossword__square--focused' : '';
                    const canSelect = !isShaded && !color[answerGrid[i][j]] && !guessGrid[squareInd];

                    const firstLen = !isShaded ? ((wordPosSet[0][1] - wordPosSet[0][0]) + 1) : 0;
                    const secondLen = !isShaded ? ((wordPosSet[1][1] - wordPosSet[1][0]) / sideLen + 1) : 0;

                    return (
                        <div
                            key={j}
                            className={`crossword__square ${shadeClass} ${highlightClass} ${focusClass} ${canSelect ? 'crossword__square--cs' : ''}  ${'len' + firstLen} ${'len' + secondLen}`}
                            onClick={() => {
                                if (shadeClass) {
                                    return;
                                }

                                if (canSelect && document.body.classList.contains("select-square")) {
                                    const oldCnt = color.cnt ? color.cnt : 0;
                                    setColor({
                                        ...color,
                                        [answerGrid[i][j]]: `hsl(${Math.round(oldCnt * 280 / 6)}, 80%, 90%)`,
                                        cnt: oldCnt + 1,
                                    });

                                    document.body.classList.remove("select-square");
                                    setGameState({status: 'ongoing', details: ''});

                                    return;
                                }

                                let newWordPos, newOrient = curOrient[squareInd];
                                if (squareInd !== curLetterInd) {
                                    setCurLetterInd(squareInd);
                                    const wordPos = gridProps.wordPos[squareInd][curOrient[squareInd]];
                                    if (wordPos[0] === wordPos[1]) {
                                        newOrient = 1 - curOrient[squareInd];
                                        newWordPos = gridProps.wordPos[squareInd][newOrient];
                                    } else {
                                        newWordPos = wordPos;
                                    }
                                } else {
                                    newOrient = 1 - curOrient[squareInd];
                                    newWordPos = gridProps.wordPos[squareInd][newOrient];
                                    if (newWordPos[0] === newWordPos[1]) {
                                        newOrient = curOrient[squareInd];
                                        newWordPos = gridProps.wordPos[squareInd][newOrient];
                                    }
                                }

                                setCurWordPos(newWordPos);
                                setCurOrient({
                                    ...curOrient,
                                    [squareInd]: newOrient
                                });
                            }}
                            // onBlur={() => {
                            //     setCurOrient({})
                            // }}
                        >
                            <div className='square__bg'
                                style={{
                                    backgroundColor: color[answerGrid[i][j]]
                                }}
                            />
                            <div className='square__letter'>
                                {guessGrid[squareInd]}
                            </div>
                        </div>
                    );
                })
            ))}
        </div>
    )
}
import { useState, useRef } from 'react';
import dict from '../dicts/dict.js'
import { AnswerContext, PropsContext, PrefsContext, ColorContext, SetColorContext, GuessStateContext } from './Contexts.js'
import Crossword from './Crossword.js';
import Toolbar from './Toolbar.js';
import Message from './Message.js';
import Settings from './Settings.js';
import WordList from './WordList.js';

const sideLen = 15;

function generateCrossword() {
    const gridRow = Array.from(Array(sideLen), () => new Array(sideLen));
    const gridCol = Array.from(Array(sideLen), () => new Array(sideLen));

    for (let i = 0; i < sideLen; i++) {
        for (let j = 0; j < sideLen; j++) {
            gridRow[i][j] = gridCol[i][j] = undefined;
        }
    }

    const isWordStart = {};
    const curLetterOri = {};
    const wordPosList = [];
    const wordListByLen = {};

    let dir = 0;
    let wordCnt = 0;
    let i = 0;

    while (wordCnt <= 30) {
        const row = Math.floor(Math.random() * sideLen);
        const col = Math.floor(Math.random() * sideLen);
        i++;
        if (dir === 0) {
            for (let wordLen = Math.round((sideLen - col) / (Math.random() + 1));
                wordLen >= 3; wordLen -= 2) {
                if (curLetterOri[row * sideLen + col] && curLetterOri[row * sideLen + col] !== 2) {
                    continue;
                }
                if (curLetterOri[row * sideLen + col + wordLen - 1] && curLetterOri[row * sideLen + col + wordLen - 1] !== 2) {
                    continue;
                }
                if (typeof gridRow[row][col + wordLen] !== 'undefined') {
                    continue;
                }
                if (col > 0 && typeof gridRow[row][col - 1] !== 'undefined') {
                    continue;
                }
                const curStr = gridRow[row].slice(col, col + wordLen)
                    .map((e, i) => (typeof e === 'undefined') ? '.' : e)
                    .join('');
                const pattern = new RegExp(curStr, 'g');
                const word = dict[`${wordLen}`].find(w => pattern.test(w));
                if (typeof word !== 'undefined' && (!wordListByLen[wordLen] || !wordListByLen[wordLen].includes(word))) {
                    isWordStart[row * sideLen + col] = true;
                    wordPosList.push([
                        row * sideLen + col,
                        row * sideLen + (col + wordLen),
                        0
                    ]);
                    if (wordListByLen[wordLen]) {
                        wordListByLen[wordLen].push(word);
                    } else {
                        wordListByLen[wordLen] = [word];
                    }
                    wordCnt++;

                    for (let c = col; c < col + wordLen; c++) {
                        gridRow[row][c] = word[c - col];
                        gridCol[c][row] = word[c - col];
                        curLetterOri[row * sideLen + c] = curLetterOri[row * sideLen + c] ? 3 : 1;
                    }
                    if (col > 0) {
                        gridRow[row][col - 1] = 'X';
                        gridCol[col - 1][row] = 'X';
                    }
                    if (col + wordLen < sideLen) {
                        gridRow[row][col + wordLen] = 'X';
                        gridCol[col + wordLen][row] = 'X';
                    }
                    dir = 1 - dir;
                    break;
                }
            }
        } else {
            for (let wordLen = Math.round((sideLen - row) / (Math.random() + 1));
                wordLen >= 3; wordLen -= 2) {
                if (curLetterOri[row * sideLen + col] && curLetterOri[row * sideLen + col] !== 1) {
                    continue;
                }
                if (curLetterOri[(row + wordLen - 1) * sideLen + col] && curLetterOri[(row + wordLen - 1) * sideLen + col] !== 1) {
                    continue;
                }
                if (typeof gridCol[col][row + wordLen] !== 'undefined') {
                    continue;
                }
                if (row > 0 && typeof gridCol[col][row - 1] !== 'undefined') {
                    continue;
                }
                const curStr = gridCol[col].slice(row, row + wordLen)
                    .map((e, i) => (typeof e === 'undefined') ? '.' : e)
                    .join('');
                const pattern = new RegExp(curStr, 'g');
                const word = dict[`${wordLen}`].find(w => pattern.test(w));
                if (typeof word !== 'undefined' && (!wordListByLen[wordLen] || !wordListByLen[wordLen].includes(word))) {
                    isWordStart[row * sideLen + col] = true;
                    wordPosList.push([
                        row * sideLen + col,
                        (row + wordLen) * sideLen + col,
                        1
                    ]);
                    if (wordListByLen[wordLen]) {
                        wordListByLen[wordLen].push(word);
                    } else {
                        wordListByLen[wordLen] = [word];
                    }
                    wordCnt++;

                    for (let r = row; r < row + wordLen; r++) {
                        gridRow[r][col] = word[r - row];
                        gridCol[col][r] = word[r - row];
                        curLetterOri[r * sideLen + col] = curLetterOri[r * sideLen + col] ? 3 : 2;
                    }
                    if (row > 0) {
                        gridRow[row - 1][col] = 'X';
                        gridCol[col][row - 1] = 'X';
                    }
                    if (row + wordLen < sideLen) {
                        gridRow[row + wordLen][col] = 'X';
                        gridCol[col][row + wordLen] = 'X';
                    }
                    dir = 1 - dir;
                    break;
                }
            }
        }
        if (i > 1000) {
            break;
        }
    }

    wordPosList.sort((a, b) => {
        for (let i = 0; i < 3; i++) {
            if (a[i] !== b[i]) {
                return a[i] - b[i];
            }
        }
        return -1;
    });

    let numCrossings = 0;
    const letterCrossings = {};       // which word letter is in
    for (let wordInd in wordPosList) {
        let [begin, end, dir] = wordPosList[wordInd];
        let binds = [Math.floor(begin / sideLen), begin % sideLen];
        let einds = [Math.floor(end / sideLen), end % sideLen];
        for (let i = binds[1 - dir]; i < einds[1 - dir]; i++) {
            const curLetter = dir === 0 ? binds[dir] * sideLen + i : i * sideLen + binds[dir];
            letterCrossings[curLetter]++;
            if (letterCrossings[curLetter] > 1) {
                numCrossings++;
            }
        }
    }

    let numShaded = 0;
    for (let r = 0; r < sideLen; r++) {
        for (let c = 0; c < sideLen; c++) {
            numShaded += ((typeof gridRow[r][c] === 'undefined') || gridRow[r][c] === 'X');
        }
    }

    return {
        numCrossings: numCrossings,
        numShaded: numShaded,
        answerGrid: gridRow,
        wordList: wordListByLen,
        firstLetterInd: wordPosList[0][0]
    };
}

function getCrossword() {
    let bestScore = -1;
    let bestGridState = {};
    for (let i = 0; i < 20; i++) {
        const { numCrossings, numShaded, ...gridState } = generateCrossword();
        const curScore = numCrossings / numShaded;
        if (curScore > bestScore) {
            bestScore = curScore;
            bestGridState = gridState;
        }
    }
    // console.log('best score', bestScore);

    const grid = bestGridState.answerGrid;
    const wordPos = {};     // word position of letter

    const isShaded = (pos) => !gridAtIndex(pos) || gridAtIndex(pos) === 'X';
    
    const gridAtIndex = (ind) => {
        return grid[Math.floor(ind / sideLen)][ind % sideLen];
    }

    const getWordPos = (pos, orient) => {
        const step = orient === 0 ? 1 : sideLen;
        let start = pos, end = pos;
        while (start - step >= 0 && !isShaded(start - step)
            && !(orient === 0 && (start - step) % sideLen === sideLen - 1)) {
            start -= step;
        }
        while (end + step < sideLen * sideLen && !isShaded(end + step)
            && !(orient === 0 && (end + step) % sideLen === 0)) {
            end += step;
        }
    
        return [start, end, orient];
    }

    for (let r = 0; r < sideLen; r++) {
        for (let c = 0; c < sideLen; c++) {
            const squareInd = r * sideLen + c;
            if (isShaded(squareInd)) continue;
            wordPos[squareInd] = [];
            for (let ori = 0; ori < 2; ori++) {
                wordPos[squareInd].push(getWordPos(squareInd, ori));
            }
        }
    }

    const wordID = {};
    let i = 0;
    for (let wordSet of Object.values(bestGridState.wordList)) {
        for (let word of wordSet) {
            wordID[word] = i++;
        }
    }

    return {...bestGridState, wordPos: wordPos, wordID: wordID};
}

export default function Interface() {
    const [crossword, setCrossword] = useState(() => {
        if (localStorage.getItem("crosswordAnswer")) {
            return {
                answer: JSON.parse(localStorage.getItem("crosswordAnswer")),
                props: JSON.parse(localStorage.getItem("gridProps"))
            };
        } else {
            let { answerGrid, ...initialGridProps } = getCrossword();
            localStorage.setItem("crosswordAnswer", JSON.stringify(answerGrid));
            localStorage.setItem("gridProps", JSON.stringify(initialGridProps));
            return { answer: answerGrid, props: initialGridProps };
        }
    });

    function handleLetterCntChange(letter, change) {
        setCrossword(prevProps => {
            const newProps = {
                ...prevProps,
                props: {
                    ...prevProps.props,
                    letterCnt: {
                        ...prevProps.props.letterCnt,
                        [letter]: prevProps.props.letterCnt[letter] + change
                    }
                }
            };
            return newProps;
        });
    }


    const answerGrid = crossword.answer;
    const gridProps = crossword.props;

    const [color, setColor] = useState(() => {
        const initialColor = localStorage.getItem("color");
        return initialColor ? () => JSON.parse(initialColor) : {};
    });

    const [msg, setMsg] = useState(() => {
        const gameState = localStorage.getItem("message");
        return gameState ? JSON.parse(gameState) : { status: 'ongoing', details: '' };
    });

    function handleChangeMsg(newMsg) {
        setMsg(newMsg);
        if (newMsg.status !== 'info') {
            localStorage.setItem("message", JSON.stringify(newMsg));
        }
    }

    const [prefs, setPrefs] = useState({
        isCasual: true,
        timeLimit: 120,
    });

    const timer = useRef(null);
    const [timerState, setTimerState] = useState(0);    // 0 for unstarted, -1 for paused, and 1 for playing

    const [guessState, setGuessState] = useState(() => {
        const storedGuessState = localStorage.getItem("guessState");
        return storedGuessState ? JSON.parse(storedGuessState) : {
            letterPartOfWord: {},
            isWordGuessed: {},
            numWordsLeft: Object.keys(gridProps.wordID).length,
        };
    });
    const [guessGrid, setGuessGrid] = useState(() => localStorage.getItem("guessGrid") ? JSON.parse(localStorage.getItem("guessGrid")) : {});

    function clearTimer() {
        clearInterval(timer.current);
        timer.current = null;
        setTimerState(0);
    }

    function restartGame(newNumWordsLeft = Object.keys(gridProps.wordID).length) {
        setGuessGrid({});
        setGuessState({
            letterPartOfWord: {},
            isWordGuessed: {},
            numWordsLeft: newNumWordsLeft,
        });
        localStorage.removeItem("guessGrid");
        localStorage.removeItem("guessState");
        
        clearTimer();

        setColor({});
        handleChangeMsg({ status: 'ongoing', details: '' });

        document.body.classList.remove("settings-on", "freeze");
        if (curLen !== 0) {
            document.body.classList.remove("highlight", 'highlight' + curLen);
        }
    }

    function genNewCrossword() {
        let { answerGrid, ...initialGridProps } = getCrossword();
        // console.log('answer', answerGrid)
        localStorage.setItem("crosswordAnswer", JSON.stringify(answerGrid));
        localStorage.setItem("gridProps", JSON.stringify(initialGridProps));
        
        setCrossword({ answer: answerGrid, props: initialGridProps });
        
        restartGame(Object.keys(initialGridProps.wordID).length);
    }

    const [curLen, setLen] = useState(0);   // current highlighted length

    return (
        <div className='interface'>
            <div
                className='interface-overlay'
                onClick={() => {
                    document.body.classList.remove("select-square");
                    handleChangeMsg({ status: 'ongoing', details: '' });
                }}
                title='Cancel'
            />
            <div
                className='interface__bg'
                onClick={() => {
                    setLen(0);
                    document.body.classList.remove('highlight', 'highlight' + curLen);
                }}
            />
            <PrefsContext.Provider value={prefs}>
                <PropsContext.Provider value={gridProps}>
                    <ColorContext.Provider value={color}>
                        <SetColorContext.Provider value={setColor}>
                            <Message
                                msg={msg}
                                changeMsg={handleChangeMsg}
                                restartGame={restartGame}
                                genNewCrossword={genNewCrossword}
                            />
                            <Toolbar
                                setMsg={handleChangeMsg}
                                timer={timer}
                                timerState={timerState}
                                setTimerState={setTimerState}
                            />
                            <div className='interface__main'>
                            <AnswerContext.Provider value={answerGrid}>
                                <GuessStateContext.Provider value={guessState}>
                                    <Crossword
                                        setGameState={handleChangeMsg}
                                        setGridProps={handleLetterCntChange}
                                        setGuessState={setGuessState}
                                        guessGrid={guessGrid}
                                        setGuessGrid={setGuessGrid}
                                        curLen={curLen}
                                        setLen={setLen}
                                        clearTimer={clearTimer}
                                    />
                                    <WordList
                                        wordList={crossword.props.wordList}
                                        wordID={crossword.props.wordID}
                                        curLen={curLen}
                                        setLen={setLen}
                                    />
                                </GuessStateContext.Provider>
                            </AnswerContext.Provider>
                            </div>
                        </SetColorContext.Provider>
                    </ColorContext.Provider>
                </PropsContext.Provider>
                <Settings
                    setPrefs={setPrefs}
                    restartGame={restartGame}
                    genNewCrossword={genNewCrossword}
                />
            </PrefsContext.Provider>
        </div>
    )
}
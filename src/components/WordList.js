import { useContext, useMemo } from "react"
import { GuessStateContext } from "./Contexts";
import './../styles/word-list.css'

const highlightThreshold = 5;

export default function WordList({wordList, wordID, curLen, setLen}) {
    const guessState = useContext(GuessStateContext);

    const isHighlight = guessState.numWordsLeft <= highlightThreshold;

    const list = useMemo(() => (
        Object.entries(wordList).map(([len, list]) => (
            <div key={len} className={"list__section" + (curLen === len ? ' list__section--highlight' : '')}>
                <h1
                    onClick={() => {
                        if (curLen !== 0) {
                            document.body.classList.remove('highlight' + curLen);
                            if (curLen === len) {
                                document.body.classList.remove('highlight');
                                setLen(0);
                                return;
                                
                            }
                        }
                        document.body.classList.add('highlight', 'highlight' + len);
                        setLen(len);
                    }}
                >
                    {len} LETTERS
                </h1>
                <div>
                    {
                        list.sort((word1, word2) => word1.localeCompare(word2))
                        .map(word => (
                            <div
                                key={wordID[word]}
                                className={`list__word${guessState.isWordGuessed[wordID[word]] ? ' list__word--hidden' : ' list__word--show'}`}
                            >
                                {word}
                            </div>
                        ))
                    }
                </div>
            </div>
        ))
    ), [guessState, curLen]);

    return (
        <div className="word-list-wrapper">
            {isHighlight && <>
                <div className="list__tip">
                    <span className="tip__bar" style={{ width: guessState.numWordsLeft * 3 + 'px' }} />
                    <span>{guessState.numWordsLeft} words left</span>
                </div>
            </>}
            <div className={"word-list" + (isHighlight ? " highlight" : '')}>
                {list}
            </div>
            <div className="list__footer">
                Click on the headings (eg '9 LETTERS') to highlight all consecutive blocks with the corresponding length!
            </div>
        </div>
    )
}
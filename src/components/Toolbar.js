import { useState, useContext } from 'react'
import './../styles/toolbar.css'
import {ReactComponent as TimerIcon} from './../icons/timer.svg'
import {ReactComponent as SettingsIcon} from './../icons/settings.svg'
import { ReactComponent as ColorIcon } from './../icons/colorize.svg'
import { PrefsContext } from './Contexts.js'
import { formatTime } from './UtilFuncs.js'

function ToolExtend({ setMsg, timer, timerState, setTimerState }) {
    const prefs = useContext(PrefsContext);

    const [timeLeft, setTimeLeft] = useState(0);

    const expandClass = timerState ? '' : 'action__btn--small';

    function handleTimer() {
        if (timerState > 0 && timer.current) {
            if (!prefs.isCasual)
                return;
            
            clearInterval(timer.current);
            timer.current = null;
            setTimerState(-1);
        } else {
            const timeRemaining = timerState < 0 ? timeLeft : prefs.timeLimit;
            setTimeLeft(timeRemaining);
            setTimerState(1);
            
            let i = 0;
            timer.current = setInterval(() => {
                setTimeLeft(prev => prev - 1);
                i++;
                if (i === timeRemaining) {
                    clearInterval(timer.current);
                    document.body.classList.add('freeze');
                    setMsg({
                        status: 'timeout',
                        details: "Time's up!",
                    });
                    return;
                }
            }, 1000);
        }
    }

    return (
        <div
            className="toolbar__action"
        >
            <button
                className={`action__btn ${expandClass}`}
                tabIndex={0}
                onClick={handleTimer}
            >
                <span className='action__icon'>
                    <TimerIcon />
                </span>
                <span className={"action__label action__label--mono" + (timerState === -1 ? ' action__label--muted' : '')}>
                    {formatTime(timeLeft)}
                </span>
            </button>
            {
                (prefs.isCasual || timerState === 0) &&
                <div className='action__tooltip'>
                    {timerState === 1 ? 'Pause' : (timerState === 0 ? 'Start Timer' : 'Resume')}
                </div>
            }
        </div>
    )
}

function Tool({ action, isDisabled, tooltip, children }) {
    return (
        <div
            className="toolbar__action"
        >
            <button
                className='action__btn action__btn--small'
                tabIndex={0}
                onClick={action}
                disabled={isDisabled}
            >
                <span className='action__icon'>
                    {children}
                </span>
            </button>
            <div className='action__tooltip'>{tooltip}</div>
        </div>
    );
}

export default function Toolbar({ setMsg, timer, timerState, setTimerState }) {
    const prefs = useContext(PrefsContext);

    return (
        <div className="toolbar">
            <div className="toolbar__flex">
                {prefs.isCasual && <Tool
                    isDisabled={false}
                    action={() => {
                        document.body.classList.add('select-square');
                        setMsg({
                            status: 'info',
                            details: 'Click on any empty square to highlight all squares with the same letter'
                        });
                    }}
                    tooltip='Colorize'
                >
                    <ColorIcon />
                </Tool>}
                <ToolExtend
                    setMsg={setMsg}
                    timer={timer}
                    timerState={timerState}
                    setTimerState={setTimerState}
                />
                <Tool
                    isDisabled={false}
                    action={() => {
                        document.body.classList.toggle("settings-on");
                    }}
                    tooltip='Settings'
                >
                    <SettingsIcon />
                </Tool>
            </div>
        </div>
    )
}
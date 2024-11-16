import { useContext, useState } from 'react'
import './../styles/settings.css'
import {PrefsContext} from './Contexts'
import { formatTime } from './UtilFuncs.js'

const timerOptions = [150, 300, 600, 1200];

function TimerSettings({prefs, setPrefs}) {
    const [isCustom, setIsCustom] = useState(false);

    return (
        <div className="settings__panel">
            <div className='panel__inner'>
                <legend className='panel__label'>Select timer limit:</legend>
                <div className='timer-opts'>
                    {timerOptions.map(time => {
                        return (
                            <div key={time} className='timer-opt'>
                                <input
                                    type='radio'
                                    id={`timer${time}`}
                                    name='timeOption'
                                    className='opt__radio'
                                    checked={!isCustom && prefs.timeLimit === time}
                                    onChange={() => {
                                        setIsCustom(false);
                                        setPrefs(prevPrefs => ({
                                            ...prevPrefs,
                                            timeLimit: time
                                        }));
                                    }}
                                />
                                <label
                                    htmlFor={`timer${time}`}
                                    className='opt__label'
                                >
                                    {formatTime(time)}
                                </label>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className='panel__desc'>
                Changes will only apply if timer has not been started.
                Otherwise restarting is required to see effect.
            </div>
        </div>
    )
}

export default function Settings({ setPrefs, restartGame, genNewCrossword }) {
    const prefs = useContext(PrefsContext);

    return (
        <div className="settings">
            <div
                className='settings__bg'
                onClick={() => {
                    document.body.classList.remove("settings-on");
                }}
            />
            <div className="settings__inner">
                <button
                    className='settings__close'
                    onClick={() => {
                        document.body.classList.remove("settings-on");
                    }}
                />
                <h1 className='settings__heading'>Settings</h1>
                <div className="settings__panel settings__panel--flex">
                    <div className='panel__inner'>
                        <legend className='panel__label'>Casual Mode</legend>
                        <label htmlFor="mode" className="panel__control settings__switch">
                            <input
                                id="mode"
                                name="mode"
                                className="settings__checkbox"
                                type="checkbox"
                                checked={prefs.isCasual}
                                onChange={() => {
                                    setPrefs(prevPrefs => ({
                                        ...prevPrefs,
                                        isCasual: !prevPrefs.isCasual
                                    }));
                                }}
                            />
                            <span className="settings__track"></span>
                        </label>
                    </div>
                    <div className='panel__desc'>
                        'Casual Mode' gives the option of colorizing and allows starting and pausing the timer mid-game.
                    </div>
                </div>
                <TimerSettings
                    prefs={prefs}
                    setPrefs={setPrefs}
                />
                <div className="settings__panel settings__panel--list">
                    <button
                        className='restart-btn'
                        onClick={() => {
                            restartGame();
                        }}
                    >
                        Restart
                    </button>
                    <button
                        className='restart-btn'
                        onClick={() => {
                            genNewCrossword();
                        }}
                    >
                        New crossword
                    </button>
                </div>
            </div>
        </div>
    )
}
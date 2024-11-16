import { useEffect } from 'react';
import {ReactComponent as SuccessIcon} from './../icons/check.svg'
import {ReactComponent as FailureIcon} from './../icons/cross.svg'

export default function Message({ msg, changeMsg, restartGame, genNewCrossword }) {
    useEffect(() => {
        if (msg.timed) {
            setTimeout(() => {
                changeMsg({ status: 'ongoing', details: '' });
            }, 6000);
        }
    }, [msg.timed]);

    if (msg.status === 'ongoing') {
        return null;
    }

    if (msg.status === 'info') {
        return (
            <div className={`message message--info`}>
                <div className="message__content">
                    {msg.details}
                </div>
            </div>
        );
    }

    return (
        <div className={`message message--${msg.status === 'success' ? 'success' : 'failure'}`}>
            <div className="message__icon">
                {msg.status === 'success' ? <SuccessIcon /> : <FailureIcon />}
            </div>
            <div className="message__content">
                {msg.status !== 'timeout' ? msg.details : "Oops! You've run out of time!"}
                {' '}
                <span
                    className="message__action-btn"
                    onClick={() => {
                        restartGame();
                    }}
                >
                    Restart
                </span>
                <span
                    className="message__action-btn"
                    onClick={() => {
                        genNewCrossword();
                    }}
                >
                    New crossword
                </span>
            </div>
        </div>
    )
}
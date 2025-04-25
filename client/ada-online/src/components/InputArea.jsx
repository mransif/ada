// src/components/InputArea.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './InputArea.css'; // Make sure to add styles for the new button here too


/**
 * Renders the text input, send button, mute/unmute button, and webcam button.
 * Handles user input and interactions, communicating via callbacks.
 * @param {object} props - Component props.
 * @param {function} props.onSendText - Callback when text is sent.
 * @param {boolean} props.isMuted - Whether the mic is currently muted.
 * @param {boolean} props.isListening - Whether the mic is actively listening.
 * @param {function} props.onToggleMute - Callback when mute/unmute button is clicked.
 * @param {boolean} props.micSupported - Whether the browser supports Web Speech API.
 * @param {boolean} props.isWebcamVisible - Whether the webcam feed is currently visible.
 * @param {function} props.onToggleWebcam - Callback when webcam toggle button is clicked.
 */
function InputArea({
    onSendText,
    isMuted,
    isListening,
    onToggleMute,
    micSupported,
    isWebcamVisible, // **** RECEIVE WEBCAM PROP ****
    onToggleWebcam   // **** RECEIVE WEBCAM HANDLER ****
}) {
    const [inputValue, setInputValue] = useState('');

    // Handle changes in the text input field
    const handleInputChange = (event) => {
        setInputValue(event.target.value);
    };

    // Handle sending text (button click or Enter key)
    const handleSend = () => {
        const trimmedInput = inputValue.trim();
        if (trimmedInput) {
            onSendText(trimmedInput); // Call parent handler
            setInputValue(''); // Clear the input field
        }
    };

    // Handle Enter key press in the input field
    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent potential form submission/newline
            handleSend();
        }
    };

    // Determine Mute button text and appearance
    let muteButtonText = 'Mic N/A';
    let muteButtonClass = 'mute-button';
    let isMuteButtonDisabled = true;

    if (micSupported) {
        isMuteButtonDisabled = false;
        if (isMuted) {
            muteButtonText = 'Unmute';
            muteButtonClass += ' muted'; // Add 'muted' class for styling
        } else {
            // You could optionally show "Listening..." if isListening is true
            // muteButtonText = isListening ? 'Listening...' : 'Mute';
            muteButtonText = 'Mute'; // Keep it simple like original for now
        }
    }

    // **** DETERMINE WEBCAM BUTTON TEXT/STYLE ****
    const webcamButtonText = isWebcamVisible ? 'Hide Cam' : 'Show Cam';
    const webcamButtonClass = `webcam-button ${isWebcamVisible ? 'active' : ''}`;


    return (
        <div className="flex flex-wrap gap-2 my-4 p-1 rounded-full mx-auto bg-slate-30 ">

            <div className="flex gap-2 rounded-full border-[1px] border-[#2D3033] p-3 ">
                <input
                    type="text"
                    id="message-input"
                    className="flex-1 min-w-[400px] px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    placeholder="Type your message or use the mic..."
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    aria-label="Message Input"
                />
                <button
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-200"
                    onClick={handleSend}
                    aria-label="Send Message"
                >
                    Send
                </button>
            </div>

            <div className='flex gap-2 rounded-full  border-[1px] border-[#2D3033] p-3'>

                <button
                    className={`px-4 py-2 rounded-full text-white font-medium transition-colors duration-200 ${isMuteButtonDisabled
                        ? 'bg-gray-400 cursor-not-allowed'
                        : isMuted
                            ? 'bg-red-600 hover:bg-red-600'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    onClick={onToggleMute}
                    disabled={isMuteButtonDisabled}
                    aria-label={muteButtonText}
                >
                    {isMuted ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3l18 18"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                            />
                        </svg>
                    )}
                </button>
                <button
                    className={`px-4 py-2 text-white font-medium rounded-full transition-colors duration-200 ${isWebcamVisible
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-blue-500 hover:bg-blue-600'
                        }`}
                    onClick={onToggleWebcam}
                    aria-label={webcamButtonText}
                >
                    {isWebcamVisible ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 3l18 18"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

InputArea.propTypes = {
    onSendText: PropTypes.func.isRequired,
    isMuted: PropTypes.bool.isRequired,
    isListening: PropTypes.bool.isRequired, // Include if used for styling/text
    onToggleMute: PropTypes.func.isRequired,
    micSupported: PropTypes.bool.isRequired,
    isWebcamVisible: PropTypes.bool.isRequired, // **** ADD WEBCAM PROP TYPE ****
    onToggleWebcam: PropTypes.func.isRequired,  // **** ADD WEBCAM HANDLER PROP TYPE ****
};

export default InputArea;
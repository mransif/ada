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
       <div className="flex flex-wrap gap-2 mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <input
        type="text"
        id="message-input"
        className="flex-1 min-w-0 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Type your message or use the mic..."
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyPress}
        aria-label="Message Input"
    />
    <button
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
        onClick={handleSend}
        aria-label="Send Message"
    >
        Send
    </button>
    <button
        className={`px-4 py-2 rounded-full ${isMuteButtonDisabled ? 'bg-gray-400 cursor-not-allowed ' : 'bg-gray-600 hover:bg-gray-700'} text-white font-medium rounded-md transition-colors`}
        onClick={onToggleMute}
        disabled={isMuteButtonDisabled}
        aria-label={muteButtonText}
    >
        {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" />
            </svg>
        ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
        )}
    </button>
    <button
        className={`px-4 py-2 ${isWebcamVisible  ? 'bg-red-600 hover:bg-red-700' : 'bg-purple-600 hover:bg-purple-700'} text-white font-medium rounded-md transition-colors`}
        onClick={onToggleWebcam}
        aria-label={webcamButtonText}
    >
        {webcamButtonText}
    </button>
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
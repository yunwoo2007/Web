import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { driveLink } from "../utils/f_config";
import { useNavigate } from "react-router-dom";

const SubjectDrive = () => {
    const navigate = useNavigate();
    const [localSubject, setLocalSubject] = useState(JSON.parse(localStorage.getItem('subject')));
    const [subject, setSubject] = useState('');
    const [isFullDriveUser, setIsFullDriveUser] = useState(false);

    useEffect(() => {
        if (localSubject && localSubject.length > 0) {
            // Check if "Full Drive" is in the subjects
            if (localSubject.includes("Full Drive")) {
                setIsFullDriveUser(true);
                setSubject("Full Drive"); // Set subject to "Full Drive" if present
            } else {
                setSubject(localSubject[0]); // Set initial subject if "Full Drive" is not present
            }
        }
    }, [localSubject]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            width: '100%',
            position: 'relative'
        }}>
            <h1 style={{
                marginBottom: '20px',
                fontSize: '24px',
                fontWeight: 'bold'
            }}>{isFullDriveUser ? 'Access Curriculum' : 'Select Your Subject'}</h1>

            {/* Conditionally render the dropdown if not a "Full Drive" user */}
            {!isFullDriveUser && (
                <select
                    onChange={(e) => {
                        setSubject(e.target.value);
                    }}
                    value={subject}
                    style={{
                        padding: '12px 24px',
                        fontSize: '16px',
                        backgroundColor: '#f2f2f2',
                        color: '#222',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        transition: 'all 0.3s ease',
                        margin: '10px 0'
                    }}
                >
                    {localSubject.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>
            )}

            <button
                onClick={() => {
                    if (subject === '') {
                        alert('Please select a subject');
                        return;
                    }
                    window.open(driveLink[subject], '_blank');
                    return;
                }}
                style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    backgroundColor: '#b80b92',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.3s ease',
                    margin: '10px 0'
                }}
            >
                Access {isFullDriveUser ? 'Curriculum' : `${subject} Curriculum`}
            </button>

            {/* Conditionally render the settings icon only if the user has "Full Drive" */}
            {isFullDriveUser && (
                <i
                    style={{position:'absolute', top:'10px', right:'10px', color:'#b80b92', fontSize:'24px', cursor:'pointer'}}
                    onClick={() => { navigate('/users'); }}
                >
                    <FontAwesomeIcon icon={faCog} />
                </i>
            )}
        </div>
    );
}

export default SubjectDrive;

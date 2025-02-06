import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { updateUser } from "../utils/firebase_auth";

const SUBJECTS = [
    "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "Pre-Kindergarten", "Kindergarten", "6th Grade ELA", "Math 6AB",
    "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies",
    "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", 
    "6th Grade Creative Problem Solving", "6th Grade Visual Arts",
    "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB",
    "Math 7AB", "7th Grade ELA", "Spanish I(Middle School)", "7th Grade Social Studies",
    "7th Grade Science", "7th Grade Band", "7th Grade Computer Science",
    "7th Grade Creative Problem Solving", "7th Grade Visual Arts",
    "7th Grade Physical Education", "7th Grade Orchestra", "Spanish II(Middle School)"
];

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null); // Tracks which user card is expanded

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const updatedUsers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(updatedUsers);
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteSubject = async (userId, subject) => {
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const updatedSubjects = user.subject.filter(sub => sub !== subject);
        await updateUser(userId, { ...user, subject: updatedSubjects });
    };

    const handleAddSubject = async (userId, subject) => {
        if (!subject) return;
        const user = users.find(u => u.id === userId);
        if (!user) return;
        
        const updatedSubjects = [...user.subject, subject];
        await updateUser(userId, { ...user, subject: updatedSubjects });
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        await deleteDoc(doc(db, "users", userId));
        setUsers(users.filter(user => user.id !== userId)); // Update UI after deletion
    };

    return (
        <div className="flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold mb-6">Teachers</h2>
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((user) => (
                    <div 
                        key={user.id} 
                        className="bg-white shadow-lg rounded-lg p-6 border cursor-pointer"
                        onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
                    >
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-gray-600">ID: {user.id}</p>
                        <p className="text-gray-600">Email: {user.email}</p>

                        {expandedUser === user.id && (
                            <div className="mt-4">
                                <h4 className="font-semibold">Subjects:</h4>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {user.subject?.map((sub) => (
                                        <button
                                            key={sub}
                                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg"
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevents card from closing
                                                handleDeleteSubject(user.id, sub);
                                            }}
                                        >
                                            {sub} <span className="text-red-500 ml-2">(Delete)</span>
                                        </button>
                                    ))}
                                </div>
                                <select
                                    className="w-full p-2 mt-4 border rounded-lg"
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        handleAddSubject(user.id, e.target.value);
                                    }}
                                >
                                    <option value="">Select Subject to Add</option>
                                    {SUBJECTS.filter(sub => !user.subject?.includes(sub)).map((sub) => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>

                                <button
                                    className="w-full mt-4 p-2 bg-red-500 text-white rounded-lg"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteUser(user.id);
                                    }}
                                >
                                    Delete User
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UsersPage;


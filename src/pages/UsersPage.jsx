import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { FiEdit, FiTrash2, FiPlus, FiMinus } from "react-icons/fi";

const SUBJECTS = [
    "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "Pre-Kindergarten", "Kindergarten",
    "6th Grade ELA", "Math 6AB", "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies",
    "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving",
    "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB", "Math 7AB",
    "7th Grade ELA", "Spanish I (Middle School)", "7th Grade Social Studies", "7th Grade Science", "7th Grade Band",
    "7th Grade Computer Science", "7th Grade Creative Problem Solving", "7th Grade Visual Arts", "7th Grade Physical Education",
    "7th Grade Orchestra", "Spanish II (Middle School)", "8th Grade ELA", "8th Grade Social Studies", "8th Grade Science",
    "8th Grade Band", "8th Grade Computer Science", "8th Grade Creative Problem Solving", "8th Grade Visual Arts", 
    "8th Grade Physical Education", "8th Grade Orchestra", "Math 8AB", "Enhanced Algebra: Concepts and Connections",
    "Turkish IV", "Turkish III", "Turkish II", "Turkish I", "Spanish IV", "Spanish III", "Spanish II", "Spanish I",
    "AP Human Geography", "AP Macroeconomics (0.5 credit)", "AP Psychology", "AP U.S. Government and Politics (0.5 credit)",
    "AP U.S. History", "AP World History", "Business Communications (0.5 credit)", "Current Topics",
    "Introduction to Business and Technology", "Investments (0.5 credit)", "Personal Finance and Economics (0.5 credit)",
    "U.S. Constitution and Introduction to Law", "U.S. Government and Politics (0.5 credit)", "U.S. History", "World History",
    "AP Biology", "AP Chemistry", "AP Environmental Science", "AP Physics C", "AP Physics I", "Applied Engineering", "Biology",
    "Chemistry", "Forensics", "Genetics (0.5 credit)", "Human Anatomy & Physiology", "Marine Science", "Molecular Biology (0.5 credit)",
    "Physics I", "AP Computer Science A", "AP Computer Science Principles", "Applied Artificial Intelligence", "Cyber Security",
    "Introduction to Artificial Intelligence", "Advanced Composition", "American Literature", "AP Language and Composition",
    "AP Literature and Composition", "AP Research", "AP Seminar", "British Literature and Composition",
    "Contemporary Literature and Advanced Composition", "Debate and Public Speaking", "Journalism", "Literature and Composition",
    "World Literature", "AP Art and Design", "AP Music Theory", "Band", "Comprehensive Art", "Drama", "Graphics and Design II",
    "Graphics and Design III", "Introduction to Graphics and Design", "Orchestra", "Scientific Illustration",
    "Advanced Algebra: Concepts and Connections", "Algebra: Concepts and Connections", "AP Calculus AB", "AP Calculus BC",
    "AP Precalculus", "AP Statistics", "Discrete Math", "Enhanced Advanced Algebra and AP Precalculus: Concepts and Connections",
    "Geometry: Concepts and Connections", "Multivariable Calculus", "Precalculus", "Statistics", "Health (0.5 credit)",
    "Physical Education (P.E.) (0.5 credit)"
];

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [expandedUser, setExpandedUser] = useState(null);

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

    const handleToggleSubject = async (subject) => {
        if (!expandedUser) return;
        const userRef = doc(db, "users", expandedUser);
        const user = users.find(u => u.id === expandedUser);
        if (!user) return;
        const updatedSubjects = user.subjects?.includes(subject)
            ? user.subjects.filter(sub => sub !== subject)
            : [...(user.subjects || []), subject];
        await updateDoc(userRef, { subjects: updatedSubjects });
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold">Manage Users</h2>
            <table className="w-full mt-4 border">
                <thead>
                    <tr>
                        <th>Role</th>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Subjects</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>Admin</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.subjects?.join(", ") || "No subjects assigned"}</td>
                            <td>
                                <button onClick={() => {
                                    setExpandedUser(user.id);
                                    setIsSubjectModalOpen(true);
                                }}><FiEdit /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isSubjectModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h3 className="text-xl font-bold mb-4">Modify Subjects</h3>
                        {SUBJECTS.map(subject => (
                            <div key={subject}>
                                <input type="checkbox" checked={users.find(u => u.id === expandedUser)?.subjects?.includes(subject) || false}
                                    onChange={() => handleToggleSubject(subject)} /> {subject}
                            </div>
                        ))}
                        <button onClick={() => setIsSubjectModalOpen(false)} className="mt-2 bg-gray-500 text-white px-4 py-2 rounded w-full">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default UsersPage;



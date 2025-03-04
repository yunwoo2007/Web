import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const SUBJECTS = [ "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "Pre-Kindergarten", "Kindergarten", "6th Grade ELA", "Math 6AB", "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies", "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving", "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB", "Math 7AB", "7th Grade ELA", "Spanish I (Middle School)", "7th Grade Social Studies", "7th Grade Science", "7th Grade Band", "7th Grade Computer Science", "7th Grade Creative Problem Solving", "7th Grade Visual Arts", "7th Grade Physical Education", "7th Grade Orchestra", "Spanish II (Middle School)", "8th Grade ELA", "8th Grade Social Studies", "8th Grade Science", "8th Grade Band", "8th Grade Computer Science", "8th Grade Creative Problem Solving", "8th Grade Visual Arts", "8th Grade Physical Education", "8th Grade Orchestra", "Math 8AB", "Enhanced Algebra: Concepts and Connections", "Turkish IV", "Turkish III", "Turkish II", "Turkish I", "Spanish IV", "Spanish III", "Spanish II", "Spanish I", "AP Human Geography", "AP Macroeconomics (0.5 credit)", "AP Psychology", "AP U.S. Government and Politics (0.5 credit)", "AP U.S. History", "AP World History", "Business Communications (0.5 credit)", "Current Topics", "Introduction to Business and Technology", "Investments (0.5 credit)", "Personal Finance and Economics (0.5 credit)", "U.S. Constitution and Introduction to Law", "U.S. Government and Politics (0.5 credit)", "U.S. History", "World History", "AP Biology", "AP Chemistry", "AP Environmental Science", "AP Physics C", "AP Physics I", "Applied Engineering", "Biology", "Chemistry", "Forensics", "Genetics (0.5 credit)", "Human Anatomy & Physiology", "Marine Science", "Molecular Biology (0.5 credit)", "Physics I", "AP Computer Science A", "AP Computer Science Principles", "Applied Artificial Intelligence", "Cyber Security", "Introduction to Artificial Intelligence", "Advanced Composition", "American Literature", "AP Language and Composition", "AP Literature and Composition", "AP Research", "AP Seminar", "British Literature and Composition", "Contemporary Literature and Advanced Composition", "Debate and Public Speaking", "Journalism", "Literature and Composition", "World Literature", "AP Art and Design", "AP Music Theory", "Band", "Comprehensive Art", "Drama", "Graphics and Design II", "Graphics and Design III", "Introduction to Graphics and Design", "Orchestra", "Scientific Illustration", "Advanced Algebra: Concepts and Connections", "Algebra: Concepts and Connections", "AP Calculus AB", "AP Calculus BC", "AP Precalculus", "AP Statistics", "Discrete Math", "Enhanced Advanced Algebra and AP Precalculus: Concepts and Connections", "Geometry: Concepts and Connections", "Multivariable Calculus", "Precalculus", "Statistics", "Health (0.5 credit)", "Physical Education (P.E.) (0.5 credit)" ];

    const [users, setUsers] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);

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

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(error.message);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between w-full max-w-6xl mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manage Users</h2>
                <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                    onClick={() => setIsAddUserModalOpen(true)}
                >
                    + Add User
                </button>
            </div>

            <table className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden border border-red-600">
                <thead className="bg-gray-200 text-gray-700 border-b border-red-600">
                    <tr>
                        <th className="px-4 py-3 border-r border-red-600">Role</th>
                        <th className="px-4 py-3 border-r border-red-600">User Name</th>
                        <th className="px-4 py-3 border-r border-red-600">Email</th>
                        <th className="px-4 py-3 border-r border-red-600">Subjects</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id} className={`border-b border-red-600 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                            <td className="px-4 py-3 border-r border-red-600">Admin</td>
                            <td className="px-4 py-3 border-r border-red-600">{user.name}</td>
                            <td className="px-4 py-3 border-r border-red-600">{user.email}</td>
                            <td className="px-4 py-3 border-r border-red-600">
                                {user.subject?.join(", ") || "No subjects assigned"}
                            </td>
                            <td className="px-4 py-3">
                                <button onClick={() => handleDeleteUser(user.id)} className="mr-2 text-red-600 hover:text-red-800">
                                    <FiTrash2 />
                                </button>
                                <button onClick={() => {
                                    setExpandedUser(user.id);
                                    setIsSubjectModalOpen(true);
                                }}>
                                    <FiEdit className="text-blue-600 hover:text-blue-800" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default UsersPage;


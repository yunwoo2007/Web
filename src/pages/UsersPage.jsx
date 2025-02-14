import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FiEdit } from "react-icons/fi";

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
    const [expandedUser, setExpandedUser] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

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

    const handleAddUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            alert("Please fill all fields!");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
            const userId = userCredential.user.uid;

            await addDoc(collection(db, "users"), {
                id: userId,
                name: newUser.name,
                email: newUser.email,
                subject: []
            });
            setNewUser({ name: "", email: "", password: "" });
            setIsAddUserModalOpen(false);
        } catch (error) {
            console.error("Error adding user:", error);
            alert(error.message);
        }
    };

    const handleToggleSubject = async (userId, subject) => {
        const userRef = doc(db, "users", userId);
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const updatedSubjects = user.subject?.includes(subject)
            ? user.subject.filter(sub => sub !== subject)
            : [...(user.subject || []), subject];

        await updateDoc(userRef, { subject: updatedSubjects });
        setIsSubjectModalOpen(false);
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

            <table className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden border border-gray-300">
                <thead className="bg-gray-200 text-gray-700 border-b border-gray-400">
                    <tr>
                        <th className="px-4 py-3 border-r border-gray-300">Role</th>
                        <th className="px-4 py-3 border-r border-gray-300">User Name</th>
                        <th className="px-4 py-3 border-r border-gray-300">Email</th>
                        <th className="px-4 py-3 border-r border-gray-300">Subjects</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id} className={`border-b ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                            <td className="px-4 py-3 border-r border-gray-300">Admin</td>
                            <td className="px-4 py-3 border-r border-gray-300">{user.name}</td>
                            <td className="px-4 py-3 border-r border-gray-300">{user.email}</td>
                            <td className="px-4 py-3 border-r border-gray-300">
                                {user.subject?.join(", ") || "No subjects assigned"}
                            </td>
                            <td className="px-4 py-3">
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

            {isSubjectModalOpen && expandedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Manage Subjects</h4>
                        <select
                            className="w-full p-2 border border-gray-300 rounded-lg"
                            onChange={(e) => handleToggleSubject(expandedUser, e.target.value)}
                        >
                            <option value="">Select a subject</option>
                            {SUBJECTS.map((sub) => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => setIsSubjectModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default UsersPage;


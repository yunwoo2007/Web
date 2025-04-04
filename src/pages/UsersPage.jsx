import { useEffect, useState, useRef } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from "firebase/auth";
import { FiEdit, FiTrash } from "react-icons/fi";

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
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedUserSubjects, setSelectedUserSubjects] = useState([]);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", subjects: [] });
    const listRef = useRef(null);

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
            await updateProfile(userCredential.user, { displayName: newUser.name });
            const userId = userCredential.user.uid;

            await addDoc(collection(db, "users"), {
                name: newUser.name,
                email: newUser.email,
                uid: userId,
                subjects: newUser.subjects,
            });

            setNewUser({ name: "", email: "", password: "", subjects: [] });
            setIsAddUserModalOpen(false);
        } catch (error) {
            console.error("Error adding user:", error);
            alert("Failed to add user.");
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteDoc(doc(db, "users", userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    };

    const handleEditSubjects = (user) => {
        setExpandedUser(user.id);
        setSelectedUserSubjects(user.subjects || []);
        setIsSubjectModalOpen(true);
    };

    const handleToggleSubject = async (subject) => {
        if (!expandedUser) return;
        const updatedSubjects = selectedUserSubjects.includes(subject)
            ? selectedUserSubjects.filter(sub => sub !== subject)
            : [...selectedUserSubjects, subject];

        setSelectedUserSubjects(updatedSubjects);
        await updateDoc(doc(db, "users", expandedUser), { subjects: updatedSubjects });
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

            <div className="w-full max-w-6xl overflow-y-auto max-h-96 border p-2" ref={listRef}>
                <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-200 text-gray-700 border-b">
                        <tr>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Subjects</th>
                            <th className="px-4 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-b">
                                <td className="px-4 py-3">{user.name}</td>
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3">{user.subjects?.join(", ") || "No subjects assigned"}</td>
                                <td className="px-4 py-3 flex space-x-3">
                                    <button onClick={() => handleEditSubjects(user)} className="text-blue-600 hover:text-blue-800"><FiEdit /></button>
                                    <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800"><FiTrash /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Add New User</h4>
                        <input
                            type="text"
                            placeholder="Name"
                            className="w-full px-3 py-2 border mb-3"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-3 py-2 border mb-3"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full px-3 py-2 border mb-3"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        />
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Select Subjects</h4>
                        <div className="max-h-40 overflow-y-auto border p-2 mb-3">
                            {SUBJECTS.map((subject) => (
                                <label key={subject} className="block">
                                    <input
                                        type="checkbox"
                                        checked={newUser.subjects.includes(subject)}
                                        onChange={() => setNewUser((prev) => ({
                                            ...prev,
                                            subjects: prev.subjects.includes(subject)
                                                ? prev.subjects.filter(sub => sub !== subject)
                                                : [...prev.subjects, subject]
                                        }))}
                                    />{" "}
                                    {subject}
                                </label>
                            ))}
                        </div>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={handleAddUser}>
                            Add User
                        </button>
                        <button className="mt-4 text-red-500" onClick={() => setIsAddUserModalOpen(false)}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {isSubjectModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Edit Subjects</h4>
                        <div className="max-h-40 overflow-y-auto border p-2 mb-3">
                            {SUBJECTS.map((subject) => (
                                <label key={subject} className="block">
                                    <input
                                        type="checkbox"
                                        checked={selectedUserSubjects.includes(subject)}
                                        onChange={() => handleToggleSubject(subject)}
                                    />{" "}
                                    {subject}
                                </label>
                            ))}
                        </div>
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => setIsSubjectModalOpen(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersPage;


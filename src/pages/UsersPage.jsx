import { useEffect, useState, useRef } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword, updateProfile, deleteUser, getAuth } from "firebase/auth";
import { FiEdit, FiTrash, FiUserPlus } from "react-icons/fi";

const SUBJECTS = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "Pre-Kindergarten", "Kindergarten", "6th Grade ELA", "Math 6AB", "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies", "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving", "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB", "Math 7AB", "7th Grade ELA", "Spanish I(Middle School)", "7th Grade Social Studies", "7th Grade Science", "7th Grade Band", "7th Grade Computer Science", "7th Grade Creative Problem Solving", "7th Grade Visual Arts", "7th Grade Physical Education", "7th Grade Orchestra", "Spanish II(Middle School)"];

function UsersPage() {
    const [users, setUsers] = useState(null);
    const [expandedUser, setExpandedUser] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedUserSubjects, setSelectedUserSubjects] = useState([]);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", subjects: [] });
    const listRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            if (!snapshot.empty) {
                const updatedUsers = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setUsers(updatedUsers);
            } else {
                setUsers([]);
            }
        }, (error) => {
            console.error("Firestore error:", error);
            setUsers([]);
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

            await setDoc(doc(db, "users", userId), {
                id: userId,
                name: newUser.name,
                email: newUser.email,
                subjects: newUser.subjects
            });
            setNewUser({ name: "", email: "", password: "", subjects: [] });
            setIsAddUserModalOpen(false);
        } catch (error) {
            console.error("Error adding user:", error);
            alert(error.message);
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await deleteDoc(doc(db, "users", userId));
            const authInstance = getAuth();
            const user = authInstance.currentUser;
            if (user && user.uid === userId) {
                await deleteUser(user);
            }
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
            <div className="w-full max-w-6xl overflow-y-auto max-h-96 border p-2" ref={listRef}>
                {users === null ? (
                    <p className="text-center py-4">Loading users...</p>
                ) : (
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
                            {users.length > 0 ? users.map((user) => (
                                <tr key={user.id} className="border-b">
                                    <td className="px-4 py-3">{user.name}</td>
                                    <td className="px-4 py-3">{user.email}</td>
                                    <td className="px-4 py-3">{Array.isArray(user.subjects) ? user.subjects.join(", ") : "No subjects assigned"}</td>
                                    <td className="px-4 py-3 flex space-x-3">
                                        <button onClick={() => handleEditSubjects(user)} className="text-blue-600 hover:text-blue-800"><FiEdit /></button>
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-800"><FiTrash /></button>
                                    </td>
                                </tr>
                            )) : <tr><td colSpan="4" className="text-center py-4">No users available</td></tr>}
                        </tbody>
                    </table>
                )}
            </div>
            <button className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg" onClick={() => setIsAddUserModalOpen(true)}>
                <FiUserPlus size={24} />
            </button>
        </div>
    );
}

export default UsersPage;

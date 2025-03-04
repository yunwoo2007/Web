import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const auth = getAuth();

const SUBJECTS = ["Math", "Science", "History", "English", "Art", "Music", "Physical Education"];

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", subjects: [] });
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const updatedUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(updatedUsers);
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            const userRecord = auth.currentUser;
            if (userRecord && userRecord.email === userEmail) {
                await deleteUser(userRecord);
            }
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
            alert(error.message);
        }
    };

    const handleAddUser = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
            await addDoc(collection(db, "users"), {
                name: newUser.name,
                email: newUser.email,
                subjects: newUser.subjects,
            });
            setNewUser({ name: "", email: "", password: "", subjects: [] });
            setIsAddUserModalOpen(false);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleUpdateSubjects = async () => {
        if (editingUser) {
            await updateDoc(doc(db, "users", editingUser.id), { subjects: selectedSubjects });
            setIsSubjectModalOpen(false);
            setEditingUser(null);
        }
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between w-full max-w-6xl mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manage Users</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition" onClick={() => setIsAddUserModalOpen(true)}>+ Add User</button>
            </div>

            <table className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden border border-gray-600">
                <thead className="bg-gray-200 text-gray-700 border-b border-gray-600">
                    <tr>
                        <th className="px-4 py-3 border-r border-gray-600">Name</th>
                        <th className="px-4 py-3 border-r border-gray-600">Email</th>
                        <th className="px-4 py-3 border-r border-gray-600">Subjects</th>
                        <th className="px-4 py-3">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id} className={`border-b border-gray-600 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                            <td className="px-4 py-3 border-r border-gray-600">{user.name}</td>
                            <td className="px-4 py-3 border-r border-gray-600">{user.email}</td>
                            <td className="px-4 py-3 border-r border-gray-600">{user.subjects?.join(", ") || "No subjects assigned"}</td>
                            <td className="px-4 py-3">
                                <button onClick={() => handleDeleteUser(user.id, user.email)} className="mr-2 text-red-600 hover:text-red-800">
                                    <FiTrash2 />
                                </button>
                                <button onClick={() => { setEditingUser(user); setSelectedSubjects(user.subjects || []); setIsSubjectModalOpen(true); }}>
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



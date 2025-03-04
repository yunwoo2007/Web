import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const SUBJECTS = [
    "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "Pre-Kindergarten", "Kindergarten",
    "6th Grade ELA", "Math 6AB", "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies",
    "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving",
    "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB", "Math 7AB",
    "7th Grade ELA", "Spanish I(Middle School)", "7th Grade Social Studies", "7th Grade Science", "7th Grade Band",
    "7th Grade Computer Science", "7th Grade Creative Problem Solving", "7th Grade Visual Arts", "7th Grade Physical Education",
    "7th Grade Orchestra", "Spanish II(Middle School)"
];

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [expandedUser, setExpandedUser] = useState(null);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
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
                subject: selectedSubjects,
            });
            setNewUser({ name: "", email: "", password: "" });
            setIsAddUserModalOpen(false);
        } catch (error) {
            console.error("Error adding user:", error);
            alert(error.message);
        }
    };

    const handleDeleteUser = async (userId, email) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            const userToDelete = auth.currentUser;
            if (userToDelete) await deleteUser(userToDelete);
        } catch (error) {
            console.error("Error deleting user:", error);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-3xl font-bold">Manage Users</h2>
            <button onClick={() => setIsAddUserModalOpen(true)} className="bg-blue-500 text-white px-4 py-2 mt-4 rounded">+ Add User</button>
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
                            <td>{user.subject?.join(", ") || "No subjects assigned"}</td>
                            <td>
                                <button onClick={() => setExpandedUser(user.id)}><FiEdit /></button>
                                <button onClick={() => handleDeleteUser(user.id, user.email)}><FiTrash2 /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default UsersPage;


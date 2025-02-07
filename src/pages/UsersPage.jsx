import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword } from "firebase/auth";

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

    const handleAddSubject = async (userId, subject) => {
        if (!subject) return;
        const userRef = doc(db, "users", userId);
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const updatedSubjects = user.subject ? [...user.subject, subject] : [subject];
        await updateDoc(userRef, { subject: updatedSubjects });
    };

    return (
        <div className="flex flex-col items-center p-6">
            <div className="flex justify-between w-full max-w-4xl mb-6">
                <h2 className="text-2xl font-bold">Teachers</h2>
                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    onClick={() => setIsAddUserModalOpen(true)}
                >
                    Add User
                </button>
            </div>

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
                                        <span
                                            key={sub}
                                            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded-lg"
                                        >
                                            {sub}
                                        </span>
                                    ))}
                                </div>
                                <select
                                    className="w-full p-2 mt-4 border rounded-lg"
                                    onChange={(e) => handleAddSubject(user.id, e.target.value)}
                                >
                                    <option value="">Select Subject to Add</option>
                                    {SUBJECTS.filter(sub => !user.subject?.includes(sub)).map((sub) => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UsersPage;


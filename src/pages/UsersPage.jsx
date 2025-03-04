import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FiEdit } from "react-icons/fi";

const SUBJECTS = [
    "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "Pre-Kindergarten", "Kindergarten",
    "6th Grade ELA", "Math 6AB", "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies",
    "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving",
    "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB", "Math 7AB",
    "7th Grade ELA", "Spanish I(Middle School)", "7th Grade Social Studies", "7th Grade Science", "7th Grade Band",
    "7th Grade Computer Science", "7th Grade Creative Problem Solving", "7th Grade Visual Arts",
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

    const handleToggleSubject = async (subject) => {
        if (!expandedUser) return;

        const userRef = doc(db, "users", expandedUser);
        const user = users.find(u => u.id === expandedUser);
        if (!user) return;

        let updatedSubjects = user.subject || [];
        if (updatedSubjects.includes(subject)) {
            updatedSubjects = updatedSubjects.filter(sub => sub !== subject);
        } else {
            updatedSubjects = Array.from(new Set([...updatedSubjects, subject]));
        }

        await updateDoc(userRef, { subject: updatedSubjects });
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800">Manage Users</h2>
            <button className="bg-blue-600 text-white px-5 py-2 rounded-lg" onClick={() => setIsAddUserModalOpen(true)}>
                + Add User
            </button>

            {isSubjectModalOpen && expandedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Manage Subjects</h4>
                        <div className="max-h-60 overflow-y-auto">
                            {SUBJECTS.map((sub) => (
                                <label key={sub} className="block py-1">
                                    <input
                                        type="checkbox"
                                        checked={users.find(u => u.id === expandedUser)?.subject?.includes(sub) || false}
                                        onChange={() => handleToggleSubject(sub)}
                                    />
                                    {" "}{sub}
                                </label>
                            ))}
                        </div>
                        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => setIsSubjectModalOpen(false)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersPage;


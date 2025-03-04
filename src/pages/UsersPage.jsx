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
        } catch (error) {
            console.error("Error adding user:", error);
            alert(error.message);
        }
    };

    const handleToggleNewUserSubject = (subject) => {
        setNewUser((prev) => ({
            ...prev,
            subjects: prev.subjects.includes(subject)
                ? prev.subjects.filter(sub => sub !== subject)
                : [...prev.subjects, subject]
        }));
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <div className="mb-4 p-4 bg-white shadow-md rounded-lg">
                <h2 className="text-lg font-semibold">Add New User</h2>
                <input type="text" placeholder="Name" className="w-full px-3 py-2 border mb-3" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                <input type="email" placeholder="Email" className="w-full px-3 py-2 border mb-3" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                <input type="password" placeholder="Password" className="w-full px-3 py-2 border mb-3" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
                <div className="max-h-40 overflow-y-auto border p-2 mb-3">
                    {SUBJECTS.map((subject) => (
                        <label key={subject} className="block">
                            <input
                                type="checkbox"
                                checked={newUser.subjects.includes(subject)}
                                onChange={() => handleToggleNewUserSubject(subject)}
                            /> {subject}
                        </label>
                    ))}
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={handleAddUser}>Add User</button>
            </div>
        </div>
    );
}

export default UsersPage;


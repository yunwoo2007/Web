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
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", subjects: [] });

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
                subjects: newUser.subjects,
            });
            setNewUser({ name: "", email: "", password: "", subjects: [] });
            setIsAddUserModalOpen(false);
        } catch (error) {
            console.error("Error adding user:", error);
            alert(error.message);
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
                    </tr>
                </thead>
                <tbody>
                    {users.map((user) => (
                        <tr key={user.id}>
                            <td>Admin</td>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>{user.subjects?.join(", ") || "No subjects assigned"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {isAddUserModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded shadow-md w-96">
                        <h3 className="text-xl font-bold mb-4">Add New User</h3>
                        <input type="text" placeholder="Enter your name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full mb-2 p-2 border rounded" />
                        <input type="email" placeholder="Enter your email address" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full mb-2 p-2 border rounded" />
                        <input type="password" placeholder="Enter your password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full mb-2 p-2 border rounded" />
                        {SUBJECTS.map(subject => (
                            <div key={subject}>
                                <input type="checkbox" value={subject} onChange={(e) => {
                                    const updatedSubjects = e.target.checked ? [...newUser.subjects, subject] : newUser.subjects.filter(s => s !== subject);
                                    setNewUser({ ...newUser, subjects: updatedSubjects });
                                }} /> {subject}
                            </div>
                        ))}
                        <button onClick={handleAddUser} className="bg-blue-600 text-white px-4 py-2 rounded w-full">Submit</button>
                    </div>
                </div>
            )}
        </div>
    );
}
export default UsersPage;



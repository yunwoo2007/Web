import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth, createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";
import { FiEdit, FiTrash2 } from "react-icons/fi";

const SUBJECTS = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "Pre-Kindergarten", "Kindergarten", "6th Grade ELA", "Math 6AB", "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies", "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving", "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB", "Math 7AB", "7th Grade ELA", "Spanish I (Middle School)", "7th Grade Social Studies", "7th Grade Science", "7th Grade Band", "7th Grade Computer Science", "7th Grade Creative Problem Solving", "7th Grade Visual Arts", "7th Grade Physical Education", "7th Grade Orchestra", "Spanish II (Middle School)", "8th Grade ELA", "8th Grade Social Studies", "8th Grade Science", "8th Grade Band", "8th Grade Computer Science", "8th Grade Creative Problem Solving", "8th Grade Visual Arts", "8th Grade Physical Education", "8th Grade Orchestra", "Math 8AB", "Enhanced Algebra: Concepts and Connections", "AP Biology", "AP Chemistry"];

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [expandedUser, setExpandedUser] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", subjects: [] });
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const authInstance = getAuth();

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const updatedUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            setUsers(updatedUsers);
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm("정말로 이 사용자를 삭제하시겠습니까?")) return;
        try {
            await deleteDoc(doc(db, "users", userId));
            const userRecord = authInstance.currentUser;
            if (userRecord && userRecord.email === userEmail) {
                await deleteUser(userRecord);
            }
            setUsers(users.filter(user => user.id !== userId));
        } catch (error) {
            console.error("사용자 삭제 오류:", error);
            alert(error.message);
        }
    };

    const handleAddUser = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(authInstance, newUser.email, newUser.password);
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

    const handleUpdateSubjects = async (userId) => {
        await updateDoc(doc(db, "users", userId), { subjects: selectedSubjects });
        setIsSubjectModalOpen(false);
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between w-full max-w-6xl mb-6">
                <h2 className="text-3xl font-bold text-gray-800">사용자 관리</h2>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow-md transition" onClick={() => setIsAddUserModalOpen(true)}>+ 사용자 추가</button>
            </div>

            <table className="w-full max-w-6xl bg-white shadow-md rounded-lg overflow-hidden border border-red-600">
                <thead className="bg-gray-200 text-gray-700 border-b border-red-600">
                    <tr>
                        <th className="px-4 py-3 border-r border-red-600">역할</th>
                        <th className="px-4 py-3 border-r border-red-600">사용자 이름</th>
                        <th className="px-4 py-3 border-r border-red-600">이메일</th>
                        <th className="px-4 py-3 border-r border-red-600">과목</th>
                        <th className="px-4 py-3">작업</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr key={user.id} className={`border-b border-red-600 ${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}`}>
                            <td className="px-4 py-3 border-r border-red-600">관리자</td>
                            <td className="px-4 py-3 border-r border-red-600">{user.name}</td>
                            <td className="px-4 py-3 border-r border-red-600">{user.email}</td>
                            <td className="px-4 py-3 border-r border-red-600">{user.subjects?.join(", ") || "과목 미지정"}</td>
                            <td className="px-4 py-3">
                                <button onClick={() => handleDeleteUser(user.id, user.email)} className="mr-2 text-red-600 hover:text-red-800">
                                    <FiTrash2 />
                                </button>
                                <button onClick={() => { setExpandedUser(user.id); setSelectedSubjects(user.subjects || []); setIsSubjectModalOpen(true); }}>
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


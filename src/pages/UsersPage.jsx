import { useEffect, useState } from "react";
import { getAllUsers, updateUser } from "../utils/firebase_auth";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, doc } from "firebase/firestore";

// 전체 과목 리스트 (드롭다운에서 사용)
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState("");
    const [subjectToDelete, setSubjectToDelete] = useState("");

    // Firestore 실시간 구독
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const updatedUsers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(updatedUsers);
        });

        return () => unsubscribe(); // Cleanup
    }, []);

    // 선택된 과목 삭제
    const handleDeleteSubject = async () => {
        if (!selectedUser || !subjectToDelete) return;
        
        const updatedSubjects = selectedUser.subject.filter(sub => sub !== subjectToDelete);
        await updateUser(selectedUser.id, { ...selectedUser, subject: updatedSubjects });
        
        setSubjectToDelete(""); // 삭제 후 초기화
    };

    // 새로운 과목 추가
    const handleAddSubject = async () => {
        if (!selectedUser || !selectedSubject) return;
        
        const updatedSubjects = [...selectedUser.subject, selectedSubject];
        await updateUser(selectedUser.id, { ...selectedUser, subject: updatedSubjects });

        setSelectedSubject(""); // 추가 후 초기화
    };

    return (
        <div className="flex flex-col items-center p-6">
            <h2 className="text-2xl font-bold mb-6">Teachers</h2>
            
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6">
                {users.map((user) => (
                    <div 
                        key={user.id} 
                        className="bg-white shadow-lg rounded-lg p-6 border"
                        onClick={() => setSelectedUser(user)}
                    >
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-gray-600">ID: {user.id}</p>
                        <p className="text-gray-600">Email: {user.email}</p>

                        <h4 className="mt-4 font-semibold">Subjects:</h4>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {user.subject.map((sub) => (
                                <button
                                    key={sub}
                                    className={`px-3 py-1 text-sm rounded-lg ${
                                        subjectToDelete === sub ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700"
                                    }`}
                                    onClick={() => setSubjectToDelete(sub)}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>

                        {/* 삭제 확인 버튼 (클릭한 과목만 삭제) */}
                        {subjectToDelete && selectedUser?.id === user.id && (
                            <button 
                                onClick={handleDeleteSubject} 
                                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                            >
                                삭제 확인
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* 과목 추가 UI */}
            {selectedUser && (
                <div className="mt-8 w-full max-w-2xl bg-white p-6 shadow-lg rounded-lg border">
                    <h3 className="text-lg font-semibold text-center">{selectedUser.name}의 과목 추가</h3>

                    {/* 선택 가능한 과목 리스트 (이미 추가된 과목은 제외) */}
                    <select
                        className="w-full p-2 mt-4 border rounded-lg"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                        <option value="">추가할 과목 선택</option>
                        {SUBJECTS.filter(sub => !selectedUser.subject.includes(sub)).map((sub) => (
                            <option key={sub} value={sub}>{sub}</option>
                        ))}
                    </select>

                    {/* 추가 버튼 */}
                    <button 
                        onClick={handleAddSubject} 
                        className="w-full mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        과목 추가
                    </button>
                </div>
            )}
        </div>
    );
}

export default UsersPage;


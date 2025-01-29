import { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUser } from "../utils/firebase_auth";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, doc } from "firebase/firestore";

function UsersPage() {
    const [users, setUsers] = useState([]);

    // Firestore 실시간 데이터 동기화
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

    // 사용자 삭제
    const handleDelete = async (id) => {
        await deleteUser(id);
    };

    // 사용자 이름 수정
    const handleNameChange = async (id, newName) => {
        const updatedUser = users.find(user => user.id === id);
        if (!updatedUser) return;

        await updateUser(id, { ...updatedUser, name: newName });
    };

    // 과목 추가
    const handleAddSubject = async (id, newSubject) => {
        const user = users.find(user => user.id === id);
        if (!user) return;

        const updatedSubjects = [...user.subject, newSubject];
        await updateUser(id, { ...user, subject: updatedSubjects });
    };

    return (
        <div style={{ textAlign: "center" }}>
            <h2>Teachers</h2>
            
            <div style={{ width: "1000px", display: "flex", flexDirection: "row", flexWrap: "wrap", margin: "0 auto" }}>
                {users.map((user) => (
                    <div key={user.id} className="teacher-card">
                        <h3>Teacher Information</h3>
                        <p>ID: <strong>{user.id}</strong></p>

                        {/* 이름 변경 */}
                        <input
                            type="text"
                            value={user.name}
                            onChange={(e) => handleNameChange(user.id, e.target.value)}
                        />

                        <p>Subject: <strong>{user.subject.join(", ")}</strong></p>

                        {/* 과목 추가 */}
                        <input
                            type="text"
                            placeholder="Add Subject"
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && e.target.value.trim()) {
                                    handleAddSubject(user.id, e.target.value.trim());
                                    e.target.value = "";
                                }
                            }}
                        />

                        {/* 사용자 삭제 버튼 */}
                        <button onClick={() => handleDelete(user.id)}>Delete</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default UsersPage;

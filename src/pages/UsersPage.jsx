import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { FiEdit } from "react-icons/fi";

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

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", subjects: [] });
  const [editingUser, setEditingUser] = useState(null);

  // 유저 목록 실시간 가져오기
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  // 유저 추가
  const handleAddUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const uid = userCredential.user.uid;
      await addDoc(collection(db, "users"), {
        uid,
        name: newUser.name,
        email: newUser.email,
        subjects: newUser.subjects,
      });
      setNewUser({ name: "", email: "", password: "", subjects: [] });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  // 유저 삭제
  const handleDeleteUser = async (userId, uid) => {
    try {
      await deleteDoc(doc(db, "users", userId));
      const user = auth.currentUser;
      if (user && user.uid === uid) {
        await deleteUser(user);
      }
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  // 과목 수정
  const handleUpdateSubjects = async (userId, updatedSubjects) => {
    try {
      await updateDoc(doc(db, "users", userId), { subjects: updatedSubjects });
    } catch (error) {
      console.error("Error updating subjects:", error);
    }
  };

  return (
    <div>
      <h1>Admin Page</h1>
      <div>
        <h2>Add User</h2>
        <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
        <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
        <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
        <button onClick={handleAddUser}>Add</button>
      </div>
      <div>
        <h2>User List</h2>
        {users.map((user) => (
          <div key={user.id}>
            <p>{user.name} ({user.email})</p>
            <button onClick={() => handleDeleteUser(user.id, user.uid)}>🗑 Delete</button>
            <button onClick={() => setEditingUser(user)}><FiEdit /></button>
          </div>
        ))}
      </div>
      {editingUser && (
        <div>
          <h2>Edit Subjects for {editingUser.name}</h2>
          {SUBJECTS.map((subject) => (
            <label key={subject}>
              <input
                type="checkbox"
                checked={editingUser.subjects.includes(subject)}
                onChange={(e) => {
                  const updatedSubjects = e.target.checked
                    ? [...editingUser.subjects, subject]
                    : editingUser.subjects.filter((s) => s !== subject);
                  setEditingUser({ ...editingUser, subjects: updatedSubjects });
                  handleUpdateSubjects(editingUser.id, updatedSubjects);
                }}
              />
              {subject}
            </label>
          ))}
          <button onClick={() => setEditingUser(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;




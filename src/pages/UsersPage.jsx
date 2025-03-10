import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";
import { FiEdit } from "react-icons/fi";

const SUBJECTS = [
  "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "Pre-Kindergarten", "Kindergarten",
  "6th Grade ELA", "Math 6AB", "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies",
  "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving",
  "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB", "Math 7AB",
  "7th Grade ELA", "Spanish I(Middle School)", "7th Grade Social Studies", "7th Grade Science", "7th Grade Band",
  "7th Grade Computer Science", "7th Grade Creative Problem Solving", "7th Grade Visual Arts", "7th Grade Physical Education",
  "7th Grade Orchestra", "Spanish II(Middle School)"
];

const LEVELS = {
  "Elementary School": SUBJECTS.slice(0, 7),
  "Middle School": SUBJECTS.slice(7, SUBJECTS.length),
  "High School": [] // Currently empty
};

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", subject: [] });
  const [editingUser, setEditingUser] = useState(null);
  const [updatedSubjects, setUpdatedSubjects] = useState([]);
  const [openLevel, setOpenLevel] = useState(null);
  const firebaseAuth = getAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleAddUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, newUser.email, newUser.password);
      const uid = userCredential.user.uid;

      await addDoc(collection(db, "users"), {
        uid,
        name: newUser.name,
        email: newUser.email,
        subject: newUser.subject,
      });

      setNewUser({ name: "", email: "", password: "", subject: [] });
    } catch (error) {
      console.error("Error adding user:", error);
    }
  };

  const handleDeleteUser = async (userId, uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      const userToDelete = auth.currentUser;
      if (userToDelete && userToDelete.uid === uid) {
        await deleteUser(userToDelete);
      }
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleToggleLevel = (level) => {
    setOpenLevel(openLevel === level ? null : level);
  };

  const handleCheckboxChange = (subject, checked) => {
    setUpdatedSubjects((prev) => checked ? [...prev, subject] : prev.filter((s) => s !== subject));
  };

  const handleSaveSubjects = async () => {
    if (editingUser) {
      try {
        await updateDoc(doc(db, "users", editingUser.id), { subject: updatedSubjects });
        setEditingUser(null);
      } catch (error) {
        console.error("Error updating subjects:", error);
      }
    }
  };

  return (
    <div>
      <h1>Admin Page</h1>
      <h2>Add User</h2>
      <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
      <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
      <input type="password" placeholder="Password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} />
      <button onClick={handleAddUser}>Add</button>

      <h2>User List</h2>
      {users.map((user) => (
        <div key={user.id} style={{ padding: "10px", border: "1px solid gray", margin: "5px" }}>
          <p>{user.name} ({user.email})</p>
          <button onClick={() => handleDeleteUser(user.id, user.uid)}>🗑 Delete</button>
          <button onClick={() => {
            setEditingUser(user);
            setUpdatedSubjects(user.subject || []);
          }}>
            <FiEdit />
          </button>
        </div>
      ))}

      {editingUser && (
        <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginTop: "20px" }}>
          <h2>Edit Subjects for {editingUser.name}</h2>
          {Object.keys(LEVELS).map((level) => (
            <div key={level}>
              <button onClick={() => handleToggleLevel(level)}>{level}</button>
              {openLevel === level && (
                <div style={{ marginTop: "10px" }}>
                  {LEVELS[level].map((subject) => (
                    <label key={subject} style={{ display: "block" }}>
                      <input
                        type="checkbox"
                        checked={updatedSubjects.includes(subject)}
                        onChange={(e) => handleCheckboxChange(subject, e.target.checked)}
                      />
                      {subject}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button onClick={handleSaveSubjects}>Save Subjects</button>
          <button onClick={() => setEditingUser(null)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default AdminPage;



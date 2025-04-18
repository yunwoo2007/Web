import React, { useRef, useEffect, useState } from "react";
import Papa from "papaparse";
import { db } from "../utils/firebase_store";
import {
  collection, onSnapshot, deleteDoc, doc,
  addDoc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const VALID_SUBJECTS = [
  "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
  "Pre-Kindergarten", "Kindergarten", "6th Grade ELA", "Math 6AB",
  "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies", "6th Grade Science",
  "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving",
  "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra",
  "Math 6B/7AB", "Math 7AB", "7th Grade ELA", "Spanish I(Middle School)", "7th Grade Social Studies",
  "7th Grade Science", "7th Grade Band", "7th Grade Computer Science", "7th Grade Creative Problem Solving",
  "7th Grade Visual Arts", "7th Grade Physical Education", "7th Grade Orchestra", "Spanish II(Middle School)", "8th Grade ELA"
];

const validateSubjects = (subjectsString) => {
  const subjectsArray = subjectsString.split(",").map(subject => subject.trim());
  return subjectsArray.every(subj => VALID_SUBJECTS.includes(subj));
};

const modalStyle = {
  position: 'fixed',
  top: '0',
  left: '0',
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const modalContentStyle = {
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  width: '400px',
};

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "FSA123", role: "" });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const firebaseAuth = getAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase();
    const results = users.filter(user =>
      user.firstName?.toLowerCase().includes(lowerCaseQuery) ||
      user.lastName?.toLowerCase().includes(lowerCaseQuery) ||
      user.email?.toLowerCase().includes(lowerCaseQuery)
    );
    setFilteredUsers(results);
  }, [searchQuery, users]);

  const handleCSVUpload = async (e) => {
  const file = e.target.files[0];
  if (!file || !file.name.endsWith(".csv")) {
    alert("Only CSV files are allowed.");
    return;
  }

  Papa.parse(file, {
    complete: async (results) => {
      const rows = results.data.filter(row => row.length >= 5);
      let validRows = [];

      for (let i = 0; i < rows.length; i++) {
        const [firstName, lastName, email, role, subjectStr] = rows[i].map(v => v?.trim());

        if (!firstName || !lastName || !email || !role || !subjectStr) {
          console.warn(`Row ${i + 1}: Missing field(s). Skipping.`);
          continue;
        }

        if (!/^[^\s@]+@gmail\.com$/.test(email)) {
          console.warn(`Row ${i + 1}: Invalid email. Skipping.`);
          continue;
        }

        if (!["Teacher", "Admin"].includes(role)) {
          console.warn(`Row ${i + 1}: Invalid role. Skipping.`);
          continue;
        }

        const subjectList = subjectStr.split(",").map(s => s.trim());
        const isValidSubject = subjectList.every(subj => VALID_SUBJECTS.includes(subj));

        if (!isValidSubject) {
          console.warn(`Row ${i + 1}: Invalid subject(s): [${subjectList.join(", ")}]. Skipping.`);
          continue;
        }

        validRows.push({ firstName, lastName, email, role, subjectList });
      }

      if (validRows.length === 0) {
        alert("❌ No valid rows to upload.");
        return;
      }

      for (let user of validRows) {
        const { firstName, lastName, email, role, subjectList } = user;
        const password = "FSA123";

        try {
          const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
          await addDoc(collection(db, "users"), {
            uid: userCredential.user.uid,
            firstName,
            lastName,
            email,
            password,
            subject: subjectList,
            role: role.toLowerCase(),
            authProvider: "admin",
            createdAt: serverTimestamp()
          });
        } catch (error) {
          console.error(`Error adding ${email}:`, error.message);
        }
      }

      alert(`✅ ${validRows.length} users successfully uploaded.`);
    },
    error: (err) => alert("Error parsing CSV file: " + err.message),
  });
};


  const handleAddUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(firebaseAuth, newUser.email, newUser.password);
      const uid = userCredential.user.uid;
      await addDoc(collection(db, "users"), {
        uid,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        subject: newUser.role === "admin" ? ["Full Drive"] : [],
        role: newUser.role || 'teacher',
        authProvider: "admin",
        createdAt: serverTimestamp(),
        gradeLevel: "",
        courseCategory: "",
      });
      setIsAddModalOpen(false);
    } catch (error) {
      alert("Error adding user: " + error.message);
    }
  };

  const handleSaveUser = async () => {
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        role: updatedUser.role,
      });
      setIsModalOpen(false);
    } catch (error) {
      alert("Error saving user: " + error.message);
    }
  };

  return (
    <div>
      <h1>Admin Page</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search users by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '300px' }}
        />
        <button onClick={() => setIsAddModalOpen(true)}>Add User</button>
        <button onClick={() => fileInputRef.current.click()}>CSV Bulk Upload</button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="modal" style={modalStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <h2>Add New User</h2>
            <input type="text" placeholder="First Name" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
            <input type="text" placeholder="Last Name" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
            <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="">Select Role</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleAddUser}>Add</button>
            <button onClick={() => setIsAddModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isModalOpen && (
        <div className="modal" style={modalStyle}>
          <div className="modal-content" style={modalContentStyle}>
            <h2>Edit User</h2>
            <input type="text" value={updatedUser.firstName} onChange={(e) => setUpdatedUser({ ...updatedUser, firstName: e.target.value })} />
            <input type="text" value={updatedUser.lastName} onChange={(e) => setUpdatedUser({ ...updatedUser, lastName: e.target.value })} />
            <input type="email" value={updatedUser.email} onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })} />
            <select value={updatedUser.role} onChange={(e) => setUpdatedUser({ ...updatedUser, role: e.target.value })}>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleSaveUser}>Save</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* User Table */}
      <table border="1" width="100%" style={{ borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>First Name</th>
            <th style={{ textAlign: 'center' }}>Last Name</th>
            <th style={{ textAlign: 'center' }}>Email</th>
            <th style={{ textAlign: 'center' }}>Role</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName || 'N/A'}</td>
              <td>{user.lastName || 'N/A'}</td>
              <td>{user.email || 'N/A'}</td>
              <td>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}</td>
              <td>
                <button onClick={() => {
                  setEditingUser(user);
                  setUpdatedUser(user);
                  setIsModalOpen(true);
                }}>Edit</button>
                <button onClick={async () => {
                  await updateDoc(doc(db, "users", user.id), { password: "FSA123" });
                  alert("Password has been reset to default (FSA123)");
                }}>Reset Password</button>
                <button onClick={async () => {
                  if (window.confirm("Are you sure you want to delete this user?")) {
                    await deleteDoc(doc(db, "users", user.id));
                    alert("User deleted from Firestore.");
                  }
                }} style={{ color: 'red' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;


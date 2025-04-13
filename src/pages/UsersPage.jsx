import React, { useRef, useEffect, useState } from "react";
import Papa from "papaparse";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword, deleteUser, getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      (user.firstName?.toLowerCase().includes(lowerCaseQuery) ||
        user.lastName?.toLowerCase().includes(lowerCaseQuery) ||
        user.email?.toLowerCase().includes(lowerCaseQuery))
    );
    setFilteredUsers(results);
  }, [searchQuery, users]);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.name.endsWith(".csv")) {
      alert("Only CSV files are allowed.");
      return;
    }

    Papa.parse(file, {
      complete: async function (results) {
        const rows = results.data.filter(row => row.length >= 4);

        for (let i = 0; i < rows.length; i++) {
          const [firstName, lastName, email, role] = rows[i].map(v => v?.trim());

          if (!firstName || !lastName || !email || !role) {
            alert(`Row ${i + 1}: All fields (first name, last name, email, role) are required.`);
            return;
          }

          if (!/^[^\s@]+@gmail\.com$/.test(email)) {
            alert(`Row ${i + 1}: Invalid email format. Must end with @gmail.com.`);
            return;
          }

          if (!["Teacher", "Admin"].includes(role)) {
            alert(`Row ${i + 1}: Role must be either 'Teacher' or 'Admin'.`);
            return;
          }
        }

        for (let i = 0; i < rows.length; i++) {
          const [firstName, lastName, email, role] = rows[i].map(v => v.trim());
          const password = "FSA123";
          try {
            const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
            const uid = userCredential.user.uid;

            await addDoc(collection(db, "users"), {
              uid,
              firstName,
              lastName,
              email,
              password,
              subject: role === "Admin" ? ["Full Drive"] : [],
              role: role.toLowerCase(),
              authProvider: "admin",
              createdAt: serverTimestamp(),
              gradeLevel: "",
              courseCategory: "",
            });
          } catch (error) {
            console.error(`❌ Error processing ${email}:`, error.message);
            alert(`Error adding ${email}: ${error.message}`);
          }
        }
        alert("✅ All users uploaded successfully.");
      },
      error: (err) => {
        alert("Error parsing CSV file: " + err.message);
      },
    });
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div>
      <h1>Admin Page</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search users by name or email"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '300px' }}
        />
        <button onClick={() => fileInputRef.current.click()}>CSV Bulk Upload</button>
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          style={{ display: "none" }}
          onChange={handleCSVUpload}
        />
      </div>

      <table border="1" width="100%" style={{ borderCollapse: "collapse", textAlign: "left" }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'center' }}>First Name</th>
            <th style={{ textAlign: 'center' }}>Last Name</th>
            <th style={{ textAlign: 'center' }}>Email</th>
            <th style={{ textAlign: 'center' }}>Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName || 'N/A'}</td>
              <td>{user.lastName || 'N/A'}</td>
              <td>{user.email || 'N/A'}</td>
              <td>{user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;

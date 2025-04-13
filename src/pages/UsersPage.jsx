import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import {
  collection, onSnapshot, addDoc, serverTimestamp
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword, getAuth
} from "firebase/auth";
import dynamic from 'next/dynamic';

// Dynamically import papaparse for SSR compatibility
const Papa = dynamic(() => import('papaparse'), { ssr: false });

const AdminPageWithCSVUpload = () => {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const firebaseAuth = getAuth();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const allUsers = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(allUsers);
    });
    return () => unsubscribe();
  }, []);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "text/csv") {
      alert("Only CSV files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async ({ target }) => {
      const csv = target.result;
      const { data: rows } = Papa.parse(csv.trim(), { skipEmptyLines: true });

      let errorMessages = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (row.length !== 4) {
          errorMessages.push(`Row ${i + 1}: Invalid number of columns.`);
          continue;
        }
        const [firstName, lastName, email, role] = row.map(cell => cell?.trim());
        if (!firstName || !lastName || !email || !role) {
          errorMessages.push(`Row ${i + 1}: One or more fields are empty.`);
          continue;
        }
        if (!/^[\w.-]+@gmail\.com$/.test(email)) {
          errorMessages.push(`Row ${i + 1}: Invalid email format. Only @gmail.com allowed.`);
          continue;
        }
        if (role !== 'Teacher' && role !== 'Admin') {
          errorMessages.push(`Row ${i + 1}: Role must be either 'Teacher' or 'Admin'.`);
          continue;
        }
        try {
          const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, "FSA123");
          const uid = userCredential.user.uid;
          await addDoc(collection(db, "users"), {
            uid,
            firstName,
            lastName,
            email,
            password: "FSA123",
            subject: role === 'Admin' ? ["Full Drive"] : [],
            role,
            authProvider: "admin",
            createdAt: serverTimestamp(),
            gradeLevel: "",
            courseCategory: "",
          });
        } catch (err) {
          errorMessages.push(`Row ${i + 1}: Firebase Auth creation failed - ${err.message}`);
        }
      }

      if (errorMessages.length > 0) {
        alert("Errors occurred during upload:\n" + errorMessages.join("\n"));
      } else {
        alert("All users uploaded successfully.");
      }
    };
    reader.readAsText(file);
  };

  const filteredUsers = users.filter(user =>
    user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ padding: '20px' }}>
      <h1>Admin Page - CSV Upload</h1>
      <input
        type="text"
        placeholder="Search users by name or email"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ padding: '8px', marginRight: '15px' }}
      />
      <label style={{ backgroundColor: '#eee', padding: '8px', borderRadius: '5px', cursor: 'pointer' }}>
        Upload CSV
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          style={{ display: 'none' }}
        />
      </label>
      <table border="1" cellPadding="8" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPageWithCSVUpload;

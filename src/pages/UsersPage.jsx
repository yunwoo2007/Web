import React, { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import {
  collection, onSnapshot, deleteDoc, doc, addDoc, updateDoc, serverTimestamp
} from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import {
  createUserWithEmailAndPassword, deleteUser, getAuth
} from "firebase/auth";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { driveLink } from "../utils/f_config";
import { useNavigate } from "react-router-dom";
import Papa from "papaparse";

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const firebaseAuth = getAuth();
  const navigate = useNavigate();

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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file || file.type !== "text/csv") {
      alert("CSV 파일만 업로드 가능합니다.");
      return;
    }
    Papa.parse(file, {
      complete: async function(results) {
        const rows = results.data;
        let errorMessages = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (row.length !== 4) {
            errorMessages.push(`${i + 1}번째 행: 컬럼 수가 올바르지 않습니다.`);
            continue;
          }
          const [firstName, lastName, email, role] = row.map(cell => cell?.trim());
          if (!firstName || !lastName || !email || !role) {
            errorMessages.push(`${i + 1}번째 행: 빈 칸이 존재합니다.`);
            continue;
          }
          if (!/^[\w.-]+@gmail\.com$/.test(email)) {
            errorMessages.push(`${i + 1}번째 행: 이메일 형식이 올바르지 않습니다.`);
            continue;
          }
          if (role !== 'Teacher' && role !== 'Admin') {
            errorMessages.push(`${i + 1}번째 행: role은 Teacher 또는 Admin이어야 합니다.`);
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
            errorMessages.push(`${i + 1}번째 행: Firebase 사용자 생성 실패 - ${err.message}`);
          }
        }

        if (errorMessages.length > 0) {
          alert("업로드 중 다음과 같은 오류가 발생했습니다:\n" + errorMessages.join("\n"));
        } else {
          alert("모든 유저가 성공적으로 업로드되었습니다.");
        }
      }
    });
  };

  return (
    <div>
      <h1>Admin Page</h1>
      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="Search users by name or email"
          value={searchQuery}
          onChange={handleSearchChange}
          style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc', width: '300px' }}
        />
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVUpload}
          style={{ marginLeft: '20px' }}
        />
      </div>

      <h2>User List</h2>
      <table border="1" width="100%" style={{ borderCollapse: "collapse", textAlign: "left" }}>
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
              <td>{user.firstName || 'N/A'}</td>
              <td>{user.lastName || 'N/A'}</td>
              <td>{user.email || 'N/A'}</td>
              <td>{user.role || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPage;


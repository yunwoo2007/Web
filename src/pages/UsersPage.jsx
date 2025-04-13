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

const SUBJECTS = {
  "Elementary School": [
    "1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade",
    "Kindergarten", "Pre-Kindergarten"
  ].sort(),
  "Middle School": [
    "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving",
    "6th Grade ELA", "6th Grade Physical Education", "6th Grade Science",
    "6th Grade Social Studies", "6th Grade Visual Arts", "Introduction to World Languages",
    "Math 6AB", "Math 6B/7AB", "Math 7AB", "Math 8AB", "Spanish 6", "Spanish I",
    "Spanish II", "7th Grade Band", "7th Grade Computer Science",
    "7th Grade Creative Problem Solving", "7th Grade ELA", "7th Grade Orchestra",
    "7th Grade Physical Education", "7th Grade Science", "7th Grade Social Studies",
    "7th Grade Visual Arts", "8th Grade Band", "8th Grade Computer Science",
    "8th Grade Creative Problem Solving", "8th Grade ELA", "8th Grade Orchestra",
    "8th Grade Physical Education", "8th Grade Science", "8th Grade Social Studies",
    "8th Grade Visual Arts", "Enhanced Algebra: Concepts and Connections"
  ].sort(),
  "High School": {
    "Math": ["Algebra: Concepts and Connections", "AP Calculus AB", "AP Calculus BC", "AP Precalculus", "AP Statistics", "Geometry: Concepts and Connections", "Multivariable Calculus", "Precalculus", "Statistics"].sort(),
    "Science": ["AP Biology", "AP Chemistry", "AP Environmental Science", "AP Physics C", "AP Physics I", "Biology", "Chemistry", "Forensics", "Human Anatomy & Physiology", "Physics I"].sort(),
    "English": ["Advanced Composition", "American Literature", "AP Language and Composition", "AP Literature and Composition", "British Literature and Composition", "World Literature"].sort(),
    "Social Studies": ["AP Human Geography", "AP Macroeconomics", "AP Psychology", "AP U.S. Government and Politics", "AP U.S. History", "AP World History", "U.S. History", "World History"].sort(),
    "Electives": ["AP Art and Design", "AP Music Theory", "Band", "Drama", "Orchestra", "Scientific Illustration", "Spanish I", "Spanish II", "Spanish III", "Spanish IV", "Turkish I", "Turkish II", "Turkish III", "Turkish IV"].sort()
  }
};

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newUser, setNewUser] = useState({ firstName: "", lastName: "", email: "", password: "FSA123", subject: [], role: "", gradeLevel: "", courseCategory: "" });
  const [editingUser, setEditingUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({ firstName: "", lastName: "", email: "", password: "", subject: [], role: "", gradeLevel: "", courseCategory: "" });
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
    setNewUser({ firstName: "", lastName: "", email: "", password: "FSA123", subject: [], role: "", gradeLevel: "", courseCategory: "" });
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
    setNewUser({ firstName: "", lastName: "", email: "", password: "FSA123", subject: [], role: "", gradeLevel: "", courseCategory: "" });
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
        subject: newUser.role === 'admin' ? ["Full Drive"] : newUser.subject,
        role: newUser.role || 'teacher',
        authProvider: "admin",
        createdAt: serverTimestamp(),
        gradeLevel: newUser.gradeLevel,
        courseCategory: newUser.courseCategory,
      });
      handleCloseAddModal();
    } catch (error) {
      console.error("Error adding user:", error);
      alert(`Error adding user: ${error.message}`);
    }
  };

  const handleDeleteUser = async (userId, uid) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteDoc(doc(db, "users", userId));
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid === uid) {
        await deleteUser(currentUser);
        navigate('/login');
      }
      setUsers(users.filter((user) => user.id !== userId));
      setFilteredUsers(filteredUsers.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(`Error deleting user: ${error.message}`);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUpdatedUser({
      ...user,
      role: user.role || 'teacher',
      subject: user.subject || [],
      gradeLevel: user.gradeLevel || "",
      courseCategory: user.courseCategory || ""
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    try {
      await updateDoc(doc(db, "users", editingUser.id), {
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
        subject: updatedUser.role === 'admin' ? ["Full Drive"] : updatedUser.subject,
        role: updatedUser.role || 'teacher',
        gradeLevel: updatedUser.gradeLevel,
        courseCategory: updatedUser.courseCategory,
      });
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error("Error saving user:", error);
      alert(`Error saving user: ${error.message}`);
    }
  };

  const handleResetPassword = async (userId) => {
    if (!window.confirm("Are you sure you want to reset this user's password to the default?")) return;
    try {
      await updateDoc(doc(db, "users", userId), {
        password: "FSA123",
      });
      alert("Password reset successfully.");
    } catch (error) {
      console.error("Error resetting password:", error);
      alert(`Error resetting password: ${error.message}`);
    }
  };

  return (
    <div>
      <h1>Users Page</h1>
      <input type="text" value={searchQuery} onChange={handleSearchChange} placeholder="Search by name or email" />
      <button onClick={handleOpenAddModal}>Add User</button>

      <table>
        <thead>
          <tr>
            <th>First</th>
            <th>Last</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map(user => (
            <tr key={user.id}>
              <td>{user.firstName}</td>
              <td>{user.lastName}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button onClick={() => handleEditUser(user)}>Edit</button>
                <button onClick={() => handleResetPassword(user.id)}>Reset</button>
                <button onClick={() => handleDeleteUser(user.id, user.uid)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2>Edit User</h2>
            <input value={updatedUser.firstName} onChange={(e) => setUpdatedUser({ ...updatedUser, firstName: e.target.value })} />
            <input value={updatedUser.lastName} onChange={(e) => setUpdatedUser({ ...updatedUser, lastName: e.target.value })} />
            <input value={updatedUser.email} onChange={(e) => setUpdatedUser({ ...updatedUser, email: e.target.value })} />
            <button onClick={handleSaveUser}>Save</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div style={modalStyle}>
          <div style={modalContentStyle}>
            <h2>Add User</h2>
            <input placeholder="First Name" value={newUser.firstName} onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })} />
            <input placeholder="Last Name" value={newUser.lastName} onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })} />
            <input placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
              <option value="">Choose role</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={handleAddUser}>Add</button>
            <button onClick={handleCloseAddModal}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

const modalStyle = {
  position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
  justifyContent: 'center', alignItems: 'center'
};

const modalContentStyle = {
  backgroundColor: 'white', padding: '20px', borderRadius: '10px', width: '400px'
};

export default UsersPage;


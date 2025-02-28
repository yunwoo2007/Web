import { useEffect, useState } from "react";
import { db } from "../utils/firebase_store";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import { auth } from "../utils/firebase_auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { FiEdit } from "react-icons/fi";
import * as XLSX from "xlsx";

const SUBJECTS = ["1st Grade", "2nd Grade", "3rd Grade", "4th Grade", "5th Grade", "Pre-Kindergarten", "Kindergarten", "6th Grade ELA", "Math 6AB", "Introduction to World Languages", "Spanish 6", "6th Grade Social Studies", "6th Grade Science", "6th Grade Band", "6th Grade Computer Science", "6th Grade Creative Problem Solving", "6th Grade Visual Arts", "6th Grade Physical Education", "6th Grade Orchestra", "Math 6B/7AB", "Math 7AB", "7th Grade ELA", "Spanish I(Middle School)", "7th Grade Social Studies", "7th Grade Science", "7th Grade Band", "7th Grade Computer Science", "7th Grade Creative Problem Solving", "7th Grade Visual Arts", "7th Grade Physical Education", "7th Grade Orchestra", "Spanish II(Middle School)"];

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const updatedUsers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(updatedUsers);
        });
        return () => unsubscribe();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = async ({ target }) => {
            const data = new Uint8Array(target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const parsedData = XLSX.utils.sheet_to_json(sheet);

            for (const row of parsedData) {
                const { Name, Email, Subject } = row;
                if (!Name || !Email || !Subject) {
                    alert("All fields (Name, Email, Subject) must be filled!");
                    return;
                }
                if (!Email.endsWith("@gmail.com")) {
                    alert("Only Gmail addresses are allowed!");
                    return;
                }
                const subjectList = Subject.split(",").map(sub => sub.trim()).filter(sub => SUBJECTS.includes(sub));
                
                if (subjectList.length === 0) {
                    alert(`Invalid subject for user ${Name}. Check the subject list.`);
                    return;
                }
                
                try {
                    const userCredential = await createUserWithEmailAndPassword(auth, Email, "defaultPassword123");
                    const userId = userCredential.user.uid;
                    await addDoc(collection(db, "users"), {
                        id: userId,
                        name: Name,
                        email: Email,
                        subject: subjectList
                    });
                } catch (error) {
                    console.error("Error adding user:", error);
                    alert(error.message);
                }
            }
            alert("Users uploaded successfully!");
            setIsBulkUploadModalOpen(false);
        };
        reader.readAsArrayBuffer(file);
    };

    return (
        <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
            <div className="flex justify-between w-full max-w-6xl mb-6">
                <h2 className="text-3xl font-bold text-gray-800">Manage Users</h2>
                <div className="flex gap-4">
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg shadow-md transition"
                        onClick={() => setIsBulkUploadModalOpen(true)}
                    >
                        📂 Bulk Upload
                    </button>
                </div>
            </div>
            
            {isBulkUploadModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h4 className="text-lg font-semibold text-gray-700 mb-4">Upload CSV/Excel</h4>
                        <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} />
                        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg" onClick={() => setIsBulkUploadModalOpen(false)}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UsersPage;

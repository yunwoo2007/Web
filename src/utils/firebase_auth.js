import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

import { db } from "./firebase_store";
import { firebaseConfig} from "./f_config";
import { 
  addDoc,
  collection,
  getDoc,
  setDoc,
  doc,
  query,
  where,
  getDocs 
} from "firebase/firestore";





const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();


//전체 회원 조회
const getAllUsers = async () => {
  const usersRef = collection(db, "users");
  const querySnapshot = await getDocs(usersRef);
  console.log(querySnapshot.docs.map((doc) => doc.data()));
  return querySnapshot.docs.map((doc) => doc.data());
};


//로그인
const signIn = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      console.log("사용자 정보:", userData);
      if(userData.subject.length == 0){
        alert("You don't have any subject");
        return false;
      }
      localStorage.setItem('subject', JSON.stringify(userData.subject));
    } else {
      console.log("해당 이메일의 사용자를 찾을 수 없습니다.");
    }
    


    
    alert("sign in success");
    console.log(result);
    return true;
  } catch (error) {
    alert("check your email or password");
    console.error(error);
    return false;
  }
};


const signInWithGoogle = async () => {
  console.log("signInWithGoogle");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    console.log(result);
    console.log(result.user.email);
    if(result){
      try {

        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", result.user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          // 사용자가 존재함  
          alert("already exist user");
          return false;
        }

  

        // 사용자 정보를 Firestore에 저장
        await addDoc(collection(db, "users"), {
          email: result.user.email,
          authProvider: 'google',
          password: "",
          createdAt: new Date(),
          subject:''
        });

        alert("sign up success");
        
      } catch (error) {
        console.error("Error adding document: ", error);
      }
    }
    //user 에 저장
    console.log(result);
    return true;
  } catch (error) {
    alert(error);
    console.error(error);
    return false;
  }
};

const signUp = async (name,email, password) => {

  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", result.user.email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // 사용자가 존재함  
      alert("already exist user");
      return false;
    }



    // 사용자 정보를 Firestore에 저장
    await setDoc(doc(collection(db, "users"), `${name}_${result.user.email}`), {
      name: name,
      email: result.user.email,
      authProvider: 'web',
      password: password,
      createdAt: new Date(),
      subject:[]
    });

    alert("sign up success");


    return true;
  } catch (error) {
    alert("already exist user");
    console.error(error);

    return false;
  }
};

export { auth, signInWithGoogle, signIn, signUp ,getAllUsers};

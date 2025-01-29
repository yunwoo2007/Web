import { useEffect,useState} from "react";
import { getAllUsers } from "../utils/firebase_auth";


function UsersPage(){

    const [users, setUsers] = useState([]);


    const init = async () => {
        const users = await getAllUsers();
        setUsers(users);
    }

    useEffect(()=>{
        init();
    },[])

    return (
        <div style={{textAlign: "center"}}>
            <h2>Teachers</h2>
            
            <div style={{width:'1000px',display: 'flex', flexDirection: 'row', flexWrap: 'wrap',margin:'0 auto'}}>
                
                
                
                {users.map((user) => (
                    <div key={user.id} className="teacher-card">
                        <div>
                            <h3>Teacher Information</h3>
                            <p>ID: <strong>{user.id}</strong></p>
                            <p>Name: <strong>{user.name}</strong></p>
                            <p>Subject: <strong>{user.subject.join(', ')}</strong></p>
                        </div>
                    </div>
                ))}
               
            </div>
        </div>
    )

   
};

export default UsersPage;

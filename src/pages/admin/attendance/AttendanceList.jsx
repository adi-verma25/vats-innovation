import { useEffect,useState } from "react";
import { db } from "../../../firebase/firebase";

import {
collection,
getDocs
} from "firebase/firestore";


export default function AttendanceList(){

const [attendance,setAttendance]=useState([]);



const getAttendance=async()=>{

const data=await getDocs(
collection(db,"attendance")
);


setAttendance(
data.docs.map(doc=>({
id:doc.id,
...doc.data()
}))
);


};



useEffect(()=>{

getAttendance();

},[]);



return(

<div>

<h1>
Attendance Report
</h1>


{
attendance.map((item)=>(

<div key={item.id}>

<p>
Employee: {item.employee}
</p>

<p>
Date: {item.date}
</p>

<p>
Time: {item.time}
</p>

<p>
Status: {item.status}
</p>

<hr/>

</div>

))

}


</div>

)

}
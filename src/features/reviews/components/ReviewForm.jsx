import { useState } from "react";
import { addReview } from "../api/review.service";

export default function ReviewForm(){

 const [comment,setComment]=useState("");

 const submit=()=>{
   addReview({
     comment,
     rating:5
   });
 };

 return(
   <div>
     <textarea
       onChange={(e)=>setComment(e.target.value)}
     />
     <button onClick={submit}>
       Add Review
     </button>
   </div>
 );
}
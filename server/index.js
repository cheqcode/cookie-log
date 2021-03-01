const express=require("express")
const mysql=require("mysql")
const cors=require("cors")

const bcrypt=require("bcrypt")
const saltRounds=10
 
const bodyParser=require("body-parser")
const cookieParser=require("cookie-parser")
const session=require("express-session")


const app=express()

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  key:"userId",
  secret:"subscriber",
  resave:false,
  saveUninitialized:false,
  cookie:{
      expires:60*1000*60*24,
  }
}))

app.use(
    cors({
    origin:["http://localhost:3000"],
    methods:["GET","POST"],
    credentials:true,
}))



const db=mysql.createConnection({
    user:"kepha",
    host:"localhost",
    password:"Password123@#",
    database:"okoth"
})

app.post("/register",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    
    bcrypt.hash(password,saltRounds,(err, hash)=>{
        if(err){
            console.log(err)
        }
        db.query('INSERT INTO register (username, password) VALUES (?,?)',[username, hash],(err, result)=>{
            console.log(err)
        })
    })

})

app.get("/login",(req,res)=>{
    if(req.session.user){
         res.send({loggedIn:true, user:req.session.user})
    }else{
         res.send({loggedIn:false})
    }
})

app.post("/login",(req,res)=>{
    const username=req.body.username;
    const password=req.body.password;

    db.query('SELECT * FROM register WHERE username = ?', username,
    (err, result)=>{
        if(err){
        res.send({err:err})
        }

            if(result.length > 0){
                bcrypt.compare(password, result[0].password, (error,response)=>{
                   if(response){
                       req.session.user=result;
                       res.send(result)
                       
                   }else{
                    res.send({message:"Wrong username/password combination"})
                   }
                })
            }else{
                res.send({message:"User doesn't exist"})
            }
        
    })

})



app.listen(4000,()=>{
    console.log("server running on port 4000")
})
//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
const app = express();
const dotenv =require('dotenv');
const { MongoClient, ServerApiVersion } = require("mongodb");
app.set('view engine', 'ejs');
dotenv.config();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
const uri = "mongodb+srv://"+process.env.D_USER+":"+process.env.PASSWORD +"@cluster0.8zcvxq2.mongodb.net/todolistDB";
mongoose.connect(uri,{useNewUrlParser:true });

const itemSchema = mongoose.Schema({
  name:{
    type:String,
    required:true
  }
});

const listsSchema = mongoose.Schema({
  name:String,
  items: [itemSchema]
})


const Item = mongoose.model("Item",itemSchema);
const List = mongoose.model("List",listsSchema);
const item1 = new Item({name:"Welcome to you TodoList."});
const item2 = new Item({name:"Hit the + to add new item."});
const item3 = new Item({name:"<-- Hit this to delete an item."});
const defaultArray =  [item1,item2,item3];

app.get("/", async function(req, res) {

  const day = date.getDate();
  const foundItems = await Item.find();
    if(foundItems.length == 0){
        Item.insertMany(defaultArray).then(function(err,docs){
          if(err){
            console.log(err);   
          }
          else{
            console.log("Successfully saved to DB");
          }
        });   
        res.redirect("/");
    }
    else{
      res.render("list", {listTitle: day, newListItems: foundItems});
    }
 

});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem =  new Item({name:itemName});
  const query  = await List.findOne({name:listName});
  if(query){
    query.items.push(newItem);
    query.save();
    res.redirect("/"+listName);
  }
  else{
    Item.insertMany([newItem]);
    res.redirect("/");
  }
});

app.post("/delete",async function(req,res){
  const id = req.body.checkbox;
  const listName = req.body.listName;
  const li = await List.findOne({name:listName});
  if(li){
      const q = await List.findOneAndUpdate({name:listName},{$pull: {items:{_id:id}}});
      res.redirect("/"+listName);
  }
  else{
    const query = await Item.findOneAndDelete({_id:id}); 
    res.redirect("/");
  }
})

app.get("/:listName",async function(req,res){
  const listName = _.capitalize(req.params.listName);
  const doc =await List.find({name:listName});
  if(doc.length == 0){
      const newList = new List({
        name:listName,
        items:defaultArray
      })
      List.insertMany(newList);
      res.redirect("/"+listName);
      
    }
    else{
      res.render("list", {listTitle: listName, newListItems: doc[0]["items"]});
    }
  
  

})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});

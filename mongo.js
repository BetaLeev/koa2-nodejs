var dbUrl  = 'mongodb://127.0.0.1:27017'
var dbName = 'koa'
MongoClient.connect(dbUrl,(err,client)=>{
    if(err){
        console.log(err);
        return;
    }
    var db = client.db(dbName);
    var time;
    console.time(time)
    var result = db.collection('user').find({});
    result.toArray((err,docs)=>{
      console.log(docs);
    })
    console.timeEnd(time)
})



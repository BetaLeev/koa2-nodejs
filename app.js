const Koa = require('koa');
const Router = require('koa-router');
const views = require('koa-views');
const BodyParser = require('koa-bodyparser');
const static = require('koa-static');
const render = require('koa-art-template');
const session = require('koa-session');
const MongoClient = require('mongodb').MongoClient;
const path = require('path');
const app = new Koa();
const router = new Router();

DB = require('./module/db');

// var dbUrl  = 'mongodb://127.0.0.1:27017'
// var dbName = 'koa'
// MongoClient.connect(dbUrl,(err,client)=>{
//     if(err){
//         console.log(err);
//         return;
//     }
//     var db = client.db(dbName);
//     db.collection('user').insert({
//         'name':'leev',
//         'sex':'male',
//         'age':'99',
//         'status':'1'
//     },(err,resulte)=>{
//         if(!err){
//             console.log('insert scuessfully')
//         }
//     })
// })
render(app,{
    root:path.join(__dirname,'view'),
    extname:'.html',
    debug: process.env.NODE_ENV !== 'production'
})

app.keys = ['leev']
const CONFIG = {
    key:'koa:sess',
    maxAge:8000,
    overwrite:true,
    httpOnly:true,
    signed:true,
    rolling:false,
    renew:false
}


app.use(async(ctx,next)=>{
    ctx.state.name = 'web'
    await next();
})

router
.get('/',async(ctx)=>{
   var result = await DB.find('user',{});
   await ctx.render('index',{
    list:result
   })
})
.get('/login',async(ctx)=>{
    ctx.session.userinfo = 'leev';
    let name = ctx.session.userinfo;
    await ctx.render('login',{
        name:name
    })
})

.get('/add',async(ctx)=>{
    await ctx.render('add');
})

.post('/doAdd',async(ctx)=>{
    let data =await DB.insert('user',ctx.request.body);
    try {
        if(data.result.ok){
            ctx.redirect('/');
        }
    } catch (error) {
        console.log(error.log)
        ctx.redirect('/add');
    }
})

.get('/edit',async(ctx)=>{
    let id = ctx.query.id;
    let data = await DB.find('user',{'_id':DB.getObjectId(id)});
    await ctx.render('edit',{
        list:data[0]
    });
    console.log(data);
    console.log(data[0]);

})

.post('/doEdit',async(ctx)=>{
    let id =   ctx.request.body.id;
    let name = ctx.request.body.name;
    let sex = ctx.request.body.sex;
    let age = ctx.request.body.age;
    let data = await DB.update('user',{'_id':DB.getObjectId(id)},{
        name,sex,age
    })
    try {
        if(data.result.ok){
            ctx.redirect('/');
        }
    } catch (error) {
        console.log(error)
    }
})

.get('/delete',async(ctx)=>{
    let id = ctx.query.id;
    var data = await DB.delete('user',{'_id':DB.getObjectId(id)})
    try {
        if(data.result.ok){
            ctx.redirect('/')
        }
    } catch (error) {
        console.log(error)
        ctx.redirect('/')
    }

})

.get('*',async(ctx)=>{
    ctx.body = "不存在";
})



const port = 3000
app
.use(session(CONFIG,app))
.use(static(__dirname + '/static'))
.use(BodyParser())
.use(router.routes())
.use(router.allowedMethods)
.listen(port) 


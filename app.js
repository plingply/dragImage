var express = require("express");
var app = express();
var fs = require("fs");
var querystring = require('querystring');
var upLoadFun = require("./module/upLoadFun.js");
var gm = require('gm').subClass({ imageMagick: true });

//设置静态资源
app.use(express.static(__dirname + "/public"));
//设置模板路由
app.set("views", __dirname + "/view/");
//设置html模板
app.engine('html', require('ejs').__express);
app.set('views engine', 'html');

app.get("/", function(req, res) {
    res.render("index.html")
})
app.get("/m", function(req, res) {
    res.render("mobile.html")
})
app.post("/uploadimg", function(req, res) {
    upLoadFun(req, res, __dirname, { //函数调用，必须传req,res,__dirname否则就会报错
        fileFun: function(text, arr, url) { //处理上传文件的函数
            var x1 = text.cut_pos.split(",")[0];
            var y1 = text.cut_pos.split(",")[1];
            var w = text.cut_pos.split(",")[2];
            var h = text.cut_pos.split(",")[3];
            var nw, nh;
            gm(__dirname + "/public/img/source.jpg")
                .size(function(err, size) {
                    if (!err) {
                        gm(__dirname + "/public/img/source.jpg")
                            .crop(200, 200, x1, y1)
                            .write(__dirname + "/public/img/l.jpg", function(err) {});
                    } else {
                        console.log(err)
                    }
                })
        },
        fileUrl: "/public/upload/",
        maxFieldSize: 2 * 1024 * 1024
    })
})
app.post("/dragImage", function(req, res) {
    var data = "";
    req.on('data', function(chunk) {
        data += chunk;
    })
    req.on('end', function() {
        data = querystring.parse(data);
        gm(__dirname + "/public/img/" + data.name)
            .size(function(err, size) {
                if (!err) {
                    if (size.width < data.w) {
                        gm(__dirname + "/public/img/" + data.name)
                            .resize(data.img_w)
                            .write(__dirname + "/public/img/" + data.name, function(err) {
                                gm(__dirname + "/public/img/" + data.name)
                                    .crop(data.w, data.h, data.x1, data.y1)
                                    .write(__dirname + "/public/img/meizi.jpg", function(err) {
                                        if(data.name == "meizi.jpg"){
                                            res.send("1");
                                            return;
                                        }
                                        fs.unlink(__dirname + "/public/img/" + data.name,function(){
                                            res.send("1");
                                        })
                                    })
                            })

                    } else {
                        gm(__dirname + "/public/img/" + data.name)
                            .crop(data.w * size.width / data.img_w, data.w * size.width / data.img_w, data.x1 * size.width / data.img_w, data.y1 * size.height / data.img_h)
                            .write(__dirname + "/public/img/meizi.jpg", function(err) {
                                if(data.name == "meizi.jpg"){
                                    res.send("1");
                                    return;
                                }
                                fs.unlink(__dirname + "/public/img/" + data.name,function(){
                                    res.send("1");
                               })
                            })
                    }
                } else {
                    console.log(err)
                }
            })
    })
})
//上传图片
app.post("/uploadImgs",function(req,res,next){
    upLoadFun(req, res, __dirname, { //函数调用，必须传req,res,__dirname否则就会报错
        fileFun: function(text, arr, url) { //处理上传文件的函数
            res.send(url)
        },
        fileUrl: "/public/img/",
        maxFieldSize: 2 * 1024 * 1024
    })
})
app.listen(5000);
console.log("THERE+5000")

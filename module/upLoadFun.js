var formidable = require('formidable');
var path = require("path"); //路径解析
var fs = require("fs");

function uploadFuc(req, res, dirname, a) {
    var form = new formidable.IncomingForm();
    var urls = "/public/upload/";
    form.encoding = "utf-8"; //设置编码方式
    form.uploadDir = path.join(dirname, a.fileUrl || urls); //设置文件存放路径
    form.keepExtensions = true;
    form.maxFieldSize = a.maxFieldSize || (2 * 1024 * 1024); //限制所有存储表单字段域的大小（除去file字段），如果超出，则会触发error事件，默认为2M
    form.maxFields = 1000; //设置可以转换多少查询字符串，默认为1000
    form.hash = false; //设置上传文件的检验码，可以有两个取值'sha1' or 'md5'.
    form.multiples = true; //开启该功能，当调用form.parse()方法时，回调函数的files参数将会是一个file数组，数组每一个成员是一个File对象，此功能需要 html5中multiple特性支持。
    /*
        form.bytesReceived 返回服务器已经接收到当前表单数据多少字节
        form.bytesExpected 返回将要接收到当前表单所有数据的大小
    */
    form.parse(req, function(err, field, files) { //该方法会转换请求中所包含的表单数据，callback会包含所有字段域和文件信息
        //console.log(field);//存放普通数据
        //console.log(files);//存放文件的对象
        var fl = [];//新建存放文件的数组
        var urlArr = [];//修改后文件名称数组
        for (key in files) {//遍历当前提交表单中 所有文件！
            var fls = files[key];//存放文件的对象或数组
            if (fls instanceof Array) {
                fl = fl.concat(fls);
            }else{
                if(fls.size != 0){//判断当前文件对象为空
                    fl.push(fls);
                } 
            }
        }
        for (var i = 0; i < fl.length; i++) {
                    var tt = new Date().getTime();
                    fs.renameSync(fl[i].path, dirname + (a.fileUrl || urls) + tt + fl[i].name);
                    urlArr.push(tt + fl[i].name);
        }
        a.fileFun ? a.fileFun(field, fl, urlArr) : "";
    })
    form.on("end", function() {
        a.endFun ? a.endFun() : "";
    })
}
module.exports = uploadFuc;
/*  
    var a = {
        fileFun:function(text,arr){},//text为数据 arr文件
        endFun:function(){},//处理完成回调
        fileUrl:"",//设置文件存放路径
        maxFieldSize:2*1024*1024//限制文件尺寸
    }
    uploadFuc(req,res,__dirname,{//函数调用，必须传req,res,__dirname否则就会报错
        
        fileFun:function(text,arr,url){ //text上传的数据   arr文件  url默认处理过的文件名称
            console.log(arr)
        },
        endFun:function(){
            res.setHeader('Content-Type', 'text/html;charset=utf8');
            res.end("<h1>上传成功！</h1>")
        },
        fileUrl:"/../public/upload/",
        maxFieldSize:2*1024*1024
    })
*/

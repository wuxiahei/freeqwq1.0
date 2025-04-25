const express = require('express');
const path = require('path');
const app = express();

// 设置模板引擎
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/ppt-generator'));

// 处理静态文件
app.use('/static', express.static(path.join(__dirname, 'public/ppt-generator/static')));

// 渲染index页面
app.get('/ppt-generator/index.html', (req, res) => {
    res.render('index', {
        VITE_DOCMEE_API_KEY: process.env.VITE_DOCMEE_API_KEY
    });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
}); 
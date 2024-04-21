import express from 'express';

const router = express.Router({});

// 渲染主页面
router.get('/', (req, res) => {
  res.render('index.html');
});

router.get('/shell/api/base/test', async (req, res, next) => {
  res.json({
    msg: 'done'
  });
});

export default router;

const mysql = require('mysql2');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
var dayjs = require('dayjs');

const app = express();
const port = 8081; // 可以根据需要更改端口号

// MySql Database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'k658256',
  database: 'drugs' // 数据库名称
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('数据库连接失败：', err);
    return;
  }
  console.log('Database connects successfully！');
});

app.use(cors());
app.use(bodyParser.json());

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // 后端可以对password进行加密
  const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
  connection.query(query, [username, password], (error, results) => {
    if (error) {
      res.status(500).send({ success: false, message: 'Server error' });
    } else if (results.length > 0) {
      res.send({ success: true });
    } else {
      res.send({ success: false, message: 'Username or Password Error!' });
    }
  });
});

// Fetch all the drugs
app.get('/drugs', (req, res) => {
  connection.query('SELECT * FROM drugs', (err, results) => {
    if (err) {
      console.error('查询drugs数据失败：', err);
      res.status(500).json({ message: '查询drugs数据失败' });
      return;
    }
    res.json(results);
  });
});

// Fetch and group data
app.get('/data', (req, res) => {
  connection.query('SELECT * FROM statistic', (err, results) => {
    if (err) {
      console.error('Fetch data error：', err);
      res.status(500).json({ message: 'Fetch data error' });
      return;
    }

    const groupedData = {
      group1: [], // used_by_factory=0, isAdd=0
      group2: [], // used_by_factory=0, isAdd=1
      group3: [], // used_by_factory=1, isAdd=0
      group4: []  // used_by_factory=1, isAdd=1
    };

    results.forEach(row => {
      if (row.used_by_factory === 0 && row.isAdd === 0) {
        groupedData.group1.push(row);
      } else if (row.used_by_factory === 0 && row.isAdd === 1) {
        groupedData.group2.push(row);
      } else if (row.used_by_factory === 1 && row.isAdd === 0) {
        groupedData.group3.push(row);
      } else if (row.used_by_factory === 1 && row.isAdd === 1) {
        groupedData.group4.push(row);
      }
    });

    res.json(groupedData);
  });
});


// Add drug
app.post('/drugs/:id/add', (req, res) => {
  const id = parseInt(req.params.id);
  const { amount } = req.body;
  const time = dayjs().format('YYYY-MM-DD | HH:mm:ss');
  const date = dayjs().format('YYYY-MM');

  // 查询药剂的 drugName 和 used_by_factory
  connection.query('SELECT drugName, used_by_factory FROM drugs WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('查询药剂信息失败：', err);
      res.status(500).json({ message: '查询药剂信息失败' });
      return;
    }
    
    const drugInfo = results[0];
    if (!drugInfo) {
      res.status(404).json({ message: '药剂不存在' });
      return;
    }

    connection.query('UPDATE drugs SET stock = stock + ?, time = ? WHERE id = ?', [amount, time, id], (err) => {
      if (err) {
        console.error('补充药剂失败：', err);
        res.status(500).json({ message: '补充药剂失败' });
        return;
      }

      // add data to the Dashboard
      connection.query(
        'INSERT INTO statistic (drugName, used_by_factory, isAdd, date, stock) VALUES (?, ?, ?, ?, ?)',
        [drugInfo.drugName, drugInfo.used_by_factory, 1, date, amount],
        (err) => {
          if (err) {
            console.error('插入统计数据失败：', err);
            res.status(500).json({ message: '插入统计数据失败' });
            return;
          }

          res.json({ message: '药剂补充成功' });
        }
      );
    });
  });
});

// Consume drug
app.post('/drugs/:id/consume', (req, res) => {
  const id = parseInt(req.params.id);
  const { amount } = req.body;
  const time = dayjs().format('YYYY-MM-DD | HH:mm:ss');
  const date = dayjs().format('YYYY-MM');

  // 查询药剂的 drugName 和 used_by_factory
  connection.query('SELECT drugName, used_by_factory FROM drugs WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('查询药剂信息失败：', err);
      res.status(500).json({ message: '查询药剂信息失败' });
      return;
    }
    
    const drugInfo = results[0];
    if (!drugInfo) {
      res.status(404).json({ message: '药剂不存在' });
      return;
    }

  connection.query('UPDATE drugs SET stock = stock - ?, time = ? WHERE id = ?', [amount, time, id], (err) => {
      if (err) {
        console.error('消耗药剂失败：', err);
        res.status(500).json({ message: '消耗药剂失败' });
        return;
      }

      // add data to the Dashboard
      connection.query(
        'INSERT INTO statistic (drugName, used_by_factory, isAdd, date, stock) VALUES (?, ?, ?, ?, ?)',
        [drugInfo.drugName, drugInfo.used_by_factory, 0, date, amount],
        (err) => {
          if (err) {
            console.error('插入统计数据失败：', err);
            res.status(500).json({ message: '插入统计数据失败' });
            return;
          }

          res.json({ message: '药剂消耗成功' });
        }
      );
    });
  });
});

// Edit drug
app.put('/drugs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { drugName, drugSpecification, drugPrice } = req.body;
  // 生成一个time,类型为string
  const time = dayjs().format('YYYY-MM-DD | HH:mm:ss')

  connection.query('UPDATE drugs SET drugName = ?, drugSpecification = ?, drugPrice = ?, time = ? WHERE id = ?',
    [drugName, drugSpecification, drugPrice, time, id], (err, results) => {
    if (err) {
      console.error('编辑药剂失败：', err);
      res.status(500).json({ message: '编辑药剂失败' });
      return;
    }
    res.json({ message: '药剂编辑成功' });
  });
});

// Delete drug
app.delete('/drugs/:id', (req, res) => {
  const id = parseInt(req.params.id);
  connection.query('DELETE FROM drugs WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('删除药剂失败：', err);
      res.status(500).json({ message: '删除药剂失败' });
      return;
    }
    res.json({ message: '药剂删除成功' });
  });
});

// Create a new drug
// id and time are needed
app.post('/drugs/new', (req, res) => {
  const { drugName, drugSpecification, drugPrice, stock, used_by_factory } = req.body;
  
  // 检查是否所有字段都已提供
  if (!drugName || !drugSpecification || !drugPrice || !stock || used_by_factory === undefined) {
    res.status(400).json({ message: '所有字段都必须填写' });
    return;
  }

  // 生成一个time,类型为string
  const time = dayjs().format('YYYY-MM-DD | HH:mm:ss')
  
  // 获取所有的ID并找到最小的空缺ID
  connection.query('SELECT id FROM drugs ORDER BY id', (err, results) => {
    if (err) {
      console.error('获取ID列表失败：', err);
      res.status(500).json({ message: '获取ID列表失败' });
      return;
    }

    let newId = 1; // 从1开始寻找最小的空缺ID
    for (let i = 0; i < results.length; i++) {
      if (results[i].id !== newId) {
        break; // 找到空缺ID
      }
      newId++;
    }

    connection.query('INSERT INTO drugs (id, drugName, drugSpecification, drugPrice, stock, used_by_factory, time) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [newId, drugName, drugSpecification, drugPrice, stock, used_by_factory, time], (err, results) => {
      if (err) {
        console.error('新增药剂失败：', err);
        res.status(500).json({ message: '新增药剂失败' });
        return;
      }
      res.json({ message: '药剂新增成功', id: newId });
    });
  });
});

app.listen(port, () => {
  console.log(`Sever is running on: http://localhost:${port}`);
});

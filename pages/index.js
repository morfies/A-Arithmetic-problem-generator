import Head from 'next/head';
import React from 'react';
import { Button, Checkbox, InputNumber, Form, Spin } from 'antd';
import styles from '../styles/Home.module.css';

const operatorOpts = [
  { label: 'Plus', value: '+' },
  { label: 'Minus', value: '-' },
  { label: 'Mutiply', value: '*' },
  { label: 'Divide', value: '/' },
];

export default function Home() {
  const { useState } = React;
  const [result, setResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleGenerate = async (values) => {
    const { count, from, to, op } = values;
    setResult([]);
    setLoading(true);
    const dupChecker = new Set();
    for (let i = 0; i < count; ) {
      const left = Math.floor(Math.random() * (to - from)) + from;
      const right = Math.floor(Math.random() * (to - from)) + from;
      const operator = op[Math.floor(Math.random() * op.length)];
      if (operator === '-' && left <= right) {
        continue;
      }
      const row = `${left} ${operator} ${right} = `;
      if (!dupChecker.has(row)) {
        dupChecker.add(row);
        i++;
      }
    }
    const quote = await getQuote();
    const problems = Array.from(dupChecker);
    const batches = batchArray(problems, 4);
    draw(batches, quote);
    setLoading(false);
  };
  return (
    <div className={styles.container}>
      <Head>
        <title>Arithmetic Generator</title>
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Arithmetic Generator</h1>
        <p className={styles.description}>
          Your kid's arithmetic practice is just one click away!
        </p>
        <Spin spinning={loading} tip="Generating">
          <Form
            form={form}
            initialValues={{
              count: 20,
              op: ['+', '-'],
              from: 4,
              to: 20,
            }}
            name="main"
            labelCol={{ span: 8 }}
            wrapperCol={{ span: 24 }}
            style={{ maxWidth: 600 }}
            onFinish={handleGenerate}
          >
            <Form.Item label="How many" name="count">
              <InputNumber max={72} min={10} />
            </Form.Item>
            <Form.Item label="Number range" style={{ marginBottom: 0 }}>
              <Form.Item
                label={
                  <span style={{ color: 'green', fontWeight: 'bold' }}>
                    from
                  </span>
                }
                name="from"
                colon={false}
                style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
              >
                <InputNumber style={{ width: '100%' }} placeholder="from" />
              </Form.Item>
              <Form.Item
                label={
                  <span style={{ color: 'green', fontWeight: 'bold' }}>to</span>
                }
                name="to"
                colon={false}
                style={{
                  display: 'inline-block',
                  width: 'calc(50% - 8px)',
                  margin: '0 8px',
                }}
              >
                <InputNumber style={{ width: '100%' }} placeholder="to" />
              </Form.Item>
            </Form.Item>
            <Form.Item label="Operators" name="op">
              <Checkbox.Group options={operatorOpts}></Checkbox.Group>
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8 }}>
              <Button type="primary" htmlType="submit" style={{ width: 200 }}>
                Generate
              </Button>
            </Form.Item>
          </Form>
        </Spin>
        <div className={styles.result}>
          {/* {result.map((row) => (
            <div key={row}>{row}</div>
          ))} */}
          <canvas id="canvas" width="794" height="1123"></canvas>
        </div>
      </main>
    </div>
  );
}

// each line will contain 4 problems
function draw(cols, quote) {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  // Set the background color to white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Set the font and text color
  ctx.font = '16px Arial';
  ctx.fillStyle = '#000000';
  if (quote) {
    const title = `${quote.content}  --- ${quote.from}`;
    ctx.fillText(title, 30, 30);
  }
  ctx.font = '24px Arial';
  cols.map((col, i) => {
    const offset = 90 + i * 60;
    // 1
    ctx.fillText(col[0], 50, offset);
    col[1] && ctx.fillText(col[1], 220, offset);
    col[2] && ctx.fillText(col[2], 390, offset);
    col[3] && ctx.fillText(col[3], 560, offset);
  });
}

function batchArray(array, batchSize) {
  var batches = [];
  for (var i = 0; i < array.length; i += batchSize) {
    var batch = array.slice(i, i + batchSize);
    batches.push(batch);
  }
  return batches;
}

async function getQuote() {
  try {
    const response = await fetch('https://v1.hitokoto.cn/');
    const data = await response.json();
    const { hitokoto, from } = data;
    return { content: hitokoto, from };
  } catch (e) {}
}

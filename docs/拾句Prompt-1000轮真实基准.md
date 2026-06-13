# 拾句 Prompt：1000 轮真实模型基准

## 当前状态

**测试集已建立，模型调用尚未成功执行。**

原因：本地 Windows 沙箱持续无法启动命令，沙箱外运行请求也两次超时。因此本文不提供虚构的通过率。

## 测试构成

- 25 个应入选的文学句种子；
- 25 个必须拒绝的普通句种子；
- 每个种子进入 20 种不同上下文；
- 共计 `25 × 20 × 2 = 1000` 个模型调用案例。

上下文专门检查：

- 候选位于开头、正文中间或结尾；
- 标题和文末总结效应；
- 引用、现成名句和他人发言干扰；
- 流水账、待办事项、情绪宣泄和自夸干扰；
- 中英混写、口语和玩笑干扰；
- 同一句在不同周边文本中能否保持稳定判断。

## 判定标准

- 文学案例：模型必须逐字返回指定文学句，不能改写或遗漏；
- 普通案例：模型必须返回空数组；
- 任意额外乱选均视为失败；
- 任意改写、拼接或错归作者均视为失败。

## 运行文件

`tests/quote-literary-benchmark.mjs`

运行后输出：

- `tmp/quote-literary-benchmark/summary.json`
- `tmp/quote-literary-benchmark/results.json`
- `tmp/quote-literary-benchmark/failures.json`

## 运行命令

```powershell
$env:BENCHMARK_API_KEY='模型接口密钥'
$env:BENCHMARK_MODEL='实际使用的模型名'
node tests/quote-literary-benchmark.mjs
```

在取得真实输出前，不应继续根据想象修改 Prompt。
